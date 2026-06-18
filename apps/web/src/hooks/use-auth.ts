'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { storeAuth, clearAuth, getStoredUser } from '@/lib/auth'
import type { UserDto } from '@superpao/shared-types'

export function useAuth() {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setUser(getStoredUser())
    setLoading(false)
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/api/auth/login', { email, password })
    storeAuth(data.accessToken, data.refreshToken, data.user)
    setUser(data.user)
    router.push('/dashboard')
  }

  async function logout() {
    try { await api.post('/api/auth/logout') } catch {}
    clearAuth()
    setUser(null)
    router.push('/login')
  }

  return { user, loading, login, logout }
}
