/**
 * traceabilityApi.js — fetch wrapper for Traceability endpoints.
 * JWT attached automatically via getStoredToken().
 */
import { getStoredToken } from '../context/AuthContext.jsx'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function get(path) {
  const token = getStoredToken()
  const res   = await fetch(`${BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

// GET /api/traceability              — overview of all traceable crops (farmer)
export const fetchTraceabilityOverview  = ()        => get('/api/traceability')

// GET /api/traceability/crop/:cropId
export const fetchCropTraceability      = (cropId)  => get(`/api/traceability/crop/${cropId}`)

// GET /api/traceability/order/:orderId
export const fetchOrderTraceability     = (orderId) => get(`/api/traceability/order/${orderId}`)

// GET /api/traceability/buyer              — buyer overview (all their orders with events)
export const fetchBuyerTraceability     = ()        => get('/api/traceability/buyer')

// GET /api/traceability/buyer/order/:orderId — buyer order timeline (ownership verified)
export const fetchBuyerOrderTraceability = (orderId) => get(`/api/traceability/buyer/order/${orderId}`)
