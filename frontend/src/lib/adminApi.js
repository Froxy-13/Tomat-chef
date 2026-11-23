import { API_URL } from './config'
const BASE = API_URL

async function adminApiRequest(path, options = {}) {
  const token = localStorage.getItem('tc_admin_token')
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

export const adminApi = {
  get:    (path)       => adminApiRequest(path),
  post:   (path, body) => adminApiRequest(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => adminApiRequest(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)       => adminApiRequest(path, { method: 'DELETE' }),

  upload: async (path, formData) => {
    const token = localStorage.getItem('tc_admin_token')
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data?.message ?? 'Erreur serveur')
      err.status = res.status
      err.data   = data
      throw err
    }
    return data
  },
}
