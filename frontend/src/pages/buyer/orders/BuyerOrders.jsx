import React, { useState, useEffect } from 'react'
import { useNavigate }           from 'react-router-dom'
import { fetchBuyerOrders }      from '../../../services/ordersApi.js'
import PageHeader                from '../../../components/ui/PageHeader.jsx'

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

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1,2,3,4,5,6,7,8].map((i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-200 rounded-full w-full" />
        </td>
      ))}
    </tr>
  )
}

export default function BuyerOrders() {
  const navigate = useNavigate()

  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [tab,     setTab]     = useState('Active')

  useEffect(() => {
    fetchBuyerOrders()
      .then(setOrders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const active    = orders.filter((o) => ACTIVE.includes(o.status))
  const completed = orders.filter((o) => !ACTIVE.includes(o.status))
  const shown     = tab === 'Active' ? active : completed

  const date = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div>
      <PageHeader
        title="My Orders"
        subtitle={`${active.length} active · ${completed.length} completed`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); setLoading(true); fetchBuyerOrders().then(setOrders).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
            className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        {['Active', 'History'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t ? 'bg-white text-agri-green shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
            {t} <span className="ml-1 font-bold">{t === 'Active' ? active.length : completed.length}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <tbody>{[1,2,3].map((i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📦</div>
          <p className="font-semibold text-gray-700">
            {tab === 'Active' ? 'No active orders' : 'No completed orders yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === 'Active'
              ? 'Browse the Marketplace and create a booking to get started.'
              : 'Completed orders will appear here.'}
          </p>
          {tab === 'Active' && (
            <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-5 text-sm px-6">
              Browse Marketplace
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Order ID', 'Crop', 'Qty', 'Total', 'Order Date', 'Delivery', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shown.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/buyer/orders/${o.id}`)}>
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-500">{o.id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{o.cropName}</p>
                      <p className="text-xs text-gray-400">{o.variety || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{o.quantity} {o.unit}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-agri-green">₹{o.totalAmount?.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{date(o.createdAt)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{date(o.scheduledPickupDate) || date(o.actualDeliveryDate)}</td>
                    <td className="px-4 py-3.5"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-1">
                        <span className="text-xs font-semibold text-agri-green hover:underline">View</span>
                        {ACTIVE.includes(o.status) && (
                          <span
                            onClick={(e) => { e.stopPropagation(); navigate(`/buyer/delivery/${o.id}`) }}
                            className="text-xs font-semibold text-blue-600 hover:underline ml-2">
                            Track
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
