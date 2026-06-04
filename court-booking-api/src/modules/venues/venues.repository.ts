// src/modules/venues/venues.repository.ts

import { prisma } from '../../db/prisma.client.js'
import { CreateVenueDto, UpdateVenueDto } from './venues.schema.js'

export const venuesRepository = {

  async create(ownerId: string, data: CreateVenueDto) {
    return prisma.venue.create({
      data: {
        ...data,
        ownerId,
      },
    })
  },

  async findById(id: string) {
    return prisma.venue.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: 'asc' } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
        staff: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
        },
      },
    })
  },

  async findBySlug(slug: string) {
    return prisma.venue.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: 'asc' } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    })
  },

  async findBySlugExists(slug: string) {
    const venue = await prisma.venue.findUnique({
      where: { slug },
      select: { id: true },
    })
    return !!venue
  },

  async findByOwner(ownerId: string) {
    return prisma.venue.findMany({
      where: { ownerId },
      include: {
        images: {
          where: { isCover: true },
          take: 1,
        },
        _count: {
          select: { courts: true, bookings: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findAll(filters: {
    city?: string
    department?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const { city, department, isActive = true, page = 1, limit = 20 } = filters
    const skip = (page - 1) * limit

    const where = {
      isActive,
      ...(city && { city: { contains: city, mode: 'insensitive' as const } }),
      ...(department && { department: { contains: department, mode: 'insensitive' as const } }),
    }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          images: { where: { isCover: true }, take: 1 },
          _count: { select: { courts: true } },
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.venue.count({ where }),
    ])

    return { venues, total, page, limit, totalPages: Math.ceil(total / limit) }
  },

  async update(id: string, data: UpdateVenueDto) {
    return prisma.venue.update({
      where: { id },
      data,
    })
  },

  async toggleActive(id: string, isActive: boolean) {
    return prisma.venue.update({
      where: { id },
      data: { isActive },
    })
  },


  async upsertSchedules(
    venueId: string,
    schedules: Array<{
      dayOfWeek: number
      openTime: string
      closeTime: string
      isClosed: boolean
    }>,
  ) {
    // Upsert cada día de la semana
    const ops = schedules.map((s) =>
      prisma.venueSchedule.upsert({
        where: { venueId_dayOfWeek: { venueId, dayOfWeek: s.dayOfWeek } },
        update: { openTime: s.openTime, closeTime: s.closeTime, isClosed: s.isClosed },
        create: { venueId, ...s },
      }),
    )
    return prisma.$transaction(ops)
  },

  async findSchedules(venueId: string) {
    return prisma.venueSchedule.findMany({
      where: { venueId },
      orderBy: { dayOfWeek: 'asc' },
    })
  },


  async addStaffMember(venueId: string, userId: string) {
    return prisma.staffMember.create({
      data: { venueId, userId, role: 'STAFF' },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, role: true },
        },
      },
    })
  },

  async findStaffMember(venueId: string, userId: string) {
    return prisma.staffMember.findUnique({
      where: { venueId_userId: { venueId, userId } },
    })
  },

  async findAllStaff(venueId: string) {
    return prisma.staffMember.findMany({
      where: { venueId, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    })
  },

  async removeStaffMember(venueId: string, userId: string) {
    return prisma.staffMember.update({
      where: { venueId_userId: { venueId, userId } },
      data: { isActive: false },
    })
  },
}