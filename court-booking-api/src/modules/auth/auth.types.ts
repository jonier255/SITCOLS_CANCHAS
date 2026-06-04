
import { Role } from '@prisma/client'

export interface JwtPayload {
  sub: string
  email: string
  role: Role
  fullName: string
  tenantId?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    fullName: string
    role: Role
    avatarUrl: string | null
    //mustChangePassword: boolean 
  }
  tokens: TokenPair
}