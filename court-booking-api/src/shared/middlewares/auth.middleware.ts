
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Role } from '@prisma/client'
import { UnauthorizedError } from '../utils/app-error.js'

interface JwtPayload {
  sub: string 
  email: string
  role: Role
  fullName: string
  tenantId?: string 
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token no proporcionado'))
  }

  const token = header.split(' ')[1]

  if (!token) {
    return next(new UnauthorizedError('Token inválido'))
  }

  try {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error('JWT_SECRET no configurado')
    }

    const payload = jwt.verify(
      token,
      secret
    ) as unknown as JwtPayload

    req.user = {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId || null,
    }

    if (payload.tenantId) {
      req.tenantId = payload.tenantId
    }

    next()
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'))
  }
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization

  if (!header?.startsWith('Bearer ')) {
    return next()
  }

  const token = header.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error('JWT_SECRET no configurado')
    }

    const payload = jwt.verify(
      token,
      secret
    ) as unknown as JwtPayload

    req.user = {
      id: payload.sub,
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId || null,
    }

    if (payload.tenantId) {
      req.tenantId = payload.tenantId
    }
  } catch {
  }

  next()
}