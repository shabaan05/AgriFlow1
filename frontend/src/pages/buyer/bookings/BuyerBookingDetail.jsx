import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchBookingById, cancelBookingByBuyer } from '../../../services/ordersApi.js'

const statusCls = {
  Pending:   'bg-amber-100 text-amber-700',
  Accepted:  'bg-green-100 text-green-800',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  Completed: 'bg-emerald-100 text-emerald-800',
}

const BOOKING_FLOW = [
  { key: 'Pending',  label: 'Booking Submitted',   desc: 'Your booking request has been sent to the farmer.' },
  { key: 'review',   label: 'Farmer Review',        desc: 'The farmer is reviewing your request.' },
  { key: 'Accepted', label: 'Accepted / Order Created', desc: 'Farmer accepted. An order has been created.' },
]

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

function CancelDialog({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Cancel Booking?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Cancel your booking for <span className="font-semibold">{name}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">Keep</button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Cancelling…
              </>
            ) : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BuyerBookingDetail() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const location    = useLocation()

  const [booking,   setBooking]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [dialog,    setDialog]    = useState(false)
  const [cancelling,setCancelling]= useState(false)

  useEffect(() => {
    fetchBookingById(id)
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {[1,2,3].map((i) => <div key={i} className="card h-28" />)}
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Booking not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/bookings')} className="btn-primary mt-4 text-sm px-6">Back to Bookings</button>
      </div>
    )
  }

  const isActive     = booking.status === 'Pending'
  const isAccepted   = booking.status === 'Accepted'
  const showBanner   = location.state?.fromCreate

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  // Derive timeline step index
  const timelineIdx = booking.status === 'Pending' ? 0
    : booking.status === 'Accepted' ? 2
    : booking.status === 'Rejected' ? -1  // special case
    : -2  // cancelled

  async function handleCancel() {
    setCancelling(true)
    try {
      const updated = await cancelBookingByBuyer(id)
      setBooking(updated)
      setDialog(false)
    } catch (err) {
      setError(err.message)
      setCancelling(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {showBanner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Booking request sent! The farmer will review and respond.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Back + header */}
      <button onClick={() => navigate('/buyer/bookings')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        My Bookings
      </button>

      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {booking.cropName}
            <span className={`status-badge text-xs ${statusCls[booking.status] || 'bg-gray-100 text-gray-600'}`}>{booking.status}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Booking #{booking.id.slice(-8).toUpperCase()} · {fmt(booking.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {isAccepted && booking.orderId && (
            <button onClick={() => navigate(`/buyer/delivery/${booking.orderId}`)}
              className="btn-primary text-sm px-5 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1" />
              </svg>
              Track Delivery
            </button>
          )}
          {isActive && (
            <button onClick={() => setDialog(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
              Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Status timeline */}
      {booking.status !== 'Cancelled' && (
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5 pb-3 border-b border-gray-100">
            Booking Status
          </h3>
          {booking.status === 'Rejected' ? (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold flex-shrink-0">✗</div>
              <div>
                <p className="font-semibold text-red-700">Booking Rejected</p>
                <p className="text-sm text-gray-500 mt-1">The farmer has declined this booking request.</p>
                {booking.rejectionReason && (
                  <p className="text-sm text-red-600 mt-2 bg-red-50 rounded-lg px-3 py-2">
                    <span className="font-semibold">Reason: </span>{booking.rejectionReason}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex gap-0 overflow-x-auto pb-1">
              {BOOKING_FLOW.map((step, i) => {
                const done   = i < timelineIdx
                const active = i === timelineIdx
                const pending = i > timelineIdx
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center min-w-[100px]">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                        ${active  ? 'bg-agri-green text-white ring-4 ring-agri-green/20' : ''}
                        ${done    ? 'bg-green-200 text-green-800' : ''}
                        ${pending ? 'bg-gray-100 text-gray-400'  : ''}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <p className={`text-[10px] font-medium mt-2 text-center leading-tight px-1
                        ${active  ? 'text-agri-green' : done ? 'text-green-700' : 'text-gray-400'}`}
                        style={{ maxWidth: 90 }}>
                        {step.label}
                      </p>
                    </div>
                    {i < BOOKING_FLOW.length - 1 && (
                      <div className={`h-0.5 flex-1 mx-1 mt-4 flex-shrink-0 rounded-full ${i < timelineIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          )}

          {isAccepted && booking.orderId && (
            <div className="mt-4 bg-agri-light border border-green-200 rounded-xl px-4 py-3 text-sm text-agri-green font-medium flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Order created. Click "Track Delivery" to follow your shipment.
            </div>
          )}
        </div>
      )}

      <Section title="Crop & Terms">
        <Row label="Crop"      value={`${booking.cropName}${booking.variety ? ` · ${booking.variety}` : ''}`} />
        <Row label="Quantity"  value={`${booking.quantity} ${booking.unit}`} />
        <Row label="Price"     value={`₹${booking.pricePerUnit}/${booking.unit}`} highlight />
        <Row label="Total"     value={`₹${booking.totalAmount?.toLocaleString()}`} highlight />
      </Section>

      <Section title="Logistics">
        <Row label="Delivery Location"    value={booking.deliveryLocation} />
        <Row label="Requested Delivery"   value={fmt(booking.requestedDeliveryDate)} />
      </Section>

      {(booking.buyerCompany || booking.notes) && (
        <Section title="Additional">
          {booking.buyerCompany && <Row label="Company" value={booking.buyerCompany} />}
          {booking.notes && (
            <div className="pt-2">
              <p className="text-xs text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed">{booking.notes}</p>
            </div>
          )}
        </Section>
      )}

      {dialog && (
        <CancelDialog
          name={booking.cropName}
          onConfirm={handleCancel}
          onCancel={() => !cancelling && setDialog(false)}
          loading={cancelling}
        />
      )}
    </div>
  )
}
