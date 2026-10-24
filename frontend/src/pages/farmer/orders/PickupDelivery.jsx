import React, { useState, useEffect } from 'react'
import { useNavigate }  from 'react-router-dom'
import { useOrders }    from '../../../context/OrdersContext.jsx'
import { fetchOrderPickupRequest } from '../../../services/ordersApi.js'
import OrderStatusBadge from '../../../components/orders/OrderStatusBadge.jsx'
import PageHeader       from '../../../components/ui/PageHeader.jsx'

// ── Colour helpers ─────────────────────────────────────────────────────────────
const urgencyBg = {
  'Ready for Pickup': 'border-violet-200 bg-violet-50/30',
  'Picked Up':        'border-blue-200   bg-blue-50/30',
  'In Transit':       'border-blue-200   bg-blue-50/30',
  Confirmed:          'border-gray-200',
  Preparing:          'border-orange-200 bg-orange-50/20',
}

const statusIcon = {
  Confirmed:          '📋',
  Preparing:          '🌾',
  'Ready for Pickup': '✅',
  'Picked Up':        '🚛',
  'In Transit':       '🚛',
}

const pickupStatusColor = {
  PENDING:   { bar: 'bg-amber-400',  text: 'text-amber-700',  bg: 'bg-amber-50  border-amber-200'  },
  ACCEPTED:  { bar: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50  border-green-200'  },
  REJECTED:  { bar: 'bg-red-400',    text: 'text-red-700',    bg: 'bg-red-50    border-red-200'    },
  COMPLETED: { bar: 'bg-emerald-500',text: 'text-emerald-700',bg: 'bg-emerald-50 border-emerald-200'},
  CANCELLED: { bar: 'bg-gray-400',   text: 'text-gray-600',   bg: 'bg-gray-50   border-gray-200'  },
}

const TIMELINE_STEPS = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered']

// ── Pickup status timeline ─────────────────────────────────────────────────────
function MiniTimeline({ status }) {
  const currentIdx = TIMELINE_STEPS.indexOf(status)
  return (
    <div className="flex items-center gap-0 overflow-x-auto py-2">
      {TIMELINE_STEPS.map((s, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center min-w-[52px]">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                ${active ? 'bg-agri-green text-white ring-2 ring-agri-green/20' : ''}
                ${done   ? 'bg-green-200 text-green-800' : ''}
                ${!active && !done ? 'bg-gray-100 text-gray-400' : ''}`}>
                {done ? '✓' : i + 1}
              </div>
              <p className={`text-[9px] mt-1 text-center leading-tight
                ${active ? 'text-agri-green font-semibold' : done ? 'text-green-700' : 'text-gray-400'}`}
                style={{ maxWidth: 50 }}>
                {s}
              </p>
            </div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div className={`h-px flex-1 mx-0.5 mb-4 rounded-full flex-shrink-0
                ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ── Per-order Manage panel ─────────────────────────────────────────────────────
function ManagePanel({ order, onClose, onViewOrder }) {
  const [pickup,  setPickup]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState('')

  useEffect(() => {
    fetchOrderPickupRequest(order.id)
      .then(setPickup)
      .catch((e) => {
        if (!e.message.includes('404') && !e.message.toLowerCase().includes('no pickup')) {
          setErr(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [order.id])

  const pickupDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const pickupRequestVisible = ['Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered'].includes(order.status)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Manage Shipment</h2>
            <p className="text-xs text-gray-400 mt-0.5">{order.cropName} → {order.buyerCompany || order.buyerName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 text-sm">✕</button>
        </div>

        <div className="p-5 space-y-5">
          {/* Status + badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <OrderStatusBadge status={order.status} />
            <span className="text-sm text-gray-500">Order #{order.id.slice(-6).toUpperCase()}</span>
          </div>

          {/* Status timeline */}
          <div className="card !p-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Progress</p>
            <MiniTimeline status={order.status} />
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-agri-light rounded-xl px-3 py-3">
              <p className="text-xs text-gray-500 mb-1">📍 Pickup Location</p>
              <p className="text-sm font-semibold text-gray-800">{order.pickupLocation || 'Farm location'}</p>
            </div>
            <div className="bg-agri-light rounded-xl px-3 py-3">
              <p className="text-xs text-gray-500 mb-1">🏁 Delivery Location</p>
              <p className="text-sm font-semibold text-gray-800">{order.deliveryLocation || '—'}</p>
            </div>
          </div>

          {/* Order details */}
          <div className="card !p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Order Details</p>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Crop</span>
              <span className="font-medium text-gray-800">{order.cropName}{order.variety ? ` · ${order.variety}` : ''}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Quantity</span>
              <span className="font-medium text-gray-800">{order.quantity} {order.unit}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-semibold text-agri-green">₹{order.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Scheduled Pickup</span>
              <span className="font-medium text-gray-800">{pickupDate(order.scheduledPickupDate)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Buyer</span>
              <span className="font-medium text-gray-800">{order.buyerCompany || order.buyerName}</span>
            </div>
          </div>

          {/* Pickup request / transporter section */}
          {pickupRequestVisible && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Pickup Request</p>

              {loading ? (
                <div className="h-16 rounded-xl bg-gray-100 animate-pulse" />
              ) : err ? (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{err}</div>
              ) : !pickup ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-start gap-3">
                  <span className="text-xl mt-0.5">⏳</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-700">Awaiting transporter</p>
                    <p className="text-xs text-amber-600 mt-0.5">
                      Your pickup request is live and visible to available transporters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Status pill */}
                  {(() => {
                    const c = pickupStatusColor[pickup.status] || pickupStatusColor.PENDING
                    const label = {
                      PENDING:   '⏳ Awaiting transporter',
                      ACCEPTED:  '✅ Transporter assigned',
                      COMPLETED: '🏁 Delivery completed',
                      REJECTED:  '⚠️ Rejected — awaiting new transporter',
                      CANCELLED: '✕ Cancelled',
                    }[pickup.status] || pickup.status
                    return (
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${c.text} ${c.bg}`}>
                        {label}
                      </div>
                    )
                  })()}

                  {/* Transporter info */}
                  {pickup.transporter ? (
                    <div className="bg-agri-light rounded-xl px-4 py-3 space-y-1.5">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Assigned Transporter</p>
                      <p className="text-sm font-bold text-gray-900">{pickup.transporter.name}</p>
                      {pickup.transporter.phone && (
                        <a href={`tel:${pickup.transporter.phone}`}
                          className="text-sm text-agri-green font-medium hover:underline flex items-center gap-1.5">
                          📞 {pickup.transporter.phone}
                        </a>
                      )}
                    </div>
                  ) : (
                    pickup.status === 'PENDING' && (
                      <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                        No transporter has accepted yet. Once a transporter accepts, their details will appear here.
                      </p>
                    )
                  )}

                  {/* Estimates */}
                  {(pickup.estimatedDistanceKm > 0 || pickup.estimatedDurationHrs > 0) && (
                    <div className="grid grid-cols-2 gap-2">
                      {pickup.estimatedDistanceKm > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 px-3 py-2">
                          <p className="text-xs text-gray-400">Est. Distance</p>
                          <p className="text-sm font-semibold text-gray-800">{pickup.estimatedDistanceKm} km</p>
                        </div>
                      )}
                      {pickup.estimatedDurationHrs > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 px-3 py-2">
                          <p className="text-xs text-gray-400">Est. Duration</p>
                          <p className="text-sm font-semibold text-gray-800">{pickup.estimatedDurationHrs} hrs</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* If order is not yet Ready for Pickup, show info */}
          {!pickupRequestVisible && (
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              <p className="text-sm text-gray-500">
                A pickup request will be created automatically when you mark this order <strong className="text-gray-700">Ready for Pickup</strong>.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 rounded-b-2xl flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onViewOrder}
            className="flex-1 py-2.5 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors"
          >
            View Full Order →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main PickupDelivery page ───────────────────────────────────────────────────
export default function PickupDelivery() {
  const navigate             = useNavigate()
  const { pickups, loading, error } = useOrders()
  const [selected, setSelected] = useState(null)  // order being managed

  const pickupDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : 'TBD'

  return (
    <div>
      <PageHeader
        title="Pickup & Delivery"
        subtitle={`${pickups.length} active shipment${pickups.length !== 1 ? 's' : ''}`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {loading && pickups.length === 0 ? (
        <div className="space-y-4">
          {[1,2,3].map((i) => <div key={i} className="card h-36 animate-pulse" />)}
        </div>
      ) : pickups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🚛</div>
          <p className="font-semibold text-gray-700">No upcoming pickups</p>
          <p className="text-sm text-gray-400 mt-1">Accepted orders will appear here once confirmed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map((order) => (
            <div
              key={order.id}
              className={`card border-2 ${urgencyBg[order.status] || 'border-gray-200'} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-12 h-12 bg-white rounded-2xl border border-gray-100 shadow-sm
                                flex items-center justify-center text-2xl flex-shrink-0">
                  {statusIcon[order.status] || '📦'}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900">{order.cropName}</h3>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {order.quantity} {order.unit} → {order.buyerCompany || order.buyerName}
                  </p>

                  {/* Locations */}
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0.5">📍 Pickup</p>
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {order.pickupLocation || 'Farm location'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 px-3 py-2">
                      <p className="text-xs text-gray-400 mb-0.5">🏁 Delivery</p>
                      <p className="text-xs font-medium text-gray-700 truncate">
                        {order.deliveryLocation || '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date + amount + Manage button */}
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
                  <p className="text-base font-bold text-agri-green">
                    ₹{order.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    Pickup {pickupDate(order.scheduledPickupDate)}
                  </p>
                  <button
                    onClick={() => setSelected(order)}
                    className="text-xs font-semibold text-white bg-agri-green hover:bg-agri-dark transition-colors px-3 py-1.5 rounded-lg"
                  >
                    Manage →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Manage panel */}
      {selected && (
        <ManagePanel
          order={selected}
          onClose={() => setSelected(null)}
          onViewOrder={() => {
            setSelected(null)
            navigate(`/farmer/orders/${selected.id}`)
          }}
        />
      )}
    </div>
  )
}
