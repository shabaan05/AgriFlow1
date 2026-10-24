import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBookingById }        from '../../../services/ordersApi.js'
import { useOrders }               from '../../../context/OrdersContext.jsx'
import OrderStatusBadge            from '../../../components/orders/OrderStatusBadge.jsx'
import ConfirmDialog               from '../../../components/orders/ConfirmDialog.jsx'
import PageHeader                  from '../../../components/ui/PageHeader.jsx'

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

export default function BookingDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const { acceptBooking, rejectBooking } = useOrders()

  const [booking,      setBooking]      = useState(null)
  const [fetching,     setFetching]     = useState(true)
  const [error,        setError]        = useState('')
  const [dialog,       setDialog]       = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [acting,       setActing]       = useState(false)

  useEffect(() => {
    fetchBookingById(id)
      .then(setBooking)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [id])

  if (fetching) return <div className="max-w-2xl space-y-4">{[1,2,3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}</div>
  if (!booking) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p className="font-semibold text-gray-700">Booking not found</p>
      <p className="text-sm text-gray-400">{error}</p>
      <button onClick={() => navigate('/farmer/orders')} className="btn-primary mt-4 text-sm px-6">Back</button>
    </div>
  )

  const date         = new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const deliveryDate = booking.requestedDeliveryDate
    ? new Date(booking.requestedDeliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  async function handleAction() {
    setActing(true)
    try {
      if (dialog === 'accept') {
        const updated = await acceptBooking(booking.id)
        setBooking(updated)
        navigate(`/farmer/orders/${updated.orderId}`)
      } else {
        const updated = await rejectBooking(booking.id, rejectReason)
        setBooking(updated)
      }
      setDialog(null)
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
        Bookings & Orders
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {booking.buyerCompany || booking.buyerName}
            <OrderStatusBadge status={booking.status} />
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Booked on {date}</p>
        </div>
        {booking.status === 'Pending' && (
          <div className="flex gap-2">
            <button onClick={() => setDialog('accept')} className="btn-primary text-sm px-5">Accept</button>
            <button onClick={() => setDialog('reject')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
              Reject
            </button>
          </div>
        )}
        {booking.status === 'Accepted' && booking.orderId && (
          <button onClick={() => navigate(`/farmer/orders/${booking.orderId}`)}
            className="btn-outline text-sm px-5">View Order →</button>
        )}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Buyer</h3>
        <Row label="Name"    value={booking.buyerName} />
        <Row label="Company" value={booking.buyerCompany} />
        <Row label="Contact" value={booking.buyerContact} />
      </div>

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Crop & Terms</h3>
        <Row label="Crop"           value={`${booking.cropName}${booking.variety ? ` · ${booking.variety}` : ''}`} />
        <Row label="Quantity"       value={`${booking.quantity} ${booking.unit}`} />
        <Row label="Price per unit" value={`₹${booking.pricePerUnit}/${booking.unit}`} highlight />
        <Row label="Total Amount"   value={`₹${booking.totalAmount.toLocaleString()}`} highlight />
      </div>

      <div className="card mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Logistics</h3>
        <Row label="Delivery Location"      value={booking.deliveryLocation} />
        <Row label="Requested Delivery Date" value={deliveryDate} />
      </div>

      {booking.notes && (
        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-3 border-b border-gray-100">Notes</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{booking.notes}</p>
        </div>
      )}

      {booking.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">Rejection reason: </span>{booking.rejectionReason}
        </div>
      )}

      {dialog === 'accept' && (
        <ConfirmDialog
          title="Accept Booking?"
          message="Accept this booking? An Order will be created automatically."
          confirmLabel="Accept & Create Order"
          onConfirm={handleAction}
          onCancel={() => setDialog(null)}
          loading={acting}
        />
      )}

      {dialog === 'reject' && (
        <ConfirmDialog
          title="Reject Booking?"
          message="Reject this booking?"
          confirmLabel="Reject"
          confirmCls="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={handleAction}
          onCancel={() => setDialog(null)}
          loading={acting}
        >
          <textarea
            rows={2}
            className="input-field resize-none text-sm mt-2"
            placeholder="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </ConfirmDialog>
      )}
    </div>
  )
}
