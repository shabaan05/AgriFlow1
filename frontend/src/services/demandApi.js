/**
 * demandApi.js — fetch wrapper for Demand REST endpoints.
 * Demand is read-only public market data — no auth token required.
 * Follows the same pattern as cropApi.js.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function get(path) {
  const res  = await fetch(`${BASE}${path}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

// GET /api/demand
export const fetchDemand             = ()   => get('/api/demand')

// GET /api/demand/opportunities
export const fetchOpportunities      = ()   => get('/api/demand/opportunities')

// GET /api/demand/buyer-requirements
export const fetchBuyerRequirements  = ()   => get('/api/demand/buyer-requirements')

// GET /api/demand/:id
export const fetchDemandById         = (id) => get(`/api/demand/${id}`)
