// src/modules/venues/venues.service.ts

import { venuesRepository } from './venues.repository.js'
import { authRepository } from '../auth/auth.repository.js'
import { CreateVenueDto, UpdateVenueDto, VenueScheduleDto, AddStaffDto } from './venues.schema.js'
import {
  ConflictError,
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '../../shared/utils/app-error.js'

export const venuesService = {

  async create(ownerId: string, dto: CreateVenueDto) {
    const slugTaken = await venuesRepository.findBySlugExists(dto.slug)
    if (slugTaken) {
      throw new ConflictError(`El slug "${dto.slug}" ya está en uso. Elige otro.`)
    }

    return venuesRepository.create(ownerId, dto)
  },

  async getById(id: string) {
    const venue = await venuesRepository.findById(id)
    if (!venue) throw new NotFoundError('Establecimiento')
    return venue
  },

  async getBySlug(slug: string) {
    const venue = await venuesRepository.findBySlug(slug)
    if (!venue || !venue.isActive) throw new NotFoundError('Establecimiento')
    return venue
  },

  async getMyVenues(ownerId: string) {
    return venuesRepository.findByOwner(ownerId)
  },

  async getPublicList(filters: {
    city?: string
    department?: string
    page?: number
    limit?: number
  }) {
    return venuesRepository.findAll({ ...filters, isActive: true })
  },

  async getAll(filters: { city?: string; department?: string; page?: number; limit?: number }) {
    return venuesRepository.findAll(filters)
  },

  async update(venueId: string, requesterId: string, requesterRole: string, dto: UpdateVenueDto) {
    const venue = await venuesRepository.findById(venueId)
    if (!venue) throw new NotFoundError('Establecimiento')

    // Solo el Owner del venue o un SUPER_ADMIN puede editar
    if (requesterRole !== 'SUPER_ADMIN' && venue.ownerId !== requesterId) {
      throw new ForbiddenError('No tienes permiso para editar este establecimiento')
    }

    return venuesRepository.update(venueId, dto)
  },

  async toggleActive(venueId: string, isActive: boolean) {
    const venue = await venuesRepository.findById(venueId)
    if (!venue) throw new NotFoundError('Establecimiento')
    return venuesRepository.toggleActive(venueId, isActive)
  },


  async setSchedules(venueId: string, dto: VenueScheduleDto) {
    for (const s of dto.schedules) {
      if (!s.isClosed && s.openTime >= s.closeTime) {
        throw new BadRequestError(
          `Día ${s.dayOfWeek}: la hora de cierre debe ser mayor a la de apertura`,
        )
      }
    }
    return venuesRepository.upsertSchedules(venueId, dto.schedules)
  },

  async getSchedules(venueId: string) {
    return venuesRepository.findSchedules(venueId)
  },


  async addStaff(venueId: string, dto: AddStaffDto) {
    // Verificar que el usuario existe y tiene rol STAFF
    const user = await authRepository.findUserById(dto.userId)
    if (!user) throw new NotFoundError('Usuario')
    if (user.role !== 'STAFF') {
      throw new BadRequestError('El usuario debe tener rol STAFF para ser agregado')
    }

    const existing = await venuesRepository.findStaffMember(venueId, dto.userId)
    if (existing?.isActive) {
      throw new ConflictError('Este usuario ya es parte del staff de este establecimiento')
    }

    return venuesRepository.addStaffMember(venueId, dto.userId)
  },

  async getStaff(venueId: string) {
    return venuesRepository.findAllStaff(venueId)
  },

  async removeStaff(venueId: string, userId: string, requesterId: string) {
    if (userId === requesterId) {
      throw new BadRequestError('No puedes removerte a ti mismo del staff')
    }

    const member = await venuesRepository.findStaffMember(venueId, userId)
    if (!member || !member.isActive) throw new NotFoundError('Miembro del staff')

    return venuesRepository.removeStaffMember(venueId, userId)
  },
}