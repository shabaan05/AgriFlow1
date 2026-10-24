import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import {
  fetchPickupRequests,
  fetchTrips,
  fetchEarnings,
  fetchVehicleInfo,
} from '../../services/transporterApi.js'

const kpiColors = {
  amber:   'bg-amber-50   text-amber-700',
  blue:    'bg-blue-50    text-blue-700',
  green:   'bg-green-50   text-agri-green',
  emerald: 'bg-emerald-50 text-emerald-700',
  teal:    'bg-teal-50    text-teal-700',
}

function KPICard({ label, value, icon, trend, color }) {
  const c = kpiColors[color] || kpiColors.green
  return (
    <div className={`card flex items-start gap-4 ${c} border-0`}>
      <div className={`${c} text-3xl flex-shrink-0`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.split(' ')[1]}`}>{value}</p>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </div>
    </div>
  )
}

const ACTIVE_TRIP_STATUSES = ['Ready for Pickup', 'Picked Up', 'In Transit']
const COMPLETED_STATUSES   = ['Delivered']

const DELIVERY_FLOW = ['Ready for Pickup', 'Picked Up', 'In Transit', 'Delivered']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

const QUICK_ACTIONS = [
  { label: 'Pickup Requests', icon: '📋', to: '/transporter/pickups' },
  { label: 'Active Trip',     icon: '🚛', to: '/transporter/trips'    },
  { label: 'Optimize Route',  icon: '🗺️', to: '/transporter/routes'  },
  { label: 'View Earnings',   icon: '💰', to: '/transporter/earnings' },
]

const USP_BENEFITS = [
  { icon: '🌾', text: 'Direct Farmer Supply' },
  { icon: '📊', text: 'Demand-Based Procurement' },
  { icon: '🚚', text: 'Transparent Delivery Tracking' },
  { icon: '🔗', text: 'End-to-End Traceability' },
]

// ── Page ─────────────────────────────────────────────────────────────────────
export default function TransporterDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState({
    pickups: [],
    trips: [],
    earnings: null,
    vehicle: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetchPickupRequests(),
      fetchTrips(),
      fetchEarnings(),
      fetchVehicleInfo(),
    ])
      .then(([pickups, trips, earnings, vehicle]) => {
        setData({ pickups, trips, earnings, vehicle })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const hour      = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const firstName = user?.name ? user.name.split(' ')[0] : 'Driver'

  // ── Derive KPIs from real data ──────────────────────────────────────────────
  const pendingRequests = (data.pickups || []).filter((p) => p.status === 'PENDING')
  const activeTrips      = (data.trips || []).filter((t) => ACTIVE_TRIP_STATUSES.includes(t.orderStatus))
  const completedTrips   = (data.trips || []).filter((t) => COMPLETED_STATUSES.includes(t.orderStatus))
  const earningsSummary  = data.earnings?.summary || {}

  const kpis = [
    { id: 'requests',  label: 'Pending Requests',     value: String(pendingRequests.length), icon: '📋', color: 'amber',   trend: pendingRequests.length > 0 ? 'Available to accept' : 'No new requests' },
    { id: 'active',    label: 'Active Trips',        value: String(activeTrips.length),      icon: '🚛', color: 'blue',    trend: activeTrips.length > 0 ? activeTrips[0]?.cropName || '' : 'No active trips' },
    { id: 'completed', label: 'Total Completed',     value: String(earningsSummary.completedTrips || completedTrips.length), icon: '✅', color: 'emerald', trend: `${earningsSummary.thisMonth ? `₹${earningsSummary.thisMonth.toLocaleString()} this month` : ''}` },
    { id: 'earnings',   label: 'Total Earnings',     value: `₹${(earningsSummary.totalEarnings || 0).toLocaleString()}`, icon: '💰', color: 'green',  trend: `${earningsSummary.pending ? `₹${earningsSummary.pending.toLocaleString()} pending` : 'All settled'}` },
  ]

  // ── Active Trip card from real data ─────────────────────────────────────────
  const activeTrip = activeTrips[0] || null
  const tripProgress = activeTrip
    ? { 'Ready for Pickup': 25, 'Picked Up': 50, 'In Transit': 75 }[activeTrip.orderStatus] || 0
    : 0

  // ── Pickup request cards from real data ──────────────────────────────────────
  const pickupCards = pendingRequests.slice(0, 3).map((p) => ({
    id:      p.id,
    crop:    p.cropName,
    qty:     `${p.quantity} ${p.unit}`,
    from:    p.pickupLocation || '—',
    to:      p.deliveryLocation || '—',
    date:    p.pickupDate ? fmtDate(p.pickupDate) : 'TBD',
    dist:    `${p.estimatedDistanceKm || 0} km`,
    earn:    `₹${(p.estimatedEarnings || 0).toLocaleString()}`,
    status:  p.status,
  }))

  // ── Vehicle info from real data ─────────────────────────────────────────────
  const vehicle = data.vehicle || null

  // ── Delivery steps from active trip ─────────────────────────────────────────
  const currentStepIdx = activeTrip ? DELIVERY_FLOW.indexOf(activeTrip.orderStatus) : -1
  const deliverySteps = DELIVERY_FLOW.map((label, i) => ({
    key:   label.toLowerCase().replace(/\s+/g, ''),
    label,
    done:  i < currentStepIdx,
    active: i === currentStepIdx,
  }))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {timeOfDay}, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">Here's what needs your attention on the road today.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          Failed to load some dashboard data: {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="rounded-2xl h-24 bg-gray-100 animate-pulse" />)
          : kpis.map((kpi) => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* Active Trip + Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Trip */}
        <div className="lg:col-span-2">
          <h2 className="font-semibold text-gray-900 mb-4">Active Trip</h2>
          {loading ? (
            <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-6 h-48 animate-pulse" />
          ) : !activeTrip ? (
            <div className="card flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl mb-3">🚛</div>
              <p className="font-medium text-gray-700">No active trips</p>
              <p className="text-xs text-gray-400 mt-1">Accept a pickup request to start a trip.</p>
              <button onClick={() => navigate('/transporter/pickups')} className="btn-primary mt-3 text-xs px-4">Browse Pickup Requests</button>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
              <div className="absolute -bottom-10 right-16 w-28 h-28 bg-white/5 rounded-full" />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <span className="text-green-200 text-xs font-semibold uppercase tracking-wider">🚛 Active Trip</span>
                    <h3 className="text-xl font-bold mt-1">{activeTrip.pickupLocation || 'Pickup'} → {activeTrip.deliveryLocation || 'Delivery'}</h3>
                    <p className="text-green-100 text-sm">{activeTrip.estimatedDistanceKm || 0} km · {activeTrip.cropName} · {activeTrip.quantity} {activeTrip.unit}</p>
                  </div>
                  <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {activeTrip.orderStatus}
                  </span>
                </div>

                {/* Route visual */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-3 h-3 bg-green-300 rounded-full" />
                    <div className="w-0.5 h-12 bg-white/30" />
                    <div className="w-3 h-3 bg-white rounded-full" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-green-200">Pickup</p>
                      <p className="text-sm font-semibold">{activeTrip.pickupLocation || '—'}</p>
                      <p className="text-xs text-green-200">{activeTrip.farmerName || 'Farmer'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-200">Delivery</p>
                      <p className="text-sm font-semibold">{activeTrip.deliveryLocation || '—'}</p>
                      <p className="text-xs text-green-200">{activeTrip.buyerCompany || activeTrip.buyerName || 'Buyer'}</p>
                    </div>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-green-200 mb-1.5">
                    <span>Trip Progress</span><span>{tripProgress}%</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${tripProgress}%` }} />
                  </div>
                </div>

                <button onClick={() => navigate(`/transporter/trips/${activeTrip.id}`)}
                  className="bg-white text-agri-green text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                  View Trip Details →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions + Vehicle */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div>
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_ACTIONS.map((a) => (
                <button key={a.label} onClick={() => navigate(a.to)}
                  className="card flex flex-col items-center gap-2 py-4 hover:shadow-md transition-shadow group relative">
                  {a.label === 'Pickup Requests' && pendingRequests.length > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {pendingRequests.length}
                    </span>
                  )}
                  <span className="text-2xl">{a.icon}</span>
                  <span className="text-xs font-medium text-gray-700 text-center leading-tight">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Card */}
          <div className="card">
            {loading ? (
              <div className="h-28 animate-pulse" />
            ) : !vehicle ? (
              <div className="text-center py-4">
                <p className="text-sm font-medium text-gray-600">No vehicle info</p>
                <p className="text-xs text-gray-400 mt-1">Add your vehicle details in profile.</p>
                <button onClick={() => navigate('/transporter/profile')} className="text-xs font-semibold text-agri-green hover:underline mt-2">Add Vehicle →</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">My Vehicle</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${vehicle.isAvailable !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {vehicle.isAvailable !== false ? '● Available' : '● Unavailable'}
                  </span>
                </div>
                <p className="font-bold text-gray-900">{vehicle.vehicleType || vehicle.type || '—'}</p>
                <p className="text-xs text-gray-500 mt-0.5">Capacity: {vehicle.capacity ? `${vehicle.capacity} kg` : '—'}</p>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{vehicle.regNumber || '—'}</p>
                {vehicle.verified && (
                  <span className="status-badge bg-green-100 text-green-800 text-xs mt-2">✓ Verified</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pickup Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Available Pickup Requests</h2>
          <button onClick={() => navigate('/transporter/pickups')}
            className="text-sm text-agri-green font-medium hover:underline">View all</button>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
          </div>
        ) : pickupCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🚛</div>
            <p className="font-semibold text-gray-700">No available pickup requests</p>
            <p className="text-sm text-gray-400 mt-1">Requests appear here when farmers mark orders as Ready for Pickup.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {pickupCards.map((r) => (
              <div key={r.id} className="card border border-gray-100 hover:shadow-md transition-shadow">
                {/* Crop header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl">🌾</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{r.crop}</h3>
                      <p className="text-xs text-gray-400">{r.qty}</p>
                    </div>
                  </div>
                  <span className="status-badge bg-green-100 text-green-700 text-xs">{r.status}</span>
                </div>

                {/* Route */}
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 mb-4">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-2 h-2 bg-agri-green rounded-full" />
                    <div className="w-0.5 h-4 bg-gray-300" />
                    <div className="w-2 h-2 bg-orange-400 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 truncate">{r.from}</p>
                    <p className="text-xs font-medium text-gray-700 truncate mt-2">{r.to}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-xs text-center">
                  <div className="bg-gray-50 rounded-xl px-2 py-2">
                    <p className="text-gray-400">Distance</p>
                    <p className="font-semibold text-gray-800 mt-0.5">{r.dist}</p>
                  </div>
                  <div className="bg-agri-light rounded-xl px-2 py-2">
                    <p className="text-gray-400">Earnings</p>
                    <p className="font-bold text-agri-green mt-0.5">{r.earn}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl px-2 py-2">
                    <p className="text-gray-400">Pickup</p>
                    <p className="font-semibold text-gray-800 mt-0.5 truncate">{r.date}</p>
                  </div>
                </div>

                <button onClick={() => navigate(`/transporter/pickups/${r.id}`)}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors">
                  View Request →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivery Status strip */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Current Delivery Status</h2>
        {activeTrip ? (
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {deliverySteps.map((step, i) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center min-w-[110px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                    ${step.active ? 'bg-agri-green text-white ring-4 ring-agri-green/20' : ''}
                    ${step.done ? 'bg-green-200 text-green-800' : ''}
                    ${!step.done && !step.active ? 'bg-gray-100 text-gray-400' : ''}`}>
                    {step.done ? '✓' : i + 1}
                  </div>
                  <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight
                    ${step.active ? 'text-agri-green' : step.done ? 'text-green-700' : 'text-gray-400'}`}
                    style={{ maxWidth: 90 }}>
                    {step.label}
                  </p>
                </div>
                {i < deliverySteps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full flex-shrink-0
                    ${i < currentStepIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">No active trip. Accept a pickup request to start tracking delivery progress.</p>
        )}
      </div>
    </div>
  )
}
