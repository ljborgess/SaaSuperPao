import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const refreshToken = sessionStorage.getItem('refreshToken')
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/auth/refresh`,
            { refreshToken },
          )
          sessionStorage.setItem('accessToken', data.accessToken)
          sessionStorage.setItem('refreshToken', data.refreshToken)
          err.config.headers.Authorization = `Bearer ${data.accessToken}`
          return axios(err.config)
        } catch {
          sessionStorage.clear()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(err)
  },
)
