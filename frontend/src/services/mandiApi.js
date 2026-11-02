/**
 * mandiApi.js — Service client for Real-time APMC Mandi Market Prices
 * Proxies through /api/mandi to fetch official Agmarknet / data.gov.in rates.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const opts = { method, headers }
  if (body !== undefined) opts.body = JSON.stringify(body)

  const res = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

/**
 * Fetch Mandi prices with query filters
 */
export async function fetchMandiPrices(filters = {}) {
  const params = new URLSearchParams()
  if (filters.state) params.append('state', filters.state)
  if (filters.district) params.append('district', filters.district)
  if (filters.market) params.append('market', filters.market)
  if (filters.commodity) params.append('commodity', filters.commodity)
  if (filters.grade) params.append('grade', filters.grade)

  const query = params.toString() ? `?${params.toString()}` : ''
  const res = await request('GET', `/api/mandi/prices${query}`)
  return res.data || []
}

/**
 * Fetch live top marquee ticker items
 */
export async function fetchLiveTicker() {
  const res = await request('GET', '/api/mandi/ticker')
  return res.data || []
}

/**
 * Intelligent price advisor benchmark for CropForm
 * @param {string} commodity - Crop name (e.g., Tomato, Batata, Bhendi)
 * @param {string} location - Location string (e.g., "Nashik, Maharashtra")
 */
export async function fetchMandiBenchmark(commodity, location = '') {
  if (!commodity) return null
  const params = new URLSearchParams({ commodity })
  if (location) params.append('location', location)

  const res = await request('GET', `/api/mandi/benchmark?${params.toString()}`)
  return res.data || null
}

/**
 * Fetch filter options (commodities, states)
 */
export async function fetchFilterOptions(level = 'commodity') {
  const res = await request('GET', `/api/mandi/options?level=${encodeURIComponent(level)}`)
  return res.data || []
}
