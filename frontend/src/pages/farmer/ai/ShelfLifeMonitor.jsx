import React, { useState, useEffect } from 'react'
import { fetchShelfLife } from '../../../services/aiApi.js'
import AgentPageHeader    from '../../../components/ai/AgentPageHeader.jsx'
import DemoBanner         from '../../../components/ai/DemoBanner.jsx'

const freshnessConfig = {
  Fresh:     { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',   ring: 'border-green-200'  },
  Attention: { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700',   ring: 'border-amber-200'  },
  Critical:  { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',       ring: 'border-red-200'    },
}

const riskColors = {
  Low:    'bg-green-100 text-green-700',
  Medium: 'bg-amber-100 text-amber-700',
  High:   'bg-red-100 text-red-700',
}

function ShelfLifeCard({ item }) {
  const cfg     = freshnessConfig[item.freshnessStatus] || freshnessConfig.Fresh
  const pct     = item.shelfLifeDays > 0
    ? Math.round((item.remainingDays / item.shelfLifeDays) * 100)
    : 100

  const harvestDate = item.harvestDate
    ? new Date(item.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not yet harvested'

  return (
    <div className={`card border-2 ${cfg.ring} hover:shadow-md transition-shadow duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌿</div>
          <div>
            <h3 className="font-bold text-gray-900">{item.cropName}</h3>
            <p className="text-xs text-gray-400">{item.variety} · {item.quantity.toLocaleString()} {item.unit}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`status-badge text-xs ${cfg.badge}`}>{item.freshnessStatus}</span>
          <span className={`status-badge text-xs ${riskColors[item.riskLevel]}`}>{item.riskLevel} Risk</span>
        </div>
      </div>

      {/* Shelf life bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Remaining shelf life</span>
          <span className="font-semibold">
            {item.remainingDays > 0 ? `${item.remainingDays} days` : 'Expired'}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <p className="text-xs text-gray-400 mt-1">{pct}% of {item.shelfLifeDays}-day shelf life remaining</p>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {[
          { label: 'Harvest Date',     value: harvestDate },
          { label: 'Total Shelf Life', value: `${item.shelfLifeDays} days` },
          { label: 'Storage',          value: item.storageLocation },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-700 font-medium">{value}</span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
        <p className="text-xs text-gray-600 leading-relaxed">{item.recommendedAction}</p>
      </div>
    </div>
  )
}

export default function ShelfLifeMonitor() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchShelfLife()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <AgentPageHeader
        title="Shelf-Life Monitor"
        subtitle="Track crop freshness and identify spoilage risk before it becomes a problem."
        icon="shelf"
        statusLabel="Demo"
        statusColor="demo"
      />
      <DemoBanner />

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Monitored', value: data.summary.totalMonitored, cls: 'bg-gray-50' },
              { label: '🟢 Fresh',   value: data.summary.fresh,          cls: 'bg-green-50' },
              { label: '🟡 Attention',value: data.summary.attention,     cls: 'bg-amber-50' },
              { label: '🔴 Critical', value: data.summary.critical,      cls: 'bg-red-50'   },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-xl px-4 py-2.5 text-center`}>
                <p className="text-sm font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {data.items.map((item) => <ShelfLifeCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </div>
  )
}
