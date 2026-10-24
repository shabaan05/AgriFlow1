import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate }         from 'react-router-dom'
import { fetchPickupRequests } from '../../../services/transporterApi.js'
import PageHeader              from '../../../components/ui/PageHeader.jsx'

const statusCls = {
  PENDING:   'bg-amber-100 text-amber-700',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      {[1,2,3].map((i) => <div key={i} className="h-3 bg-gray-100 rounded w-full" />)}
    </div>
  )
}

function RequestCard({ req }) {
  const navigate = useNavigate()

  const pickupDate = req.pickupDate
    ? new Date(req.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'

  const isOwn = req.status !== 'PENDING'

  return (
    <div className={`card border hover:shadow-md transition-all duration-200 flex flex-col
      ${req.status === 'PENDING' ? 'border-gray-100 hover:border-agri-green/20' : 'border-gray-100'}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{req.cropName}</h3>
            <p className="text-xs text-gray-400">{req.quantity} {req.unit}{req.variety ? ` · ${req.variety}` : ''}</p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Route */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4">
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-2 h-2 bg-agri-green rounded-full" />
          <div className="w-0.5 h-5 bg-gray-300" />
          <div className="w-2 h-2 bg-orange-400 rounded-full" />
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Pickup</p>
            <p className="text-xs font-medium text-gray-700 truncate">{req.pickupLocation || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Delivery</p>
            <p className="text-xs font-medium text-gray-700 truncate">{req.deliveryLocation || '—'}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
        <div className="bg-gray-50 rounded-xl px-2 py-2">
          <p className="text-gray-400">Distance</p>
          <p className="font-semibold text-gray-800 mt-0.5">{req.estimatedDistanceKm} km</p>
        </div>
        <div className="bg-agri-light rounded-xl px-2 py-2">
          <p className="text-gray-400">Earnings</p>
          <p className="font-bold text-agri-green mt-0.5">₹{req.estimatedEarnings?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-2 py-2">
          <p className="text-gray-400">Pickup</p>
          <p className="font-semibold text-gray-800 mt-0.5 text-[10px] leading-tight">{pickupDate}</p>
        </div>
      </div>

      {/* Farmer */}
      {req.farmerName && (
        <div className="text-xs text-gray-500 mb-4">
          🌾 <span className="font-medium">{req.farmerName}</span>
          {req.farmerVerification === 'Verified' && (
            <span className="ml-1 text-green-600">✓ Verified</span>
          )}
        </div>
      )}

      {/* Action */}
      <button
        onClick={() => navigate(`/transporter/pickups/${req.id}`)}
        className="mt-auto w-full py-2.5 rounded-xl text-xs font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors">
        View Details →
      </button>
    </div>
  )
}

export default function PickupRequests() {
  const [requests, setRequests] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [filter,   setFilter]   = useState('All')

  useEffect(() => {
    fetchPickupRequests()
      .then(setRequests)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const pendingCount   = requests.filter((r) => r.status === 'PENDING').length
  const acceptedCount  = requests.filter((r) => r.status === 'ACCEPTED').length

  const filtered = useMemo(() => (
    filter === 'All' ? requests : requests.filter((r) => r.status === filter)
  ), [requests, filter])

  return (
    <div>
      <PageHeader
        title="Pickup Requests"
        subtitle={`${pendingCount} available · ${acceptedCount} accepted by you`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); setLoading(true); fetchPickupRequests().then(setRequests).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
            className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['All', 'PENDING', 'ACCEPTED', 'REJECTED'].map((f) => {
          const count = f === 'All' ? requests.length : requests.filter((r) => r.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filter === f ? 'bg-agri-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}>
              {f} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🚛</div>
          <p className="font-semibold text-gray-700">No pickup requests</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {requests.length === 0
              ? 'Requests appear here when a Farmer marks an order as "Ready for Pickup".'
              : 'No requests match this filter.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r) => <RequestCard key={r.id} req={r} />)}
        </div>
      )}
    </div>
  )
}
