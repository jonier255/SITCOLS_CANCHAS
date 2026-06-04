
import { prisma } from '../../db/prisma.client.js'
import { Role } from '@prisma/client'

export const authRepository = {

  async findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  async findUserById(id: string) {
    return prisma.user.findUnique({ where: { id } })
  },

  async createUser(data: {
    email: string
    passwordHash: string
    fullName: string
    phone?: string
    role?: Role
    mustChangePassword?: boolean
  }) {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        fullName: data.fullName,
        phone: data.phone,
        role: data.role ?? 'CLIENT',
        mustChangePassword: data.mustChangePassword ?? false,
        provider: 'local',
      },
    })
  },

  async updatePassword(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    })
  },

  async findAllOwners() {
    return prisma.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    })
  },

  async toggleUserActive(userId: string, isActive: boolean) {
    return prisma.user.update({
      where: { id: userId },
      data: { isActive },
    })
  },


  async createRefreshToken(data: {
    token: string
    userId: string
    expiresAt: Date
  }) {
    return prisma.refreshToken.create({ data })
  },

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    })
  },

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({ where: { token } })
  },

  async deleteAllUserRefreshTokens(userId: string) {
    return prisma.refreshToken.deleteMany({ where: { userId } })
  },

  async deleteExpiredTokens() {
    return prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  },
}