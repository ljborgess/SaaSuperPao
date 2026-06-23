export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR'
export type UserStatus = 'ACTIVE' | 'INACTIVE'

export interface UserDto {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  createdAt: string
  avatarUrl?: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
  role: UserRole
}

export interface UpdateUserDto {
  name?: string
  email?: string
  role?: UserRole
  status?: UserStatus
}
