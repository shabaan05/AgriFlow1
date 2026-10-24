import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchBuyerOrders } from '../../../services/ordersApi.js'
import PageHeader from '../../../components/ui/PageHeader.jsx'

const statusCls = {
  Confirmed:          'bg-blue-100 text-blue-700',
  Preparing:          'bg-orange-100 text-orange-700',
  'Ready for Pickup': 'bg-violet-100 text-violet-700',
  'Picked Up':        'bg-teal-100 text-teal-700',
  'In Transit':       'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
  Cancelled:          'bg-gray-100 text-gray-600',
}

const ACTIVE = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit']

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function lastUpdated(order) {
  const times = []
  if (order.updatedAt) times.push(order.updatedAt)
  if (order.createdAt) times.push(order.createdAt)
  ;(order.timeline || []).forEach((ev) => { if (ev.timestamp) times.push(ev.timestamp) })
  if (times.length === 0) return null
  return times.reduce((latest, t) => (new Date(t) > new Date(latest) ? t : latest))
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3 p-5">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      ))}
      <div className="h-9 bg-gray-100 rounded-xl" />
    </div>
  )
}

function DeliveryCard({ order, onTrack }) {
  return (
    <div className="card border border-gray-100 hover:shadow-md hover:border-agri-green/20 transition-all duration-200 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{order.cropName}</h3>
          <p className="text-xs text-gray-400 mt-0.5 font-mono">#{order.id.slice(-8).toUpperCase()}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex-1 space-y-2 text-sm mb-4">
        <div className="flex justify-between gap-3">
          <span className="text-gray-400">Farmer</span>
          <span className="font-medium text-gray-800 text-right">{order.farmer?.name || '—'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-400">Quantity</span>
          <span className="font-medium text-gray-800">{order.quantity} {order.unit}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-400">Delivery location</span>
          <span className="font-medium text-gray-800 text-right">{order.deliveryLocation || '—'}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-400">Expected delivery</span>
          <span className="font-medium text-gray-800">
            {fmtDate(order.scheduledPickupDate || order.actualDeliveryDate)}
          </span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-gray-400">Last updated</span>
          <span className="text-gray-600 text-right">{fmtDateTime(lastUpdated(order))}</span>
        </div>
      </div>

      <button
        onClick={() => onTrack(order.id)}
        className="w-full py-2.5 rounded-xl text-sm font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors"
      >
        Track Delivery
      </button>
    </div>
  )
}

export default function BuyerDeliveryList() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('Active')

  function load() {
    setLoading(true)
    fetchBuyerOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const deliveries = orders.filter((o) => o.status !== 'Cancelled')
  const active = deliveries.filter((o) => ACTIVE.includes(o.status))
  const delivered = deliveries.filter((o) => o.status === 'Delivered')
  const shown = tab === 'Active' ? active : delivered

  return (
    <div>
      <PageHeader
        title="Delivery Tracking"
        subtitle={`${active.length} in progress · ${delivered.length} delivered`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => { setError(''); load() }}
            className="font-semibold hover:underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        {['Active', 'Delivered'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t ? 'bg-white text-agri-green shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t} <span className="ml-1 font-bold">{t === 'Active' ? active.length : delivered.length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🚛</div>
          <p className="font-semibold text-gray-700">
            {tab === 'Active' ? 'No active deliveries yet.' : 'No delivered orders yet.'}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {tab === 'Active'
              ? 'Once a farmer accepts your booking, the order will appear here for tracking.'
              : 'Completed deliveries will appear here.'}
          </p>
          {tab === 'Active' && (
            <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-5 text-sm px-6">
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onTrack={(id) => navigate(`/buyer/delivery/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
