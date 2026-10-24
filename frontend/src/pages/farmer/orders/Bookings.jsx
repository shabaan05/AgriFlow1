import React, { useState } from 'react'
import { useNavigate }     from 'react-router-dom'
import { useOrders }       from '../../../context/OrdersContext.jsx'
import OrderStatusBadge    from '../../../components/orders/OrderStatusBadge.jsx'
import ConfirmDialog       from '../../../components/orders/ConfirmDialog.jsx'
import PageHeader          from '../../../components/ui/PageHeader.jsx'

const FILTERS = ['All', 'Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed']

function BookingCard({ booking, onAccept, onReject }) {
  const navigate = useNavigate()
  const date = booking.createdAt
    ? new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const deliveryDate = booking.requestedDeliveryDate
    ? new Date(booking.requestedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div className="card border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{booking.buyerCompany || booking.buyerName}</h3>
            <OrderStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{booking.buyerName} · {date}</p>
        </div>
        <p className="text-lg font-bold text-agri-green">₹{booking.totalAmount.toLocaleString()}</p>
      </div>

      {/* Crop info */}
      <div className="bg-gray-50 rounded-xl px-4 py-2.5 mb-4 flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold text-gray-800">{booking.cropName}</p>
          <p className="text-xs text-gray-500">{booking.variety}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-800">{booking.quantity} {booking.unit}</p>
          <p className="text-xs text-gray-500">@ ₹{booking.pricePerUnit}/{booking.unit}</p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div>
          <p className="text-gray-400">Delivery Location</p>
          <p className="font-medium text-gray-700 truncate">{booking.deliveryLocation || '—'}</p>
        </div>
        <div>
          <p className="text-gray-400">Requested By</p>
          <p className="font-medium text-gray-700">{deliveryDate}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/farmer/bookings/${booking.id}`)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700
                     hover:bg-gray-100 transition-colors"
        >
          View Details
        </button>
        {booking.status === 'Pending' && (
          <>
            <button
              onClick={() => onAccept(booking)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-agri-green text-white
                         hover:bg-agri-dark transition-colors"
            >
              Accept
            </button>
            <button
              onClick={() => onReject(booking)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600
                         hover:bg-red-100 transition-colors border border-red-200"
            >
              Reject
            </button>
          </>
        )}
        {booking.status === 'Accepted' && booking.orderId && (
          <button
            onClick={() => navigate(`/farmer/orders/${booking.orderId}`)}
            className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700
                       hover:bg-blue-100 transition-colors"
          >
            View Order →
          </button>
        )}
      </div>
    </div>
  )
}

export default function Bookings() {
  const { bookings, loading, error, acceptBooking, rejectBooking } = useOrders()

  const [filter,       setFilter]       = useState('All')
  const [actionTarget, setActionTarget] = useState(null)   // { booking, type: 'accept'|'reject' }
  const [rejectReason, setRejectReason] = useState('')
  const [acting,       setActing]       = useState(false)
  const [feedback,     setFeedback]     = useState('')

  const filtered = filter === 'All' ? bookings : bookings.filter((b) => b.status === filter)
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length

  async function handleConfirmAction() {
    if (!actionTarget) return
    setActing(true)
    try {
      if (actionTarget.type === 'accept') {
        await acceptBooking(actionTarget.booking.id)
        setFeedback(`Booking from ${actionTarget.booking.buyerName} accepted. Order created.`)
      } else {
        await rejectBooking(actionTarget.booking.id, rejectReason)
        setFeedback(`Booking from ${actionTarget.booking.buyerName} rejected.`)
      }
      setActionTarget(null)
      setRejectReason('')
      setTimeout(() => setFeedback(''), 4000)
    } catch (e) {
      setFeedback(`Error: ${e.message}`)
    } finally {
      setActing(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle={`${bookings.length} total · ${pendingCount} pending action`}
      />

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium
                        px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map((f) => {
          const count = f === 'All' ? bookings.length : bookings.filter((b) => b.status === f).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filter === f
                  ? 'bg-agri-green text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}
            >
              {f} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
            </button>
          )
        })}
      </div>

      {loading && bookings.length === 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📋</div>
          <p className="font-semibold text-gray-700">No bookings found</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter !== 'All' ? `No ${filter.toLowerCase()} bookings.` : 'Bookings from buyers will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onAccept={(bk) => setActionTarget({ booking: bk, type: 'accept' })}
              onReject={(bk) => setActionTarget({ booking: bk, type: 'reject' })}
            />
          ))}
        </div>
      )}

      {/* Accept dialog */}
      {actionTarget?.type === 'accept' && (
        <ConfirmDialog
          title="Accept Booking?"
          message={`Accept booking from ${actionTarget.booking.buyerCompany || actionTarget.booking.buyerName} for ${actionTarget.booking.quantity} ${actionTarget.booking.unit} of ${actionTarget.booking.cropName}? An Order will be created automatically.`}
          confirmLabel="Accept & Create Order"
          onConfirm={handleConfirmAction}
          onCancel={() => setActionTarget(null)}
          loading={acting}
        />
      )}

      {/* Reject dialog */}
      {actionTarget?.type === 'reject' && (
        <ConfirmDialog
          title="Reject Booking?"
          message={`Reject booking from ${actionTarget.booking.buyerName}?`}
          confirmLabel="Reject Booking"
          confirmCls="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleConfirmAction}
          onCancel={() => setActionTarget(null)}
          loading={acting}
        >
          <textarea
            rows={2}
            className="input-field resize-none text-sm mt-2"
            placeholder="Reason for rejection (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </ConfirmDialog>
      )}
    </div>
  )
}
