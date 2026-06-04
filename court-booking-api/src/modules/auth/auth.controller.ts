
import { Request, Response, NextFunction } from 'express'
import { authService } from './auth.service.js'
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  createOwnerSchema,
  createStaffSchema,
} from './auth.schema.js'
import { ApiResponse } from '../../shared/utils/api-response.js'

export const authController = {

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = registerSchema.parse(req.body)
      const result = await authService.register(dto)
      return ApiResponse.created(res, result)
    } catch (err) {
      return next(err)
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = loginSchema.parse(req.body)
      const result = await authService.login(dto)
      return ApiResponse.ok(res, result)
    } catch (err) {
      return next(err)
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      const tokens = await authService.refreshTokens(refreshToken)
      return ApiResponse.ok(res, tokens)
    } catch (err) {
      return next(err)
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body)
      await authService.logout(refreshToken)
      return ApiResponse.noContent(res)
    } catch (err) {
      return next(err)
    }
  },


  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id)
      return ApiResponse.ok(res, profile)
    } catch (err) {
      return next(err)
    }
  },

  async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.logoutAll(req.user!.id)
      return ApiResponse.noContent(res)
    } catch (err) {
      return next(err)
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = changePasswordSchema.parse(req.body)
      await authService.changePassword(req.user!.id, dto)
      return ApiResponse.noContent(res)
    } catch (err) {
      return next(err)
    }
  },


  async createOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createOwnerSchema.parse(req.body)
      const result = await authService.createOwner(dto)
      return ApiResponse.created(res, result)
    } catch (err) {
      return next(err)
    }
  },

  async getAllOwners(_req: Request, res: Response, next: NextFunction) {
    try {
      const owners = await authService.getAllOwners()
      return ApiResponse.ok(res, owners)
    } catch (err) {
      return next(err)
    }
  },

  async toggleOwnerActive(req: Request, res: Response, next: NextFunction) {
    try {
      const rawOwnerId = req.params.ownerId
      const ownerId = Array.isArray(rawOwnerId) ? rawOwnerId[0] : rawOwnerId
      if (!ownerId) {
        return ApiResponse.error(res, 'ownerId es requerido', 400)
      }
      const { isActive } = req.body
      if (typeof isActive !== 'boolean') {
        return ApiResponse.error(res, 'isActive debe ser booleano', 400)
      }
      const result = await authService.toggleOwnerActive(ownerId, isActive)
      return ApiResponse.ok(res, result)
    } catch (err) {
      return next(err)
    }
  },


  async createStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createStaffSchema.parse(req.body)
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const result = await authService.createStaff(dto, venueId)
      return ApiResponse.created(res, result)
    } catch (err) {
      return next(err)
    }
  },
}