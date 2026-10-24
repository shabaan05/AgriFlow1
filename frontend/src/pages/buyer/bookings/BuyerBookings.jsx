import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate }          from 'react-router-dom'
import { fetchBuyerBookings, cancelBookingByBuyer } from '../../../services/ordersApi.js'
import PageHeader               from '../../../components/ui/PageHeader.jsx'

const statusCls = {
  Pending:   'bg-amber-100 text-amber-700',
  Accepted:  'bg-green-100 text-green-800',
  Rejected:  'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-600',
  Completed: 'bg-emerald-100 text-emerald-800',
}

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled']

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function CancelDialog({ booking, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Cancel Booking?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Cancel your booking for <span className="font-semibold text-gray-800">{booking?.cropName}</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Keep
          </button>
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

function BookingCard({ booking, onCancel }) {
  const navigate   = useNavigate()
  const isActive   = booking.status === 'Pending'
  const isAccepted = booking.status === 'Accepted'

  const bookingDate = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const deliveryDate = booking.requestedDeliveryDate
    ? new Date(booking.requestedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="card border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{booking.cropName}</h3>
            {booking.variety && <span className="text-xs text-gray-400">· {booking.variety}</span>}
          </div>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">#{booking.id.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-xs">
        <div>
          <span className="text-gray-400">Quantity</span>
          <p className="font-medium text-gray-800">{booking.quantity?.toLocaleString()} {booking.unit}</p>
        </div>
        <div>
          <span className="text-gray-400">Price</span>
          <p className="font-medium text-gray-800">₹{booking.pricePerUnit}/{booking.unit}</p>
        </div>
        <div>
          <span className="text-gray-400">Total</span>
          <p className="font-semibold text-agri-green">₹{booking.totalAmount?.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-gray-400">Booked On</span>
          <p className="font-medium text-gray-800">{bookingDate}</p>
        </div>
        <div className="col-span-2">
          <span className="text-gray-400">Requested Delivery</span>
          <p className="font-medium text-gray-800">{deliveryDate}</p>
        </div>
      </div>

      {/* Rejection reason */}
      {booking.status === 'Rejected' && booking.rejectionReason && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-3">
          <p className="text-xs text-red-600"><span className="font-semibold">Reason: </span>{booking.rejectionReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/buyer/bookings/${booking.id}`)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-agri-light text-agri-green hover:bg-green-100 transition-colors">
          View Details
        </button>
        {isAccepted && booking.orderId && (
          <button
            onClick={() => navigate(`/buyer/delivery/${booking.orderId}`)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            Track Delivery
          </button>
        )}
        {isActive && (
          <button
            onClick={() => onCancel(booking)}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

export default function BuyerBookings() {
  const navigate = useNavigate()

  const [bookings,    setBookings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [filter,      setFilter]      = useState('All')
  const [cancelTarget,setCancelTarget]= useState(null)
  const [cancelling,  setCancelling]  = useState(false)
  const [feedback,    setFeedback]    = useState('')

  function load() {
    setLoading(true)
    fetchBuyerBookings()
      .then(setBookings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => (
    filter === 'All' ? bookings : bookings.filter((b) => b.status === filter)
  ), [bookings, filter])

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length

  async function confirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const updated = await cancelBookingByBuyer(cancelTarget.id)
      setBookings((prev) => prev.map((b) => (b.id === cancelTarget.id ? updated : b)))
      setFeedback(`Booking for ${cancelTarget.cropName} cancelled.`)
      setTimeout(() => setFeedback(''), 4000)
      setCancelTarget(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle={`${bookings.length} total · ${pendingCount} awaiting response`}
        action={
          <button onClick={() => navigate('/buyer/marketplace')} className="btn-outline text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Browse Marketplace
          </button>
        }
      />

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); load() }} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === 'All' ? bookings.length : bookings.filter((b) => b.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filter === f ? 'bg-agri-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}>
              {f} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading && bookings.length === 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📋</div>
          <p className="font-semibold text-gray-700">
            {bookings.length === 0 ? 'No bookings yet' : 'No bookings match this filter'}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {bookings.length === 0
              ? 'Browse the Marketplace, open a crop and click "Book / Pre-book" to send your first booking request.'
              : 'Try a different status filter.'}
          </p>
          {bookings.length === 0 && (
            <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-5 text-sm px-6">
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <BookingCard key={b.id} booking={b} onCancel={setCancelTarget} />
          ))}
        </div>
      )}

      {cancelTarget && (
        <CancelDialog
          booking={cancelTarget}
          onConfirm={confirmCancel}
          onCancel={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  )
}
