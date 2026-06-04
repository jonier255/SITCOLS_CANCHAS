
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../../config/env.js'
import { authRepository } from './auth.repository.js'
import {
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  CreateOwnerDto,
  CreateStaffDto,
} from './auth.schema.js'
import { JwtPayload, TokenPair, AuthResponse } from './auth.types.js'
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '../../shared/utils/app-error.js'
import { venuesRepository } from '../venues/venues.repository.js'
const SALT_ROUNDS = 12


function generateTokens(payload: JwtPayload): TokenPair {
  const accessToken = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
  const refreshToken = jwt.sign(
    { sub: payload.sub },
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  )
  return { accessToken, refreshToken }
}

function getRefreshTokenExpiry(): Date {
  const raw = env.JWT_REFRESH_EXPIRES_IN
  const match = raw.match(/^(\d+)([dhm])$/)
  if (!match) throw new Error('JWT_REFRESH_EXPIRES_IN inválido. Usa: 7d, 24h, 60m')
  const value = parseInt(match[1]!, 10)
  const unit = match[2]
  const ms = unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : 60000
  return new Date(Date.now() + value * ms)
}

function generateTemporaryPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pass = ''
  for (let i = 0; i < 10; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)]
  }
  return pass + '1A'
}

function formatAuthResponse(
  user: { id: string; email: string; fullName: string; role: import('@prisma/client').Role; avatarUrl: string | null },
  tokens: TokenPair,
): AuthResponse {
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
    tokens,
  }
}


export const authService = {
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await authRepository.findUserByEmail(dto.email)
    if (existing) throw new ConflictError('Ya existe una cuenta con este email')

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const user = await authRepository.createUser({
      ...dto,
      passwordHash,
      role: 'CLIENT',
    })

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }
    const tokens = generateTokens(payload)
    await authRepository.createRefreshToken({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    })

    return formatAuthResponse(user, tokens)
  },

  async createOwner(dto: CreateOwnerDto): Promise<{ user: object; temporaryPassword: string }> {
    const existing = await authRepository.findUserByEmail(dto.email)
    if (existing) throw new ConflictError('Ya existe una cuenta con este email')

    const temporaryPassword = dto.temporaryPassword ?? generateTemporaryPassword()
    const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS)

    const user = await authRepository.createUser({
      email: dto.email,
      fullName: dto.fullName,
      phone: dto.phone,
      passwordHash,
      role: 'OWNER',
    })

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      temporaryPassword,
    }
  },

 async createStaff(
  dto: CreateStaffDto,
  venueId: string,
): Promise<{ user: object; temporaryPassword: string }> {
  const existing = await authRepository.findUserByEmail(dto.email)
  if (existing) throw new ConflictError('Ya existe una cuenta con este email')
 
  const temporaryPassword = dto.temporaryPassword ?? generateTemporaryPassword()
  const passwordHash = await bcrypt.hash(temporaryPassword, SALT_ROUNDS)
 
  const user = await authRepository.createUser({
    email: dto.email,
    fullName: dto.fullName,
    phone: dto.phone,
    passwordHash,
    role: 'STAFF',
    //mustChangePassword: true,
  })
 
    // Nota: la relación StaffMember con el venue se crea en el módulo venues/staff
    // cuando el schema completo esté listo. Por ahora el usuario queda creado con rol STAFF.
    // venueId se recibe para cuando se integre con StaffMember.
    
    await venuesRepository.addStaffMember(venueId, user.id)
    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      temporaryPassword,
    }
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await authRepository.findUserByEmail(dto.email)
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Credenciales inválidas')
    }
    if (!user.isActive) throw new UnauthorizedError('Cuenta desactivada')

    const isValid = await bcrypt.compare(dto.password, user.passwordHash)
    if (!isValid) throw new UnauthorizedError('Credenciales inválidas')

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }
    const tokens = generateTokens(payload)
    await authRepository.createRefreshToken({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    })

    return formatAuthResponse(user, tokens)
  },

  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET)
    } catch {
      throw new UnauthorizedError('Refresh token inválido o expirado')
    }

    const stored = await authRepository.findRefreshToken(refreshToken)
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token revocado o expirado')
    }

    const user = stored.user
    if (!user.isActive) throw new UnauthorizedError('Cuenta desactivada')

    await authRepository.deleteRefreshToken(refreshToken)

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    }
    const newTokens = generateTokens(payload)
    await authRepository.createRefreshToken({
      token: newTokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    })

    return newTokens
  },

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await authRepository.findUserById(userId)
    if (!user || !user.passwordHash) throw new NotFoundError('Usuario')

    const isValid = await bcrypt.compare(dto.currentPassword, user.passwordHash)
    if (!isValid) throw new UnauthorizedError('La contraseña actual es incorrecta')

    if (dto.currentPassword === dto.newPassword) {
      throw new ForbiddenError('La nueva contraseña debe ser diferente a la actual')
    }

    const newHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS)
    await authRepository.updatePassword(userId, newHash)

    // Invalida todas las sesiones activas para forzar nuevo login con la nueva contraseña
    await authRepository.deleteAllUserRefreshTokens(userId)
  },

  async logout(refreshToken: string): Promise<void> {
    await authRepository.deleteRefreshToken(refreshToken).catch(() => {})
  },

  async logoutAll(userId: string): Promise<void> {
    await authRepository.deleteAllUserRefreshTokens(userId)
  },

  async getProfile(userId: string) {
    const user = await authRepository.findUserById(userId)
    if (!user) throw new NotFoundError('Usuario')
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      role: user.role,
      createdAt: user.createdAt,
    }
  },

  async getAllOwners() {
    return authRepository.findAllOwners()
  },

  async toggleOwnerActive(ownerId: string, isActive: boolean) {
    const user = await authRepository.findUserById(ownerId)
    if (!user) throw new NotFoundError('Owner')
    if (user.role !== 'OWNER') throw new ForbiddenError('El usuario no es un Owner')
    return authRepository.toggleUserActive(ownerId, isActive)
  },
}