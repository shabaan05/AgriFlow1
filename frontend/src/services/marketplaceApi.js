/**
 * marketplaceApi.js — fetch wrapper for Marketplace + Shortlist endpoints.
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

// ── Marketplace ───────────────────────────────────────────────────────────────
export const fetchMarketplaceCrops    = ()   => request('GET', '/api/marketplace/crops')
export const fetchMarketplaceCropById = (id) => request('GET', `/api/marketplace/crops/${id}`)
export const fetchFarmerProfile       = (id) => request('GET', `/api/marketplace/farmer/${id}`)

// ── Shortlist ─────────────────────────────────────────────────────────────────
export const fetchShortlist    = ()       => request('GET',    '/api/marketplace/shortlist')
export const fetchShortlistIds = ()       => request('GET',    '/api/marketplace/shortlist/ids')
export const addShortlist      = (cropId) => request('POST',   '/api/marketplace/shortlist', { cropId })
export const removeShortlist   = (cropId) => request('DELETE', `/api/marketplace/shortlist/${cropId}`)
