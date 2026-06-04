
import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, BadRequestError } from '../utils/app-error.js'
import { prisma } from '../../db/prisma.client.js'

export async function tenantMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const headerTenantId = req.headers['x-tenant-id']

    const tenantId =
      (typeof headerTenantId === 'string' ? headerTenantId : undefined) ||
      req.params.venueId ||
      req.tenantId

    if (!tenantId) {
      return next(new BadRequestError('Se requiere identificador de establecimiento'))
    }

    const venue = await prisma.venue.findUnique({
      where: { id: tenantId as string },
      select: { id: true, isActive: true, ownerId: true },
    })

    if (!venue || !venue.isActive) {
      return next(new BadRequestError('Establecimiento no encontrado o inactivo'))
    }

    
    if (req.user && ['STAFF', 'OWNER'].includes(req.user.role)) {
      if (req.user.role === 'OWNER') {
        if (venue.ownerId !== req.user.userId) {
          return next(new ForbiddenError('No perteneces a este establecimiento'))
        }
      } else {
        const membership = await prisma.staffMember.findUnique({
          where: {
            venueId_userId: {
              venueId: tenantId as string,
              userId: req.user.userId,
            },
          },
          select: { isActive: true },
        })

        if (!membership?.isActive) {
          return next(new ForbiddenError('No perteneces a este establecimiento'))
        }
      }
    }

    req.tenantId = tenantId as string
    next()
  } catch (err) {
    next(err)
  }
}