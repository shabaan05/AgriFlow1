import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate }   from 'react-router-dom'
import { fetchTrips }    from '../../../services/transporterApi.js'
import PageHeader        from '../../../components/ui/PageHeader.jsx'

const orderStatusCls = {
  'Ready for Pickup': 'bg-violet-100 text-violet-700',
  'Picked Up':        'bg-teal-100 text-teal-700',
  'In Transit':       'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
  Cancelled:          'bg-gray-100 text-gray-600',
}

const ACTIVE_STATUSES   = ['Ready for Pickup', 'Picked Up', 'In Transit']
const COMPLETED_STATUSES = ['Delivered']

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${orderStatusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function TripCard({ trip }) {
  const navigate = useNavigate()

  const pickupDate = trip.pickupDate
    ? new Date(trip.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—'

  return (
    <div className="card border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => navigate(`/transporter/trips/${trip.id}`)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🚛</div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{trip.cropName}</h3>
            <p className="text-xs text-gray-400">{trip.quantity} {trip.unit} · #{trip.orderId?.slice(-8).toUpperCase()}</p>
          </div>
        </div>
        <StatusBadge status={trip.orderStatus} />
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
            <p className="text-[10px] text-gray-400 uppercase">Pickup</p>
            <p className="text-xs font-medium text-gray-700 truncate">{trip.pickupLocation || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase">Delivery</p>
            <p className="text-xs font-medium text-gray-700 truncate">{trip.deliveryLocation || '—'}</p>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        <div className="bg-gray-50 rounded-xl px-2 py-2">
          <p className="text-gray-400">Distance</p>
          <p className="font-semibold text-gray-800 mt-0.5">{trip.estimatedDistanceKm} km</p>
        </div>
        <div className="bg-agri-light rounded-xl px-2 py-2">
          <p className="text-gray-400">Earnings</p>
          <p className="font-bold text-agri-green mt-0.5">₹{trip.estimatedEarnings?.toLocaleString()}</p>
        </div>
        <div className="bg-gray-50 rounded-xl px-2 py-2">
          <p className="text-gray-400">Pickup</p>
          <p className="font-semibold text-gray-800 mt-0.5 text-[10px] leading-tight">{pickupDate}</p>
        </div>
      </div>
    </div>
  )
}

export default function MyTrips() {
  const [trips,   setTrips]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('Active')

  useEffect(() => {
    fetchTrips()
      .then(setTrips)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const active    = trips.filter((t) => ACTIVE_STATUSES.includes(t.orderStatus))
  const completed = trips.filter((t) => COMPLETED_STATUSES.includes(t.orderStatus))
  const shown     = tab === 'Active' ? active : completed

  return (
    <div>
      <PageHeader title="My Trips" subtitle={`${active.length} active · ${completed.length} completed`} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); setLoading(true); fetchTrips().then(setTrips).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
            className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        {['Active', 'Completed'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t ? 'bg-white text-agri-green shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
            {t} <span className="ml-1 font-bold">{t === 'Active' ? active.length : completed.length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🚛</div>
          <p className="font-semibold text-gray-700">
            {tab === 'Active' ? 'No active trips' : 'No completed trips yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === 'Active' ? 'Accept a pickup request to start a trip.' : 'Completed trips will appear here.'}
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {shown.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        </div>
      )}
    </div>
  )
}
