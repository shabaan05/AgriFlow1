/**
 * transporterApi.js — fetch wrapper for Transporter endpoints.
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

// GET /api/transporter/pickups
export const fetchPickupRequests     = ()           => request('GET',  '/api/transporter/pickups')

// GET /api/transporter/pickups/:id
export const fetchPickupRequestById  = (id)         => request('GET',  `/api/transporter/pickups/${id}`)

// PUT /api/transporter/pickups/:id/accept
export const acceptPickupRequest     = (id)         => request('PUT',  `/api/transporter/pickups/${id}/accept`)

// PUT /api/transporter/pickups/:id/reject
export const rejectPickupRequest     = (id, reason) => request('PUT',  `/api/transporter/pickups/${id}/reject`, { rejectionReason: reason || '' })

// ── Trips ────────────────────────────────────────────────────────────────────
// GET /api/transporter/trips
export const fetchTrips              = ()           => request('GET',  '/api/transporter/trips')

// GET /api/transporter/trips/:id
export const fetchTripById           = (id)         => request('GET',  `/api/transporter/trips/${id}`)

// PUT /api/transporter/trips/:id/pickup
export const markTripPickedUp        = (id)         => request('PUT',  `/api/transporter/trips/${id}/pickup`)

// PUT /api/transporter/trips/:id/in-transit
export const markTripInTransit       = (id)         => request('PUT',  `/api/transporter/trips/${id}/in-transit`)

// PUT /api/transporter/trips/:id/delivered
export const markTripDelivered       = (id)         => request('PUT',  `/api/transporter/trips/${id}/delivered`)

// ── Earnings ──────────────────────────────────────────────────────────────────
// GET /api/transporter/earnings
export const fetchEarnings           = ()           => request('GET',  '/api/transporter/earnings')

// GET /api/transporter/earnings/:id
export const fetchEarningById        = (id)         => request('GET',  `/api/transporter/earnings/${id}`)

// ── Transporter Profile ─────────────────────────────────────────────────────
export const fetchTransporterProfile    = ()     => request('GET',  '/api/transporter/profile')
export const updateTransporterProfile   = (data) => request('PUT',  '/api/transporter/profile', data)
export const fetchTransporterInfo       = ()     => request('GET',  '/api/transporter/transporter-info')
export const updateTransporterInfo       = (data) => request('PUT',  '/api/transporter/transporter-info', data)
export const fetchVehicleInfo           = ()     => request('GET',  '/api/transporter/vehicle')
export const updateVehicleInfo          = (data) => request('PUT',  '/api/transporter/vehicle', data)
export const fetchTransporterVerification = ()   => request('GET',  '/api/transporter/verification')
export const submitTransporterVerification = (d) => request('POST', '/api/transporter/verification/submit', d)
export const fetchTransporterPaymentDetails = () => request('GET',  '/api/transporter/payment-details')
export const updateTransporterPaymentDetails= (d)=> request('PUT',  '/api/transporter/payment-details', d)
export const updateTransporterNotifPrefs  = (d) => request('PUT',  '/api/transporter/notification-prefs', d)
