import React, { useState } from 'react'
import { useNavigate }     from 'react-router-dom'
import { useOrders }       from '../../../context/OrdersContext.jsx'
import OrderStatusBadge    from '../../../components/orders/OrderStatusBadge.jsx'
import PageHeader          from '../../../components/ui/PageHeader.jsx'

const ACTIVE_STATUSES   = ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit']
const HISTORY_STATUSES  = ['Delivered', 'Cancelled']
const TABS = ['Active', 'History']

function OrderRow({ order }) {
  const navigate = useNavigate()
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <tr
      className="hover:bg-gray-50/60 transition-colors cursor-pointer"
      onClick={() => navigate(`/farmer/orders/${order.id}`)}
    >
      <td className="px-4 py-3.5">
        <p className="text-xs font-mono text-gray-500">{order.id.slice(-8).toUpperCase()}</p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium text-gray-900">{order.buyerCompany || order.buyerName}</p>
        <p className="text-xs text-gray-400">{order.buyerName}</p>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm text-gray-700">{order.cropName}</p>
        <p className="text-xs text-gray-400">{order.quantity} {order.unit}</p>
      </td>
      <td className="px-4 py-3.5 text-sm font-semibold text-agri-green">
        ₹{order.totalAmount.toLocaleString()}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{date}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600 truncate max-w-[140px]">
        {order.deliveryLocation || '—'}
      </td>
      <td className="px-4 py-3.5"><OrderStatusBadge status={order.status} /></td>
      <td className="px-4 py-3.5">
        <span className="text-xs font-semibold text-agri-green hover:underline">View →</span>
      </td>
    </tr>
  )
}

export default function Orders() {
  const { orders, loading, error } = useOrders()
  const [tab, setTab] = useState('Active')

  const active  = orders.filter((o) => ACTIVE_STATUSES.includes(o.status))
  const history = orders.filter((o) => HISTORY_STATUSES.includes(o.status))
  const shown   = tab === 'Active' ? active : history

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${active.length} active · ${history.length} completed`} />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition-all
              ${tab === t ? 'bg-white text-agri-green shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t} <span className="ml-1 font-bold">{t === 'Active' ? active.length : history.length}</span>
          </button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📦</div>
          <p className="font-semibold text-gray-700">{tab === 'Active' ? 'No active orders' : 'No completed orders yet'}</p>
          <p className="text-sm text-gray-400 mt-1">
            {tab === 'Active' ? 'Accept a booking to create an order.' : 'Completed orders will appear here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Order ID', 'Buyer', 'Crop', 'Amount', 'Date', 'Delivery', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shown.map((o) => <OrderRow key={o.id} order={o} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
