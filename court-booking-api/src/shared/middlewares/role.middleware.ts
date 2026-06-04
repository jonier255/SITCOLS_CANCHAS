
import { Request, Response, NextFunction } from 'express'
import { Role } from '@prisma/client'
import { ForbiddenError, UnauthorizedError } from '../utils/app-error.js'

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    if (!roles.includes(req.user.role as Role)) {
      return next(
        new ForbiddenError(
          `Se requiere uno de los siguientes roles: ${roles.join(', ')}`,
        ),
      )
    }

    next()
  }
}

export const requireOwner = requireRole('OWNER')
export const requireStaff = requireRole('OWNER', 'STAFF')
export const requireAdmin = requireRole('SUPER_ADMIN')
export const requireAuth = requireRole('CLIENT', 'STAFF', 'OWNER', 'SUPER_ADMIN')