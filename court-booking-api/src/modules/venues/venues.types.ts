
export interface CreateVenueInput {
  name: string
  slug: string
  description?: string
  department: string
  city: string
  address: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  whatsapp?: string
}

export interface UpdateVenueInput {
  name?: string
  description?: string
  department?: string
  city?: string
  address?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
  whatsapp?: string
  requiresPayment?: boolean
  cancellationHoursLimit?: number
}

export interface VenueScheduleInput {
  dayOfWeek: number   // 0=domingo, 6=sábado
  openTime: string    // "07:00"
  closeTime: string   // "22:00"
  isClosed: boolean
}

export interface StaffMemberInput {
  userId: string
}