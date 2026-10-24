/**
 * aiApi.js — fetch wrapper for AI agent endpoints.
 * All routes require JWT — token attached via getStoredToken().
 */
import { getStoredToken } from '../context/AuthContext.jsx'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function get(path) {
  const token = getStoredToken()
  const res   = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type':  'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const fetchAISummary          = ()  => get('/api/ai/summary')
export const fetchBuyerMatches       = ()  => get('/api/ai/buyer-matches')
export const fetchHarvestPlan        = ()  => get('/api/ai/harvest-planner')
export const fetchShelfLife          = ()  => get('/api/ai/shelf-life')
export const fetchWastagePrevention  = ()  => get('/api/ai/wastage-prevention')
