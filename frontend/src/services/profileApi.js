/**
 * profileApi.js — fetch wrapper for Farmer Profile + Notification endpoints.
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

// ── Profile ──────────────────────────────────────────────────────────────────
export const fetchProfile      = ()        => request('GET',  '/api/farmers/profile')
export const updateProfile     = (data)    => request('PUT',  '/api/farmers/profile', data)

// ── Buyer-specific Profile ────────────────────────────────────────────────────
export const fetchBuyerProfile    = ()     => request('GET',  '/api/buyers/profile')
export const updateBuyerProfile   = (data) => request('PUT',  '/api/buyers/profile', data)
export const fetchBuyerInfo       = ()     => request('GET',  '/api/buyers/business-info')
export const updateBuyerInfo      = (data) => request('PUT',  '/api/buyers/business-info', data)
export const fetchBuyerVerification = ()   => request('GET',  '/api/buyers/verification')
export const submitBuyerVerification= (d)  => request('POST', '/api/buyers/verification/submit', d)
export const fetchBuyerPaymentDetails = () => request('GET',  '/api/buyers/payment-details')
export const updateBuyerPaymentDetails= (d)=> request('PUT',  '/api/buyers/payment-details', d)
export const updateBuyerNotifPrefs = (d)   => request('PUT',  '/api/buyers/notification-prefs', d)

// ── Farm ──────────────────────────────────────────────────────────────────────
export const fetchFarmInfo     = ()        => request('GET',  '/api/farmers/farm')
export const updateFarmInfo    = (data)    => request('PUT',  '/api/farmers/farm', data)

// ── Verification ──────────────────────────────────────────────────────────────
export const fetchVerification = ()        => request('GET',  '/api/farmers/verification')
export const submitVerification= (data)    => request('POST', '/api/farmers/verification/submit', data)

// ── Payment Details ─────────────────────────────────────────────────────────
export const fetchPaymentDetails = ()      => request('GET',  '/api/farmers/payment-details')
export const updatePaymentDetails= (data) => request('PUT',  '/api/farmers/payment-details', data)

// ── Notification Prefs ───────────────────────────────────────────────────────
export const updateNotifPrefs = (data)    => request('PUT',  '/api/farmers/notification-prefs', data)

// ── Notifications ─────────────────────────────────────────────────────────────
export const fetchNotifications   = ()      => request('GET', '/api/notifications')
export const markNotifRead        = (id)    => request('PUT', `/api/notifications/${id}/read`)
export const markAllNotifsRead    = ()      => request('PUT', '/api/notifications/read-all')

// ── Change Password ──────────────────────────────────────────────────────────
export const changePassword = (data)       => request('PUT', '/api/auth/change-password', data)
