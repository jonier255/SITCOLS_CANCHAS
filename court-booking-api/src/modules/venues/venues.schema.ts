
import { z } from 'zod'

// Slug: solo letras minúsculas, números y guiones
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createVenueSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'Mínimo 2 caracteres')
    .max(100),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .min(2)
    .max(60)
    .regex(slugRegex, 'Solo letras minúsculas, números y guiones. Ej: complejo-sur'),
  description: z.string().max(500).optional(),

  // Ubicación
  department: z.string().min(1, 'El departamento es requerido').min(2).max(60),
  city: z.string().min(1, 'La ciudad es requerida').min(2).max(60),
  address: z.string().min(1, 'La dirección es requerida').min(5).max(200),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  // Contacto
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido').optional(),
  email: z.string().email('Email inválido').optional(),
  website: z.string().url('URL inválida').optional(),
  instagram: z.string().max(60).optional(),
  facebook: z.string().max(100).optional(),
  whatsapp: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido').optional(),
})

export const updateVenueSchema = createVenueSchema
  .omit({ slug: true }) // el slug no se puede cambiar después de creado
  .partial()
  .extend({
    requiresPayment: z.boolean().optional(),
    cancellationHoursLimit: z
      .number()
      .int()
      .min(0)
      .max(168, 'Máximo 168 horas (7 días)')
      .optional(),
  })

export const venueScheduleSchema = z.object({
  schedules: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        openTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato inválido. Usa HH:MM'),
        closeTime: z
          .string()
          .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Formato inválido. Usa HH:MM'),
        isClosed: z.boolean().default(false),
      }),
    )
    .min(1)
    .max(7),
})

export const addStaffSchema = z.object({
  userId: z.string().min(1, 'El userId es requerido').cuid('ID inválido'),
})

export type CreateVenueDto = z.infer<typeof createVenueSchema>
export type UpdateVenueDto = z.infer<typeof updateVenueSchema>
export type VenueScheduleDto = z.infer<typeof venueScheduleSchema>
export type AddStaffDto = z.infer<typeof addStaffSchema>