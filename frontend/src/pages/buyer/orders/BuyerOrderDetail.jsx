import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }  from 'react-router-dom'
import { fetchBuyerOrderById }     from '../../../services/ordersApi.js'

const ORDER_FLOW = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered']

const statusCls = {
  Confirmed:          'bg-blue-100 text-blue-700',
  Preparing:          'bg-orange-100 text-orange-700',
  'Ready for Pickup': 'bg-violet-100 text-violet-700',
  'Picked Up':        'bg-teal-100 text-teal-700',
  'In Transit':       'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
  Cancelled:          'bg-gray-100 text-gray-600',
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

function StatusTimeline({ timeline, status }) {
  const currentIdx = ORDER_FLOW.indexOf(status)
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Order Journey</h3>
      <div className="flex items-center overflow-x-auto pb-1 gap-0">
        {ORDER_FLOW.map((s, i) => {
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
                <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full flex-shrink-0 ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Timeline log */}
      {timeline?.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
          {[...timeline].reverse().map((ev, i) => (
            <div key={i} className="flex gap-3 text-xs text-gray-600">
              <span className="text-gray-400 flex-shrink-0 w-36">
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

export default function BuyerOrderDetail() {
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
        {[1,2,3,4].map((i) => <div key={i} className="card h-28" />)}
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

  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const isActive = !['Delivered', 'Cancelled'].includes(order.status)

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/buyer/orders')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        My Orders
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {order.cropName}
            <span className={`status-badge text-xs ${statusCls[order.status] || 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Order #{order.id.slice(-8).toUpperCase()} · Created {fmt(order.createdAt)}</p>
        </div>
        {isActive && (
          <button onClick={() => navigate(`/buyer/delivery/${order.id}`)}
            className="btn-primary text-sm px-5 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" />
            </svg>
            Track Delivery
          </button>
        )}
      </div>

      <StatusTimeline timeline={order.timeline} status={order.status} />

      <Section title="Order Details">
        <Row label="Crop"        value={`${order.cropName}${order.variety ? ` · ${order.variety}` : ''}`} />
        <Row label="Quantity"    value={`${order.quantity} ${order.unit}`} />
        <Row label="Price"       value={`₹${order.pricePerUnit}/${order.unit}`} highlight />
        <Row label="Total"       value={`₹${order.totalAmount?.toLocaleString()}`} highlight />
        <Row label="Order Date"  value={fmt(order.createdAt)} />
      </Section>

      {order.farmer && (
        <Section title="Farmer">
          <Row label="Name"         value={order.farmer.name} />
          <Row label="Farm"         value={order.farmer.farmName || '—'} />
          <Row label="Location"     value={order.farmer.farmLocation} />
          <Row label="Verified"     value={order.farmer.verification === 'Verified' ? '✓ Verified' : 'Unverified'} />
        </Section>
      )}

      <Section title="Delivery">
        <Row label="Pickup Location"    value={order.pickupLocation} />
        <Row label="Delivery Location"  value={order.deliveryLocation} />
        <Row label="Scheduled Pickup"   value={fmt(order.scheduledPickupDate)} />
        {order.actualDeliveryDate && (
          <Row label="Delivered On"     value={fmt(order.actualDeliveryDate)} />
        )}
      </Section>

      <Section title="Payment">
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
          Payment processing will be available in the upcoming Payments module.
        </div>
      </Section>
    </div>
  )
}
