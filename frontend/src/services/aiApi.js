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

async function post(path, body) {
  const token = getStoredToken()
  const res   = await fetch(`${BASE}${path}`, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const fetchAISummary          = ()       => get('/api/ai/summary')
export const fetchBuyerMatches       = ()       => get('/api/ai/buyer-matches')
export const fetchHarvestPlan        = ()       => get('/api/ai/harvest-planner')
export const fetchShelfLife          = ()       => get('/api/ai/shelf-life')
export const fetchWastagePrevention  = ()       => get('/api/ai/wastage-prevention')

/**
 * Buyer–Farmer Matching: POST /api/ai/buyer-match
 * criteria: { cropName, quantity, maxPricePerKg, qualityGrade, requiredByDate, deliveryLocation }
 * Returns: { success, matches[], meta }
 */
export const runBuyerMatch = (criteria) => post('/api/ai/buyer-match', criteria)

/**
 * Demand Forecast: POST /api/ai/demand-forecast
 * body: { cropName, forecastPeriod }  forecastPeriod: '1 month'|'3 months'|'6 months'|'12 months'
 * Returns: { success, cropName, historicalPoints[], forecastPoints[], trend, demandLevel, ... }
 */
export const runDemandForecast = (body) => post('/api/ai/demand-forecast', body)
