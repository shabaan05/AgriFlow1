import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import {
  fetchBuyerOrders,
  fetchBuyerBookings,
  fetchBuyerPayments,
} from '../../services/ordersApi.js'
import { fetchRequirements } from '../../services/requirementsApi.js'
import { fetchMarketplaceCrops } from '../../services/marketplaceApi.js'

// ── KPI Card ──────────────────────────────────────────────────────────────────
const kpiColors = {
  green:   'bg-green-50 text-agri-green',
  blue:    'bg-blue-50 text-blue-700',
  amber:   'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
}

const kpiIcons = {
  orders:   (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>),
  bookings: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>),
  reqs:     (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>),
  delivery: (<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>),
}

function KPICard({ label, value, icon, trend, color }) {
  const c = kpiColors[color] || kpiColors.green
  return (
    <div className={`card flex items-start gap-4 ${c} border-0`}>
      <div className={`${c} p-3 rounded-xl flex-shrink-0`}>{kpiIcons[icon]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.split(' ')[1]}`}>{value}</p>
        {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
      </div>
    </div>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
const statusCls = {
  ACTIVE:              'bg-blue-100 text-blue-700',
  FULFILLED:           'bg-green-100 text-green-800',
  EXPIRED:             'bg-gray-100 text-gray-600',
  CANCELLED:           'bg-red-100 text-red-600',
  Pending:             'bg-amber-100 text-amber-700',
  Accepted:           'bg-green-100 text-green-800',
  Confirmed:          'bg-green-100 text-green-800',
  Preparing:          'bg-orange-100 text-orange-700',
  'Ready for Pickup':  'bg-violet-100 text-violet-700',
  'Picked Up':         'bg-teal-100 text-teal-700',
  'In Transit':        'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
}

function Badge({ status }) {
  return <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>
}

const USP_BENEFITS = [
  { icon: '🌾', text: 'Direct Farmer Supply' },
  { icon: '📊', text: 'Demand-Based Procurement' },
  { icon: '🚚', text: 'Transparent Delivery Tracking' },
  { icon: '🔗', text: 'End-to-End Traceability' },
]

const ACTIVE_ORDER_STATUSES = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit']

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function BuyerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState({
    orders: [],
    bookings: [],
    requirements: [],
    payments: null,
    marketplaceCrops: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetchBuyerOrders(),
      fetchBuyerBookings(),
      fetchRequirements(),
      fetchBuyerPayments(),
      fetchMarketplaceCrops(),
    ])
      .then(([orders, bookings, requirements, payments, marketplaceCrops]) => {
        setData({ orders, bookings, requirements, payments, marketplaceCrops })
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const hour  = new Date().getHours()
  const time  = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const firstName = user?.name ? user.name.split(' ')[0] : 'Buyer'

  // ── Derive KPIs from real data ──────────────────────────────────────────────
  const activeOrders    = (data.orders || []).filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status))
  const pendingBookings = (data.bookings || []).filter((b) => b.status === 'Pending')
  const activeReqs      = (data.requirements || []).filter((r) => r.status === 'ACTIVE')
  const paymentsSummary = data.payments?.summary || {}
  const pendingAmount   = paymentsSummary.pendingAmount || 0

  const kpis = [
    { id: 'orders',     label: 'Active Orders',      value: String(activeOrders.length),       icon: 'orders',   color: 'blue',    trend: activeOrders.length > 0 ? `${activeOrders.filter((o) => o.status === 'In Transit').length} in transit` : '' },
    { id: 'bookings',   label: 'Pending Bookings',   value: String(pendingBookings.length),     icon: 'bookings', color: 'amber',   trend: pendingBookings.length > 0 ? 'Awaiting confirmation' : '' },
    { id: 'reqs',       label: 'Active Requirements', value: String(activeReqs.length),         icon: 'reqs',     color: 'green',   trend: activeReqs.length > 0 ? `${activeReqs.length} open` : '' },
    { id: 'deliveries', label: 'Pending Payments',  value: `₹${pendingAmount.toLocaleString()}`, icon: 'delivery', color: 'emerald', trend: `${paymentsSummary.paidAmount ? `₹${paymentsSummary.paidAmount.toLocaleString()} paid` : 'No payments yet'}` },
  ]

  // ── Procurement table from requirements ────────────────────────────────────
  const procurementRows = (data.requirements || [])
    .filter((r) => r.status === 'ACTIVE')
    .slice(0, 5)
    .map((r) => ({
      id:          r.id,
      crop:        r.cropName,
      qty:         `${r.quantity} ${r.unit || 'kg'}`,
      requiredBy:  r.requiredByDate ? fmtDate(r.requiredByDate) : '—',
      status:      r.status === 'ACTIVE' ? 'Finding Supply' : r.status,
    }))

  // ── Recommended supply from marketplace ──────────────────────────────────────
  const recommendedSupply = (data.marketplaceCrops || []).slice(0, 3).map((c) => ({
    id:       c.id,
    crop:     c.name,
    variety:  c.variety || '',
    qty:      `${c.availableQty} ${c.unit}`,
    price:    c.expectedPrice ? `₹${c.expectedPrice}/${c.unit}` : '—',
    grade:    c.grade || '—',
    harvest:  c.expectedHarvestDate ? fmtDate(c.expectedHarvestDate) : '—',
    location: c.farmLocation || '—',
    verified: c.status === 'Harvest Ready' || c.status === 'Booked',
  }))

  // ── Active orders table ─────────────────────────────────────────────────────
  const activeOrderRows = activeOrders.slice(0, 4).map((o) => ({
    id:      o.id.slice(-8).toUpperCase(),
    crop:    o.cropName,
    qty:     `${o.quantity} ${o.unit}`,
    farmer:  o.farmer?.name || '—',
    status:  o.status,
    delivery: o.scheduledPickupDate ? fmtDate(o.scheduledPickupDate) : '—',
  }))

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {time}, {firstName} 👋</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Manage your agricultural procurement, requirements and active deliveries from one place.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
          Failed to load some dashboard data: {error}
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? [1, 2, 3, 4].map((i) => <div key={i} className="rounded-2xl h-24 bg-gray-100 animate-pulse" />)
          : kpis.map((kpi) => <KPICard key={kpi.id} {...kpi} />)}
      </div>

      {/* Procurement Overview + USP */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Procurement table */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Procurement Overview</h2>
            <button onClick={() => navigate('/buyer/requirements')} className="text-sm text-agri-green font-medium hover:underline">
              View all
            </button>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : procurementRows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl mb-3">📋</div>
              <p className="font-medium text-gray-700">No active requirements</p>
              <p className="text-xs text-gray-400 mt-1">Create a requirement to find matching supply.</p>
              <button onClick={() => navigate('/buyer/requirements/create')} className="btn-primary mt-3 text-xs px-4">Create Requirement</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Crop', 'Quantity', 'Required By', 'Status'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {procurementRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => navigate(`/buyer/requirements/${row.id}`)}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.crop}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.qty}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{row.requiredBy}</td>
                        <td className="px-4 py-3"><Badge status={row.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* USP */}
        <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-1">Procure Smarter</h3>
          <p className="text-green-100 text-xs mb-5">AgriFlow AI powers your procurement with intelligence.</p>
          <div className="space-y-3">
            {USP_BENEFITS.map((b, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg flex-shrink-0">{b.icon}</div>
                <p className="text-sm font-medium text-green-50">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Supply */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recommended Supply</h2>
          <button onClick={() => navigate('/buyer/marketplace')} className="text-sm text-agri-green font-medium hover:underline">
            Browse marketplace
          </button>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => <div key={i} className="card h-48 animate-pulse" />)}
          </div>
        ) : recommendedSupply.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl mb-3">🌾</div>
            <p className="font-medium text-gray-700">No crops available in marketplace</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendedSupply.map((item) => (
              <div key={item.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl">🌾</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.crop}</h3>
                      <p className="text-xs text-gray-400">{item.variety}</p>
                    </div>
                  </div>
                  {item.verified ? (
                    <span className="status-badge bg-green-100 text-green-700 text-xs">✓ Verified</span>
                  ) : (
                    <span className="status-badge bg-gray-100 text-gray-500 text-xs">Unverified</span>
                  )}
                </div>
                <div className="space-y-1.5 mb-4">
                  {[
                    { l: 'Available',  v: item.qty },
                    { l: 'Price',      v: item.price },
                    { l: 'Grade',      v: item.grade },
                    { l: 'Harvest',    v: item.harvest },
                    { l: 'Location',   v: item.location },
                  ].map((r) => (
                    <div key={r.l} className="flex justify-between text-xs">
                      <span className="text-gray-400">{r.l}</span>
                      <span className="font-medium text-gray-700">{r.v}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => navigate(`/buyer/marketplace/crop/${item.id}`)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
                    View Crop
                  </button>
                  <button onClick={() => navigate(`/buyer/marketplace/crop/${item.id}`)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Orders + Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Orders */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Active Orders</h2>
            <button onClick={() => navigate('/buyer/orders')} className="text-sm text-agri-green font-medium hover:underline">View all</button>
          </div>
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : activeOrderRows.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl mb-3">📦</div>
              <p className="font-medium text-gray-700">No active orders</p>
              <p className="text-xs text-gray-400 mt-1">Browse the marketplace and book a crop to get started.</p>
              <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-3 text-xs px-4">Browse Marketplace</button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/60">
                      {['Order ID', 'Crop', 'Qty', 'Farmer', 'Status', 'Delivery', ''].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {activeOrderRows.map((o) => (
                      <tr key={o.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer" onClick={() => navigate('/buyer/orders')}>
                        <td className="px-4 py-3 text-xs font-mono text-gray-500">{o.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{o.crop}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{o.qty}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{o.farmer}</td>
                        <td className="px-4 py-3"><Badge status={o.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500">{o.delivery}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-agri-green">View →</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="card">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-lg mb-3">🔔</div>
              <p className="text-sm font-medium text-gray-600">No recent activity</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                Activity from your bookings, orders and payments will appear here once a feed is available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
