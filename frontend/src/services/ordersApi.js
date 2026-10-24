/**
 * ordersApi.js — fetch wrapper for Bookings, Orders and Payments endpoints.
 * JWT attached automatically via getStoredToken().
 */
import { getStoredToken } from '../context/AuthContext.jsx'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

async function request(method, path, body) {
  const token   = getStoredToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const opts = { method, headers }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res  = await fetch(`${BASE}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

// ── Bookings ──────────────────────────────────────────────────────────────────
export const fetchFarmerBookings  = ()             => request('GET',  '/api/bookings/farmer')
export const fetchBuyerBookings   = ()             => request('GET',  '/api/bookings/buyer')
export const fetchBookingById     = (id)           => request('GET',  `/api/bookings/${id}`)
export const createBooking        = (data)         => request('POST', '/api/bookings', data)
export const updateBookingStatus  = (id, payload)  => request('PUT',  `/api/bookings/${id}/status`, payload)
export const cancelBookingByBuyer = (id)           => request('PUT',  `/api/bookings/${id}/cancel`)

// ── Orders ────────────────────────────────────────────────────────────────────
export const fetchFarmerOrders    = ()             => request('GET',  '/api/orders/farmer')
export const fetchBuyerOrders     = ()             => request('GET',  '/api/orders/buyer')
export const fetchBuyerOrderById  = (id)           => request('GET',  `/api/orders/buyer/${id}`)
export const fetchOrderById       = (id)           => request('GET',  `/api/orders/${id}`)
export const fetchOrderPickupRequest = (id)        => request('GET',  `/api/orders/${id}/pickup-request`)
export const updateOrderStatus    = (id, payload)  => request('PUT',  `/api/orders/${id}/status`, payload)
export const fetchPickupDelivery  = ()             => request('GET',  '/api/orders/farmer/pickup-delivery')

// ── Payments ──────────────────────────────────────────────────────────────────
export const fetchFarmerEarnings  = ()             => request('GET',  '/api/payments/farmer/earnings')
export const fetchBuyerPayments   = ()             => request('GET',  '/api/payments/buyer')
export const updatePaymentStatus  = (id, payload)  => request('PUT',  `/api/payments/${id}/status`, payload)
export const buyerPayNow          = (id)           => request('PUT',  `/api/payments/${id}/pay`)
