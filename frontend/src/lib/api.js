import { API_URL } from './config'
const BASE = API_URL

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('tc_token')

  const res = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data?.message ?? 'Erreur serveur')
    err.status = res.status
    err.data   = data
    throw err
  }
  return data
}

export const api = {
  get:    (path)         => apiRequest(path),
  post:   (path, body)   => apiRequest(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)   => apiRequest(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)         => apiRequest(path, { method: 'DELETE' }),
}
