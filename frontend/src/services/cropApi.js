/**
 * cropApi.js — fetch wrapper for the Crops REST API.
 * Automatically attaches the stored JWT as a Bearer token on every request.
 * Base URL reads from the Vite env variable; falls back to localhost:5000.
 */
import { getStoredToken } from '../context/AuthContext.jsx'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(method, path, body) {
  const token = getStoredToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const opts = { method, headers }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res  = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

// GET    /api/crops
export const fetchCrops     = ()         => request('GET',    '/api/crops')

// GET    /api/crops/:id
export const fetchCropById  = (id)       => request('GET',    `/api/crops/${id}`)

// POST   /api/crops
export const createCrop     = (data)     => request('POST',   '/api/crops', data)

// PUT    /api/crops/:id
export const updateCrop     = (id, data) => request('PUT',    `/api/crops/${id}`, data)

// DELETE /api/crops/:id
export const deleteCropById = (id)       => request('DELETE', `/api/crops/${id}`)
