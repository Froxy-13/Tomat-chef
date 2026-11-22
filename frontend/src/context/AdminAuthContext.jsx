import { createContext, useContext, useState, useEffect } from 'react'
import { adminApi } from '../lib/adminApi'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('tc_admin_token')
    if (!token) { setLoading(false); return }
    adminApi.get('/admin/me')
      .then(data => setAdmin(data.data ?? data))
      .catch(() => localStorage.removeItem('tc_admin_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const res   = await adminApi.post('/admin/auth/login', { email, password })
    const token = res.data?.token ?? res.token
    const user  = res.data?.user  ?? res.user
    localStorage.setItem('tc_admin_token', token)
    setAdmin(user)
    return user
  }

  const logout = async () => {
    await adminApi.post('/admin/auth/logout').catch(() => {})
    localStorage.removeItem('tc_admin_token')
    setAdmin(null)
  }

  return (
    <AdminAuthContext.Provider value={{ admin, loading, isAuthenticated: !!admin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider')
  return ctx
}
