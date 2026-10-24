import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchTripById, markTripPickedUp, markTripInTransit, markTripDelivered } from '../../../services/transporterApi.js'

const DELIVERY_FLOW = [
  { status: 'Ready for Pickup', icon: '✅', label: 'Pickup Confirmed',   desc: 'Order is ready for pickup at the farm.' },
  { status: 'Picked Up',        icon: '🚛', label: 'Picked Up',          desc: 'You have picked up the crop from the farmer.' },
  { status: 'In Transit',       icon: '🚛', label: 'In Transit',         desc: 'You are on the way to the delivery location.' },
  { status: 'Delivered',        icon: '🎉', label: 'Delivered',          desc: 'Order has been delivered to the buyer.' },
]

const NEXT_ACTION = {
  'Ready for Pickup': { label: 'Mark as Picked Up',  action: 'pickup',   next: 'Picked Up' },
  'Picked Up':        { label: 'Start Delivery',     action: 'transit',  next: 'In Transit' },
  'In Transit':       { label: 'Mark as Delivered',  action: 'delivered',next: 'Delivered' },
}

const orderStatusCls = {
  'Ready for Pickup': 'bg-violet-100 text-violet-700',
  'Picked Up':        'bg-teal-100 text-teal-700',
  'In Transit':       'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
}

function Section({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}`}>{value || '—'}</span>
    </div>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TripDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [trip,     setTrip]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [dialog,    setDialog]   = useState(null)
  const [acting,    setActing]   = useState(false)
  const [feedback,  setFeedback] = useState('')

  useEffect(() => {
    fetchTripById(id)
      .then(setTrip)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {[1,2,3,4].map((i) => <div key={i} className="card h-28" />)}
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Trip not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/transporter/trips')} className="btn-primary mt-4 text-sm px-6">Back to Trips</button>
      </div>
    )
  }

  const orderStatus   = trip.orderStatus || 'Ready for Pickup'
  const nextAction    = NEXT_ACTION[orderStatus]
  const currentIdx    = DELIVERY_FLOW.findIndex((s) => s.status === orderStatus)
  const isDelivered   = orderStatus === 'Delivered'

  async function handleAction() {
    if (!dialog) return
    setActing(true)
    try {
      let updated
      if (dialog === 'pickup')    updated = await markTripPickedUp(id)
      if (dialog === 'transit')   updated = await markTripInTransit(id)
      if (dialog === 'delivered') updated = await markTripDelivered(id)
      setTrip(updated)
      setDialog(null)
      setFeedback('✅ Status updated successfully.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setError(err.message)
      setDialog(null)
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button onClick={() => navigate('/transporter/trips')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        My Trips
      </button>

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {trip.cropName}
            <span className={`status-badge text-xs ${orderStatusCls[orderStatus] || 'bg-gray-100 text-gray-600'}`}>{orderStatus}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{trip.quantity} {trip.unit} · Order #{trip.orderId?.slice(-8).toUpperCase()}</p>
        </div>
        {nextAction && (
          <button onClick={() => setDialog(nextAction.action)} className="btn-primary text-sm px-5">
            {nextAction.label} →
          </button>
        )}
      </div>

      {/* Transport summary banner */}
      <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-green-200 text-xs font-semibold uppercase tracking-wider">🚛 Trip Summary</p>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">~{trip.estimatedDistanceKm} km</span>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded-full" />
            <div className="w-0.5 h-10 bg-white/30" />
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-green-200">Pickup</p>
              <p className="text-sm font-semibold">{trip.pickupLocation || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-green-200">Delivery</p>
              <p className="text-sm font-semibold">{trip.deliveryLocation || '—'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-200 text-xs">Earnings</p>
            <p className="text-2xl font-bold">₹{trip.estimatedEarnings?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Delivery timeline */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5 pb-3 border-b border-gray-100">Delivery Timeline</h3>
        <div className="relative">
          {DELIVERY_FLOW.map((step, i) => {
            const done   = i < currentIdx
            const active = i === currentIdx
            return (
              <div key={step.status} className="flex gap-4 pb-8 last:pb-0 relative">
                {i < DELIVERY_FLOW.length - 1 && (
                  <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${done ? 'bg-agri-green' : 'bg-gray-200'}`} />
                )}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10
                  ${active ? 'bg-agri-green text-white ring-4 ring-agri-green/20' : ''}
                  ${done   ? 'bg-green-100 text-green-700' : ''}
                  ${!active && !done ? 'bg-gray-100 text-gray-400' : ''}`}>
                  {done ? '✓' : step.icon}
                </div>
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${active ? 'text-agri-green' : done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </p>
                    {active && <span className="text-xs font-semibold bg-agri-green text-white px-2 py-0.5 rounded-full">Current</span>}
                  </div>
                  {/* Show timestamp from order timeline if available */}
                  {(() => {
                    const ev = trip.orderTimeline?.find((e) => e.status === step.status)
                    if (ev) return <p className="text-xs text-gray-400 mt-0.5">{fmtDate(ev.timestamp)}</p>
                    if (active) return <p className="text-xs text-gray-400 mt-0.5">{step.desc}</p>
                    if (done) return null
                    return <p className="text-xs text-gray-300 mt-0.5">Awaiting</p>
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Section title="Order Details">
        <Row label="Crop"          value={`${trip.cropName}${trip.variety ? ` · ${trip.variety}` : ''}`} />
        <Row label="Quantity"      value={`${trip.quantity} ${trip.unit}`} />
        <Row label="Order Value"   value={`₹${trip.totalAmount?.toLocaleString()}`} highlight />
        <Row label="Buyer"         value={trip.buyerCompany || trip.buyerName} />
      </Section>

      {trip.farmer && (
        <Section title="Farmer / Pickup">
          <Row label="Name"        value={trip.farmer.name} />
          <Row label="Farm"        value={trip.farmer.farmName || '—'} />
          <Row label="Location"    value={trip.farmer.farmLocation || trip.pickupLocation} />
          <Row label="Contact"     value={trip.farmer.phone || '—'} />
          <Row label="Verified"    value={trip.farmer.verification === 'Verified' ? '✓ Verified' : 'Unverified'} />
        </Section>
      )}

      <Section title="Delivery">
        <Row label="Delivery Location"  value={trip.deliveryLocation} />
        <Row label="Pickup Date"         value={fmtDate(trip.pickupDate)} />
        {trip.actualDeliveryDate && <Row label="Delivered On" value={fmtDate(trip.actualDeliveryDate)} />}
      </Section>

      <Section title="Transport">
        <Row label="Est. Distance"  value={`${trip.estimatedDistanceKm} km`} />
        <Row label="Est. Duration"   value={`~${trip.estimatedDurationHrs} hours`} />
        <Row label="Est. Earnings"   value={`₹${trip.estimatedEarnings?.toLocaleString()}`} highlight />
      </Section>

      {dialog && (
        <ConfirmDialog
          title={nextAction?.label + '?' || 'Confirm Action'}
          message={`Update trip status to "${NEXT_ACTION[orderStatus]?.next}"? This will sync with the farmer and buyer.`}
          confirmLabel={nextAction?.label || 'Confirm'}
          onConfirm={handleAction}
          onCancel={() => !acting && setDialog(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
