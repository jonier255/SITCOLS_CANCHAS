
import { z } from 'zod'

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  fullName: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2)
    .max(100),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido')
    .optional(),
})

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
    .toLowerCase(),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'El refresh token es requerido'),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z
    .string()
    .min(1, 'La nueva contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export const setPasswordSchema = z.object({
  temporaryPassword: z.string().min(1, 'La contraseña temporal es requerida'),
  newPassword: z
    .string()
    .min(1, 'La nueva contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
})

export const createOwnerSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido').optional(),
  temporaryPassword: z.string().min(8).optional(),
})

export const createStaffSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+?[0-9]{7,15}$/, 'Teléfono inválido').optional(),
  temporaryPassword: z.string().min(8).optional(),
})

export type RegisterDto = z.infer<typeof registerSchema>
export type LoginDto = z.infer<typeof loginSchema>
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>
export type SetPasswordDto = z.infer<typeof setPasswordSchema>
export type CreateOwnerDto = z.infer<typeof createOwnerSchema>
export type CreateStaffDto = z.infer<typeof createStaffSchema>