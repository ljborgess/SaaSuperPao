import type { UserDto } from '@superpao/shared-types'

export function getStoredUser(): UserDto | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('user')
    return raw ? (JSON.parse(raw) as UserDto) : null
  } catch {
    return null
  }
}

export function storeAuth(accessToken: string, refreshToken: string, user: UserDto) {
  sessionStorage.setItem('accessToken', accessToken)
  sessionStorage.setItem('refreshToken', refreshToken)
  sessionStorage.setItem('user', JSON.stringify(user))
  // Cookie para o middleware do Next.js (sem httpOnly pois é definido via JS)
  document.cookie = `accessToken=${accessToken}; path=/; max-age=${15 * 60}; SameSite=Strict`
}

export function clearAuth() {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('user')
  document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Strict'
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false
  return !!sessionStorage.getItem('accessToken')
}
