/**
 * Authentication-related type definitions
 */

export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  role: string
  permissions: string[]
  email?: string
  realName?: string
  phone?: string
  isAdmin?: boolean
  kindergartenId?: number
}

export interface LoginResponse {
  token: string
  user: User
}

export interface AuthState {
  user: User | null
  token: string
  isAuthenticated: boolean
}

export interface AuthError {
  code?: string
  status?: number
  message: string
  response?: {
    data?: any
  }
}