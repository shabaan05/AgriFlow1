import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate }    from 'react-router-dom'
import { fetchEarnings } from '../../../services/transporterApi.js'
import PageHeader         from '../../../components/ui/PageHeader.jsx'

const statusCls = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID:    'bg-green-100 text-green-800',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function KPICard({ label, value, sub, color }) {
  const colors = {
    green:  'bg-green-50 text-agri-green',
    blue:   'bg-blue-50  text-blue-700',
    amber:  'bg-amber-50 text-amber-700',
    teal:   'bg-teal-50  text-teal-700',
    gray:   'bg-gray-50  text-gray-600',
  }
  return (
    <div className={`rounded-2xl px-5 py-5 ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
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

export default function Earnings() {
  const navigate       = useNavigate()
  const [data,  setData]  = useState(null)
  const [loading,setLoading]= useState(true)
  const [error,  setError]  = useState('')
  const [filter,  setFilter]= useState('All')

  function load() {
    setLoading(true)
    fetchEarnings()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const earnings = data?.earnings || []
  const summary  = data?.summary  || {}

  const filtered = useMemo(() => (
    filter === 'All' ? earnings : earnings.filter((e) => e.status === filter)
  ), [earnings, filter])

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Track your delivery earnings, pending payments, and trip history." />

      {/* Payment gateway notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-xs text-amber-700 font-medium">
        <span>ℹ️</span>
        Payout processing will be available in a future update. Earnings are tracked automatically when trips are completed.
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); load() }} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading ? (
          [1,2,3,4,5].map((i) => <div key={i} className="rounded-2xl h-20 bg-gray-100 animate-pulse" />)
        ) : (
          <>
            <KPICard label="Total Earnings"  value={`₹${(summary.totalEarnings || 0).toLocaleString()}`}       color="green" />
            <KPICard label="This Month"     value={`₹${(summary.thisMonth     || 0).toLocaleString()}`}       color="blue"  />
            <KPICard label="This Week"      value={`₹${(summary.thisWeek      || 0).toLocaleString()}`}       color="teal"  />
            <KPICard label="Pending"        value={`₹${(summary.pending        || 0).toLocaleString()}`}       color="amber" />
            <KPICard label="Completed Trips" value={summary.completedTrips || 0}                              color="gray"  />
          </>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'PENDING', 'PAID'].map((f) => {
          const count = f === 'All' ? earnings.length : earnings.filter((e) => e.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filter === f ? 'bg-agri-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}>
              {f} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Table */}
      {loading && earnings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <tbody>{[1,2,3].map((i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">💰</div>
          <p className="font-semibold text-gray-700">
            {earnings.length === 0 ? 'No earnings yet' : 'No earnings match this filter'}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {earnings.length === 0
              ? 'Earnings appear here when you complete delivery trips.'
              : 'Try a different filter.'}
          </p>
          {earnings.length === 0 && (
            <button onClick={() => navigate('/transporter/trips')} className="btn-primary mt-5 text-sm px-6">
              View My Trips
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Trip ID', 'Crop', 'Route', 'Completed', 'Earning', 'Calculation', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/60 transition-colors cursor-pointer"
                    onClick={() => navigate(`/transporter/earnings/${e.id}`)}>
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-500">
                      {e.pickupRequestId?.slice(-8).toUpperCase() || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{e.cropName}</p>
                      <p className="text-xs text-gray-400">{e.quantity} {e.unit}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs text-gray-600 truncate max-w-[120px]">{e.pickupLocation}</p>
                      <p className="text-xs text-gray-400">→ {e.deliveryLocation}</p>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{fmtDate(e.completedAt)}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-agri-green">₹{e.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">
                      {e.calculation ? `₹${e.calculation.baseAmount} + ₹${e.calculation.distanceComponent} (dist) + ₹${e.calculation.quantityComponent} (qty)` : '—'}
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={e.status} /></td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold text-agri-green hover:underline">View</span>
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
