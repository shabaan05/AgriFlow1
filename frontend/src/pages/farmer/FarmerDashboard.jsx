import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { useOrders } from '../../context/OrdersContext.jsx'
import { fetchCrops } from '../../services/cropApi.js'
import KPICard    from '../../components/farmer/KPICard.jsx'
import CropCard   from '../../components/farmer/CropCard.jsx'
import OrderRow   from '../../components/farmer/OrderRow.jsx'

/* ─── Greeting ──────────────────────────────────────────────────────────── */
function Greeting({ name }) {
  const hour = new Date().getHours()
  const time = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const firstName = name ? name.split(' ')[0] : 'Farmer'
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Good {time}, {firstName} 👋
      </h1>
      <p className="text-gray-500 mt-1 text-sm">
        Here's what's happening with your farm today.
      </p>
    </div>
  )
}

/* ─── AI Insights Panel ─────────────────────────────────────────────────── */
function AIInsights({ onNavigate }) {
  return (
    <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-green-200 uppercase tracking-wider">AI Farm Advisor</p>
            <p className="text-sm font-bold">AgriFlow Intelligence</p>
          </div>
        </div>
        <span className="bg-white/20 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0">
          Preview
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <p className="text-sm text-green-100">Your tomato crop has high buyer demand this week.</p>
        </div>
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
            </svg>
          </div>
          <p className="text-sm text-green-100">3 potential buyers match your tomato listing.</p>
        </div>
      </div>

      <button
        onClick={onNavigate}
        className="bg-white text-agri-green text-sm font-semibold px-5 py-2.5 rounded-xl
                   hover:bg-green-50 transition-colors duration-200"
      >
        View AI Centre →
      </button>
    </div>
  )
}

