// src/modules/venues/venues.controller.ts

import { Request, Response, NextFunction } from 'express'
import { venuesService } from './venues.service.js'
import {
  createVenueSchema,
  updateVenueSchema,
  venueScheduleSchema,
  addStaffSchema,
} from './venues.schema.js'
import { ApiResponse } from '../../shared/utils/api-response.js'

export const venuesController = {

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = createVenueSchema.parse(req.body)
      const venue = await venuesService.create(req.user!.id, dto)
      return ApiResponse.created(res, venue)
    } catch (err) {
      return next(err)
    }
  },


  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const rawSlug = req.params.slug
      const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug
      if (!slug) {
        return ApiResponse.error(res, 'slug es requerido', 400)
      }
      const venue = await venuesService.getBySlug(slug)
      return ApiResponse.ok(res, venue)
    } catch (err) {
      return next(err)
    }
  },

  async getPublicList(req: Request, res: Response, next: NextFunction) {
    try {
      const { city, department, page, limit } = req.query
      const result = await venuesService.getPublicList({
        city: city as string,
        department: department as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      })
      return ApiResponse.ok(res, result.venues, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    } catch (err) {
      return next(err)
    }
  },


  async getMyVenues(req: Request, res: Response, next: NextFunction) {
    try {
      const venues = await venuesService.getMyVenues(req.user!.id)
      return ApiResponse.ok(res, venues)
    } catch (err) {
      return next(err)
    }
  },


  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const venue = await venuesService.getById(venueId)
      return ApiResponse.ok(res, venue)
    } catch (err) {
      return next(err)
    }
  },


  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = updateVenueSchema.parse(req.body)
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const venue = await venuesService.update(
        venueId,
        req.user!.id,
        req.user!.role,
        dto,
      )
      return ApiResponse.ok(res, venue)
    } catch (err) {
      return next(err)
    }
  },


  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const { isActive } = req.body
      if (typeof isActive !== 'boolean') {
        return ApiResponse.error(res, 'isActive debe ser booleano', 400)
      }
      const venue = await venuesService.toggleActive(venueId, isActive)
      return ApiResponse.ok(res, venue)
    } catch (err) {
      return next(err)
    }
  },


  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { city, department, page, limit } = req.query
      const result = await venuesService.getAll({
        city: city as string,
        department: department as string,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      })
      return ApiResponse.ok(res, result.venues, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      })
    } catch (err) {
      return next(err)
    }
  },


  async setSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = venueScheduleSchema.parse(req.body)
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const schedules = await venuesService.setSchedules(venueId, dto)
      return ApiResponse.ok(res, schedules)
    } catch (err) {
      return next(err)
    }
  },

  async getSchedules(req: Request, res: Response, next: NextFunction) {
    try {
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const schedules = await venuesService.getSchedules(venueId)
      return ApiResponse.ok(res, schedules)
    } catch (err) {
      return next(err)
    }
  },


  async addStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const dto = addStaffSchema.parse(req.body)
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const member = await venuesService.addStaff(venueId, dto)
      return ApiResponse.created(res, member)
    } catch (err) {
      return next(err)
    }
  },

  async getStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const rawVenueId = req.params.venueId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      if (!venueId) {
        return ApiResponse.error(res, 'venueId es requerido', 400)
      }
      const staff = await venuesService.getStaff(venueId)
      return ApiResponse.ok(res, staff)
    } catch (err) {
      return next(err)
    }
  },

  async removeStaff(req: Request, res: Response, next: NextFunction) {
    try {
      const rawVenueId = req.params.venueId
      const rawUserId = req.params.userId
      const venueId = Array.isArray(rawVenueId) ? rawVenueId[0] : rawVenueId
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId
      if (!venueId || !userId) {
        return ApiResponse.error(res, 'venueId y userId son requeridos', 400)
      }
      await venuesService.removeStaff(
        venueId,
        userId,
        req.user!.id,
      )
      return ApiResponse.noContent(res)
    } catch (err) {
      return next(err)
    }
  },
}