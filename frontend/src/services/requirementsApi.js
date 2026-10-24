/**
 * requirementsApi.js — fetch wrapper for Buyer Requirements endpoints.
 * JWT attached automatically via getStoredToken().
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
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const fetchRequirements   = (params = {}) => {
  const qs = new URLSearchParams()
  if (params.status)   qs.set('status',   params.status)
  if (params.cropName) qs.set('cropName', params.cropName)
  const query = qs.toString() ? `?${qs}` : ''
  return request('GET', `/api/requirements${query}`)
}

export const fetchRequirementById = (id)       => request('GET',  `/api/requirements/${id}`)
export const createRequirement    = (data)     => request('POST', '/api/requirements', data)
export const updateRequirement    = (id, data) => request('PUT',  `/api/requirements/${id}`, data)
export const cancelRequirement    = (id)       => request('PUT',  `/api/requirements/${id}/cancel`)
