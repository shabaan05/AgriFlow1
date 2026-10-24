import React, { useState, useEffect } from 'react'
import { fetchHarvestPlan } from '../../../services/aiApi.js'
import AgentPageHeader      from '../../../components/ai/AgentPageHeader.jsx'
import DemoBanner           from '../../../components/ai/DemoBanner.jsx'
import UrgencyBadge         from '../../../components/ai/UrgencyBadge.jsx'

const statusColors = {
  'Pre-Harvest':  'bg-orange-100 text-orange-700',
  'Harvest Ready':'bg-emerald-100 text-emerald-700',
  'Booked':       'bg-violet-100 text-violet-700',
}

function HarvestCard({ item }) {
  const recDate = item.recommendedHarvestDate
    ? new Date(item.recommendedHarvestDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' })
    : '—'

  const statusCls = statusColors[item.currentStatus] || 'bg-gray-100 text-gray-600'

  return (
    <div className="card border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
          <div>
            <h3 className="font-bold text-gray-900">{item.cropName}</h3>
            <p className="text-xs text-gray-400">{item.variety} · {item.availableQty.toLocaleString()} {item.unit}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <UrgencyBadge level={item.urgency} />
          <span className={`status-badge text-xs ${statusCls}`}>{item.currentStatus}</span>
        </div>
      </div>

      {/* Harvest date */}
      <div className="bg-agri-light rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Recommended Harvest</p>
          <p className="text-sm font-bold text-agri-green mt-0.5">{recDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Days Until Harvest</p>
          <p className="text-xl font-bold text-gray-900">{item.daysUntilHarvest}</p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">AI Recommendation</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.recommendation}</p>
      </div>

      {/* Stats */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-sm font-bold text-gray-800">{item.linkedBookings}</p>
          <p className="text-xs text-gray-400">Bookings</p>
        </div>
        <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
          <p className="text-sm font-bold text-gray-800">{item.linkedBuyers}</p>
          <p className="text-xs text-gray-400">Buyers</p>
        </div>
      </div>

      {/* Actions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggested Actions</p>
        <ul className="space-y-1.5">
          {item.actions.map((a, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-5 h-5 rounded-full bg-agri-green text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {i + 1}
              </span>
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function HarvestPlanner() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchHarvestPlan()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <AgentPageHeader
        title="Harvest Planner"
        subtitle="Optimal harvest timing based on buyer bookings, demand signals and crop readiness."
        icon="harvest"
        statusLabel="Demo"
        statusColor="demo"
      />
      <DemoBanner />

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="card h-72 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Upcoming Harvests', value: data.summary.upcomingHarvests },
              { label: 'Urgent This Week',  value: data.summary.urgentHarvests },
              { label: 'Next Harvest',      value: new Date(data.summary.nextHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-agri-light rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-agri-green">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {data.recommendations.map((item) => <HarvestCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </div>
  )
}
