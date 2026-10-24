/**
 * OrdersContext — shared state for the entire Bookings & Orders module.
 * Provides bookings, orders, pickup data and earnings in one place.
 * Each section page can also re-fetch independently via the api service.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/ordersApi.js'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [bookings,  setBookings]  = useState([])
  const [orders,    setOrders]    = useState([])
  const [pickups,   setPickups]   = useState([])
  const [earnings,  setEarnings]  = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [b, o, p, e] = await Promise.all([
        api.fetchFarmerBookings(),
        api.fetchFarmerOrders(),
        api.fetchPickupDelivery(),
        api.fetchFarmerEarnings(),
      ])
      setBookings(b)
      setOrders(o)
      setPickups(p)
      setEarnings(e)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ── Booking actions ──────────────────────────────────────────────────────
  async function acceptBooking(id, extra = {}) {
    const updated = await api.updateBookingStatus(id, { status: 'Accepted', ...extra })
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    // Reload orders since a new one was created
    const newOrders = await api.fetchFarmerOrders()
    setOrders(newOrders)
    return updated
  }

  async function rejectBooking(id, rejectionReason) {
    const updated = await api.updateBookingStatus(id, { status: 'Rejected', rejectionReason })
    setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)))
    return updated
  }

  // ── Order actions ────────────────────────────────────────────────────────
  async function advanceOrderStatus(id, status, note = '') {
    const updated = await api.updateOrderStatus(id, { status, note })
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)))
    // Refresh pickups + earnings after status change
    const [p, e] = await Promise.all([api.fetchPickupDelivery(), api.fetchFarmerEarnings()])
    setPickups(p)
    setEarnings(e)
    return updated
  }

  // ── Payment actions ──────────────────────────────────────────────────────
  async function markPaymentPaid(paymentId) {
    const updated = await api.updatePaymentStatus(paymentId, { status: 'Paid' })
    const e = await api.fetchFarmerEarnings()
    setEarnings(e)
    return updated
  }

  return (
    <OrdersContext.Provider value={{
      bookings, orders, pickups, earnings,
      loading, error,
      reload: load,
      acceptBooking, rejectBooking,
      advanceOrderStatus, markPaymentPaid,
    }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const ctx = useContext(OrdersContext)
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>')
  return ctx
}
