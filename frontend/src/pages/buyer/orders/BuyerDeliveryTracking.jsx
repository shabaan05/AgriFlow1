import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }  from 'react-router-dom'
import { fetchBuyerOrderById }     from '../../../services/ordersApi.js'

const DELIVERY_FLOW = [
  { status: 'Confirmed',          icon: '✅', label: 'Order Confirmed',     desc: 'Booking accepted. Farmer is preparing your crop.' },
  { status: 'Preparing',          icon: '🌾', label: 'Preparing',           desc: 'Farmer is preparing your crop for dispatch.' },
  { status: 'Ready for Pickup',   icon: '📦', label: 'Ready for Pickup',    desc: 'Crop is packed and ready for transporter pickup.' },
  { status: 'Picked Up',          icon: '🚛', label: 'Picked Up',           desc: 'Your order has been picked up by the transporter.' },
  { status: 'In Transit',         icon: '🚛', label: 'In Transit',          desc: 'Your order is on the way to your delivery location.' },
  { status: 'Delivered',          icon: '🎉', label: 'Delivered',           desc: 'Your order has been delivered successfully.' },
]

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtTime(d) {
  if (!d) return null
  return new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

export default function BuyerDeliveryTracking() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [order,   setOrder]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchBuyerOrderById(id)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        {[1,2,3].map((i) => <div key={i} className="card h-24" />)}
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Order not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/orders')} className="btn-primary mt-4 text-sm px-6">Back to Orders</button>
      </div>
    )
  }

  const currentIdx = DELIVERY_FLOW.findIndex((s) => s.status === order.status)

  // Build a lookup of timeline events by status for timestamps
  const timelineByStatus = {}
  ;(order.timeline || []).forEach((ev) => { timelineByStatus[ev.status] = ev })

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button onClick={() => navigate(`/buyer/orders/${order.id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Order Details
      </button>

      {/* Summary card */}
      <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-green-200 text-xs font-semibold uppercase tracking-wider">Delivery Tracking</p>
            <h2 className="text-xl font-bold mt-1">{order.cropName}</h2>
            <p className="text-green-100 text-sm">{order.quantity} {order.unit} · ₹{order.totalAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-white/20 rounded-2xl px-4 py-2 text-center">
            <p className="text-white text-xs font-medium opacity-80">Status</p>
            <p className="text-white font-bold text-sm mt-0.5">{order.status}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="text-green-200 mb-0.5">Delivery To</p>
            <p className="font-semibold text-white truncate">{order.deliveryLocation || '—'}</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="text-green-200 mb-0.5">Order #</p>
            <p className="font-semibold text-white font-mono">{order.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </div>

      {/* Vertical tracking timeline */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 pb-3 border-b border-gray-100">
          Delivery Status
        </h3>

        <div className="relative">
          {DELIVERY_FLOW.map((step, i) => {
            const completed = i < currentIdx
            const active    = i === currentIdx
            const pending   = i > currentIdx
            const ev        = timelineByStatus[step.status]

            return (
              <div key={step.status} className="flex gap-4 pb-8 last:pb-0 relative">
                {/* Vertical line */}
                {i < DELIVERY_FLOW.length - 1 && (
                  <div className={`absolute left-5 top-10 bottom-0 w-0.5
                    ${completed ? 'bg-agri-green' : 'bg-gray-200'}`} />
                )}

                {/* Icon circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm
                  font-bold flex-shrink-0 z-10 transition-all
                  ${active    ? 'bg-agri-green text-white ring-4 ring-agri-green/20 text-base' : ''}
                  ${completed ? 'bg-green-100 text-green-700 text-base' : ''}
                  ${pending   ? 'bg-gray-100 text-gray-400 text-sm' : ''}`}>
                  {completed ? '✓' : pending ? (i + 1) : step.icon}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold
                      ${active    ? 'text-agri-green' : ''}
                      ${completed ? 'text-gray-800' : ''}
                      ${pending   ? 'text-gray-400' : ''}`}>
                      {step.label}
                    </p>
                    {active && (
                      <span className="text-xs font-semibold bg-agri-green text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  {ev ? (
                    <>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDate(ev.timestamp)} · {fmtTime(ev.timestamp)}
                      </p>
                      {ev.note && <p className="text-xs text-gray-500 mt-1">{ev.note}</p>}
                    </>
                  ) : active ? (
                    <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                  ) : pending ? (
                    <p className="text-xs text-gray-300 mt-0.5">Upcoming</p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Delivery details card */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
          Delivery Information
        </h3>
        <div className="space-y-0 divide-y divide-gray-50">
          {[
            { label: 'Pickup Location',    value: order.pickupLocation },
            { label: 'Delivery Location',  value: order.deliveryLocation },
            { label: 'Scheduled Pickup',   value: fmtDate(order.scheduledPickupDate) },
            { label: 'Delivered On',       value: fmtDate(order.actualDeliveryDate) },
            { label: 'Farmer',             value: order.farmer?.name },
            { label: 'Farm Location',      value: order.farmer?.farmLocation },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-2.5 gap-4">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* GPS placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-center">
        <p className="text-sm font-semibold text-gray-600 mb-1">📍 Live GPS Tracking</p>
        <p className="text-xs text-gray-400">
          Real-time GPS tracking will be available in the Transporter module.
          Status-based tracking is shown above.
        </p>
      </div>
    </div>
  )
}
