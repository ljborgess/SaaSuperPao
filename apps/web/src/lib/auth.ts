import type { UserDto } from '@superpao/shared-types'

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 // 7 days, matching JWT_REFRESH_EXPIRES_IN

export function getStoredUser(): UserDto | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as UserDto) : null
  } catch {
    return null
  }
}

export function storeAuth(accessToken: string, refreshToken: string, user: UserDto) {
  localStorage.setItem('accessToken', accessToken)
  localStorage.setItem('refreshToken', refreshToken)
  localStorage.setItem('user', JSON.stringify(user))
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${REFRESH_MAX_AGE}; SameSite=Strict`
}

export function renewAuthCookie(accessToken: string) {
  localStorage.setItem('accessToken', accessToken)
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${REFRESH_MAX_AGE}; SameSite=Strict`
}

export function clearAuth() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict'
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('accessToken')
}