/* ─── Upcoming Activities ────────────────────────────────────────────────── */
function UpcomingActivities({ activities }) {
  const activityIcons = {
    harvest: { icon: '🌾', color: 'bg-orange-100 text-orange-700' },
    pickup:  { icon: '🚛', color: 'bg-blue-100 text-blue-700'   },
    booking: { icon: '📋', color: 'bg-purple-100 text-purple-700'},
  }

  if (activities.length === 0) {
    return (
      <div className="card">
        <h2 className="font-semibold text-gray-900 text-sm mb-4">Upcoming Activities</h2>
        <p className="text-sm text-gray-400">No upcoming activities. Mark orders Ready for Pickup to schedule pickups.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 text-sm mb-4">Upcoming Activities</h2>
      <div className="space-y-3">
        {activities.map((a) => {
          const style = activityIcons[a.type] || { icon: '📌', color: 'bg-gray-100 text-gray-600' }
          return (
            <div key={a.id} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${style.color} flex items-center justify-center text-base flex-shrink-0`}>
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
              </div>
              <span className="text-xs font-medium text-gray-500 flex-shrink-0">{a.date}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Crop color mapping by category ──────────────────────────────────────────
const categoryColorMap = {
  'Vegetables': 'green',
  'Fruits': 'red',
  'Grains & Cereals': 'yellow',
  'Pulses & Legumes': 'orange',
  'Spices & Herbs': 'purple',
  'Oilseeds': 'yellow',
  'Other': 'green',
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function FarmerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { bookings, orders, earnings, loading, error } = useOrders()

  const [crops, setCrops] = useState([])
  const [cropsLoading, setCropsLoading] = useState(true)
  const [cropsError, setCropsError] = useState('')

  useEffect(() => {
    fetchCrops()
      .then(setCrops)
      .catch((e) => setCropsError(e.message))
      .finally(() => setCropsLoading(false))
  }, [])

  // ── Derive KPIs from real data ──────────────────────────────────────────────
  const pendingBookings = bookings.filter((b) => b.status === 'Pending')
  const activeOrders = orders.filter((o) =>
    ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit'].includes(o.status)
  )
  const totalEarnings = earnings?.summary?.totalEarnings || 0

  const kpis = [
    { id: 'crops',    label: 'Total Crops',     value: String(crops.length),        icon: 'crops',    trend: crops.length > 0 ? `${crops.filter((c) => c.status === 'Pre-Harvest').length} pre-harvest` : '', color: 'green' },
    { id: 'bookings', label: 'Active Bookings',  value: String(pendingBookings.length), icon: 'bookings', trend: pendingBookings.length > 0 ? 'Awaiting your response' : 'All caught up',         color: 'blue' },
    { id: 'orders',   label: 'Pending Orders',  value: String(activeOrders.length),    icon: 'orders',   trend: activeOrders.length > 0 ? 'Awaiting dispatch' : 'No pending orders',             color: 'amber' },
    { id: 'earnings', label: 'Total Earnings',  value: `₹${totalEarnings.toLocaleString()}`, icon: 'earnings', trend: `${earnings?.summary?.pendingPayments ? `₹${earnings.summary.pendingPayments.toLocaleString()} pending` : 'No pending payments'}`, color: 'emerald' },
  ]

  // ── Derive crop cards from real crops (first 3) ─────────────────────────────
  const cropCards = crops.slice(0, 3).map((c) => ({
    id:     c.id,
    name:   c.name,
    qty:    `${c.availableQty} ${c.unit}`,
    grade:  c.grade || '—',
    price:  c.expectedPrice ? `₹${c.expectedPrice}/${c.unit}` : '—',
    status: c.status,
    color:  categoryColorMap[c.category] || 'green',
  }))

  // ── Derive recent orders (first 3 by date) ──────────────────────────────────
  const recentOrderRows = orders.slice(0, 3).map((o) => ({
    id:     o.id.slice(-8).toUpperCase(),
    buyer:  o.buyerCompany || o.buyerName,
    crop:   o.cropName,
    amount: `₹${o.totalAmount.toLocaleString()}`,
    status: o.status,
  }))

  // ── Derive upcoming activities from active orders ───────────────────────────
  const upcomingActivities = activeOrders
    .filter((o) => o.status === 'Ready for Pickup' || o.status === 'Picked Up' || o.scheduledPickupDate)
    .slice(0, 3)
    .map((o, i) => {
      let type = 'pickup'
      let title = `${o.cropName} pickup`
      if (o.status === 'Confirmed' || o.status === 'Preparing') {
        type = 'booking'
        title = `${o.cropName} order preparing`
      }
      const date = o.scheduledPickupDate
        ? new Date(o.scheduledPickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : 'TBD'
      return { id: `act-${i}`, title, date, type }
    })

  return (
    <div className="space-y-6">
      <Greeting name={user?.name} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          Failed to load some dashboard data: {error}
        </div>
      )}
      {cropsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          Failed to load crops: {cropsError}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading || cropsLoading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="rounded-2xl h-24 bg-gray-100 animate-pulse" />)
          : kpis.map((kpi) => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* AI + Upcoming */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AIInsights onNavigate={() => navigate('/farmer/ai')} />
        </div>
        <UpcomingActivities activities={upcomingActivities} />
      </div>

      {/* Crop Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Crop Overview</h2>
          <button
            onClick={() => navigate('/farmer/crops')}
            className="text-sm text-agri-green font-medium hover:underline"
          >
            View all
          </button>
        </div>
        {cropsLoading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="card h-40 animate-pulse" />)}
          </div>
        ) : cropCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🌱</div>
            <p className="font-semibold text-gray-700">No crops yet</p>
            <p className="text-sm text-gray-400 mt-1">Add your first crop to get started.</p>
            <button onClick={() => navigate('/farmer/crops/add')} className="btn-primary mt-4 text-sm px-6">Add Crop</button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cropCards.map((crop) => (
              <CropCard key={crop.id} {...crop} />
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <button
            onClick={() => navigate('/farmer/orders')}
            className="text-sm text-agri-green font-medium hover:underline"
          >
            View all
          </button>
        </div>
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="space-y-3 p-4">{[1, 2, 3].map((i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)}</div>
          </div>
        ) : recentOrderRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📦</div>
            <p className="font-semibold text-gray-700">No orders yet</p>
            <p className="text-sm text-gray-400 mt-1">Accept a booking to create your first order.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Crop</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrderRows.map((order) => (
                    <OrderRow key={order.id} {...order} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
