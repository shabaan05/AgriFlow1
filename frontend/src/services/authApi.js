/**
 * authApi.js — fetch wrapper for auth endpoints.
 * Mirrors the pattern in cropApi.js — native fetch, no extra library.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(method, path, body) {
  const res  = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

// POST /api/auth/register
export const apiRegister = (data) => request('POST', '/api/auth/register', data)

// POST /api/auth/login
export const apiLogin    = (data) => request('POST', '/api/auth/login',    data)

// GET  /api/auth/me  (token passed in header by caller)
export const apiGetMe    = (token) =>
  fetch(`${BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(async (res) => {
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user')
    return data
  })
