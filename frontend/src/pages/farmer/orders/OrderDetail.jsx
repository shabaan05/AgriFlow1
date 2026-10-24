import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }   from 'react-router-dom'
import { fetchOrderById, fetchOrderPickupRequest } from '../../../services/ordersApi.js'
import { useOrders }                from '../../../context/OrdersContext.jsx'
import OrderStatusBadge             from '../../../components/orders/OrderStatusBadge.jsx'
import ConfirmDialog                from '../../../components/orders/ConfirmDialog.jsx'

const ORDER_FLOW = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered']

/**
 * Actions the FARMER can take.
 * Once an order is Ready for Pickup the transporter handles status advancement
 * (Picked Up → In Transit → Delivered). The farmer only needs to see status.
 */
const FARMER_ACTIONS = {
  Confirmed: { label: 'Start Preparing',       next: 'Preparing' },
  Preparing: { label: 'Mark Ready for Pickup',  next: 'Ready for Pickup' },
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

function StatusTimeline({ timeline, status }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        Order Timeline
      </h3>
      <div className="flex items-center overflow-x-auto pb-1 gap-0">
        {ORDER_FLOW.map((s, i) => {
          const currentIdx = ORDER_FLOW.indexOf(status)
          const done   = i < currentIdx
          const active = i === currentIdx
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${active ? 'bg-agri-green text-white ring-4 ring-agri-green/20' : ''}
                  ${done   ? 'bg-green-200 text-green-800' : ''}
                  ${!active && !done ? 'bg-gray-100 text-gray-400' : ''}`}>
                  {done ? '✓' : i + 1}
                </div>
                <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight
                  ${active ? 'text-agri-green' : done ? 'text-green-700' : 'text-gray-400'}`}
                  style={{ maxWidth: 72 }}>
                  {s}
                </p>
              </div>
              {i < ORDER_FLOW.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full flex-shrink-0
                  ${i < ORDER_FLOW.indexOf(status) ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      {/* Event log */}
      {timeline.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {[...timeline].reverse().map((ev, i) => (
            <div key={i} className="flex gap-3 text-xs text-gray-600">
              <span className="text-gray-400 flex-shrink-0 w-32">
                {new Date(ev.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="font-semibold text-gray-800">{ev.status}</span>
              {ev.note && <span className="text-gray-500">— {ev.note}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * PickupRequestPanel — shown when order is Ready for Pickup or beyond.
 * Fetches /api/orders/:id/pickup-request and displays transporter assignment
 * status so the farmer knows if someone has claimed the pickup.
 */
function PickupRequestPanel({ orderId }) {
  const [pickup,  setPickup]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState('')

  useEffect(() => {
    fetchOrderPickupRequest(orderId)
      .then(setPickup)
      .catch((e) => {
        // 404 means no pickup request yet — not a real error for display
        if (!e.message.includes('404') && !e.message.toLowerCase().includes('no pickup')) {
          setErr(e.message)
        }
      })
      .finally(() => setLoading(false))
  }, [orderId])

  const pickupStatusColor = {
    PENDING:   'text-amber-600 bg-amber-50 border-amber-200',
    ACCEPTED:  'text-green-700 bg-green-50 border-green-200',
    REJECTED:  'text-red-600 bg-red-50 border-red-200',
    COMPLETED: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    CANCELLED: 'text-gray-600 bg-gray-50 border-gray-200',
  }

  return (
    <div className="card mb-4">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        Pickup Request
      </h3>

      {loading ? (
        <div className="h-10 rounded-lg bg-gray-100 animate-pulse" />
      ) : err ? (
        <p className="text-sm text-red-500">{err}</p>
      ) : !pickup ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-semibold text-amber-700">Awaiting transporter</p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your pickup request has been created and is visible to available transporters.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold
            ${pickupStatusColor[pickup.status] || 'text-gray-600 bg-gray-50 border-gray-200'}`}>
            <span>{pickup.status === 'PENDING' ? '⏳' : pickup.status === 'ACCEPTED' ? '✅' : pickup.status === 'COMPLETED' ? '🏁' : '🔄'}</span>
            {pickup.status === 'PENDING' ? 'Awaiting transporter' :
             pickup.status === 'ACCEPTED' ? 'Transporter assigned' :
             pickup.status === 'COMPLETED' ? 'Delivery complete' :
             pickup.status}
          </div>

          {/* Transporter info if assigned */}
          {pickup.transporter ? (
            <div className="bg-agri-light rounded-xl px-4 py-3 space-y-1.5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Transporter</p>
              <p className="text-sm font-semibold text-gray-900">{pickup.transporter.name}</p>
              {pickup.transporter.phone && (
                <a href={`tel:${pickup.transporter.phone}`}
                  className="text-sm text-agri-green font-medium hover:underline flex items-center gap-1">
                  📞 {pickup.transporter.phone}
                </a>
              )}
            </div>
          ) : (
            pickup.status === 'PENDING' && (
              <p className="text-xs text-gray-500">
                No transporter has accepted yet. The request is live for all available transporters.
              </p>
            )
          )}

          {/* Logistics summary */}
          {(pickup.estimatedDistanceKm > 0 || pickup.pickupDate) && (
            <div className="grid grid-cols-2 gap-2 pt-1">
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
  )
}

const PICKUP_AND_BEYOND = ['Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered']

export default function OrderDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { advanceOrderStatus } = useOrders()

  const [order,    setOrder]    = useState(null)
  const [fetching, setFetching] = useState(true)
  const [error,    setError]    = useState('')
  const [dialog,   setDialog]   = useState(false)
  const [acting,   setActing]   = useState(false)
  const [note,     setNote]     = useState('')

  useEffect(() => {
    fetchOrderById(id)
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [id])

  if (fetching) return <div className="max-w-2xl space-y-4">{[1,2,3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
  if (!order)   return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-semibold text-gray-700">Order not found</p>
      <p className="text-sm text-gray-400">{error}</p>
      <button onClick={() => navigate('/farmer/orders')} className="btn-primary mt-4 text-sm px-6">Back</button>
    </div>
  )

  const nextAction = FARMER_ACTIONS[order.status]   // only Confirmed + Preparing
  const showPickupPanel = PICKUP_AND_BEYOND.includes(order.status)

  const date       = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const pickupDate = order.scheduledPickupDate
    ? new Date(order.scheduledPickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  async function handleAdvance() {
    setActing(true)
    try {
      const updated = await advanceOrderStatus(order.id, nextAction.next, note)
      setOrder(updated)
      setDialog(false)
      setNote('')
    } catch (e) {
      setError(e.message)
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/farmer/orders')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            Order — {order.buyerCompany || order.buyerName}
            <OrderStatusBadge status={order.status} />
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Created {date}</p>
        </div>
        {nextAction && (
          <button onClick={() => setDialog(true)} className="btn-primary text-sm px-5">
            {nextAction.label} →
          </button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

      <StatusTimeline timeline={order.timeline} status={order.status} />

      {/* Pickup request panel — visible once order is ready for pickup */}
      {showPickupPanel && <PickupRequestPanel orderId={order.id} />}

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Buyer</h3>
        <Row label="Name"    value={order.buyerName} />
        <Row label="Company" value={order.buyerCompany} />
      </div>

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Crop & Terms</h3>
        <Row label="Crop"           value={`${order.cropName}${order.variety ? ` · ${order.variety}` : ''}`} />
        <Row label="Quantity"       value={`${order.quantity} ${order.unit}`} />
        <Row label="Price per unit" value={`₹${order.pricePerUnit}/${order.unit}`} highlight />
        <Row label="Total Amount"   value={`₹${order.totalAmount.toLocaleString()}`} highlight />
      </div>

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Logistics</h3>
        <Row label="Pickup Location"   value={order.pickupLocation} />
        <Row label="Delivery Location" value={order.deliveryLocation} />
        <Row label="Scheduled Pickup"  value={pickupDate} />
        {order.actualDeliveryDate && (
          <Row label="Actual Delivery" value={new Date(order.actualDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
        )}
      </div>

      {/* Farmer-action confirmation dialog */}
      {dialog && nextAction && (
        <ConfirmDialog
          title={`${nextAction.label}?`}
          message={`Move order to "${nextAction.next}"?`}
          confirmLabel={nextAction.label}
          onConfirm={handleAdvance}
          onCancel={() => setDialog(false)}
          loading={acting}
        >
          <textarea
            rows={2}
            className="input-field resize-none text-sm mt-2"
            placeholder="Add a note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </ConfirmDialog>
      )}
    </div>
  )
}
