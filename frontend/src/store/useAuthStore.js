import { create } from 'zustand'
import api from '../lib/axios'

const getStoredUser = () => {
  try {
    const user = localStorage.getItem('auth-user')
    return user && user !== 'undefined' ? JSON.parse(user) : null
  } catch {
    return null
  }
}

const useAuthStore = create((set) => ({
  token: localStorage.getItem('auth-token') || null,
  user: getStoredUser(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null })
    try {
      const { data } = await api.post('/login', { email, password })

      localStorage.setItem('auth-token', data.token)
      localStorage.setItem('auth-user', JSON.stringify(data.user))

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
        error: null,
      })

      return data.user
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        'Terjadi kesalahan. Silakan coba lagi.'

      set({ isLoading: false, error: message })
      throw err
    }
  },

  logout: async () => {
    try {
      await api.post('/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('auth-token')
      localStorage.removeItem('auth-user')
      set({ token: null, user: null })
    }
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/user')
      localStorage.setItem('auth-user', JSON.stringify(data))
      set({ user: data })
    } catch {
      // ignore
    }
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
