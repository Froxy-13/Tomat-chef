import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  /* Restaure la session au démarrage */
  useEffect(() => {
    const token = localStorage.getItem('tc_token')
    if (!token) { setLoading(false); return }

    api.get('/me')
      .then(data => setUser(data.data ?? data))
      .catch(() => localStorage.removeItem('tc_token'))
      .finally(() => setLoading(false))
  }, [])

  const saveSession = (userData, token) => {
    localStorage.setItem('tc_token', token)
    setUser(userData)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data?.user ?? res.user, res.data?.token ?? res.token)
    return res.data?.user ?? res.user
  }

  const register = async (payload) => {
    const res = await api.post('/auth/register', payload)
    saveSession(res.data?.user ?? res.user, res.data?.token ?? res.token)
    return res.data?.user ?? res.user
  }

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {})
    localStorage.removeItem('tc_token')
    setUser(null)
  }

  const isAuthenticated = !!user
  const isAdmin         = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, isAdmin, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
