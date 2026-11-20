/**
 * ShelfLifeMonitor.jsx  — /farmer/ai/shelf-life
 *
 * Connected to real data from GET /api/ai/shelf-life.
 * Response shape from shelfLifeService:
 *   { success, isDemo:false, items[], summary, meta }
 *
 * Each item:
 *   id, cropName, variety, quantity, unit, harvestDate,
 *   shelfLifeDays, elapsedDays, remainingDays, remainingPct, expiryDate,
 *   freshnessStatus (Fresh|Attention|Critical|Insufficient Data),
 *   riskLevel (Low|Medium|High|Critical|Unknown),
 *   storageLocation, recommendedAction, source, disclaimer
 */
import React, { useState, useEffect } from 'react'
import { fetchShelfLife }  from '../../../services/aiApi.js'
import AgentPageHeader     from '../../../components/ai/AgentPageHeader.jsx'

// ── Visual configs ────────────────────────────────────────────────────────────
const freshnessConfig = {
  'Fresh':             { bar: 'bg-green-500',  badge: 'bg-green-100 text-green-700',  ring: 'border-green-200'  },
  'Attention':         { bar: 'bg-amber-500',  badge: 'bg-amber-100 text-amber-700',  ring: 'border-amber-200'  },
  'Critical':          { bar: 'bg-red-500',    badge: 'bg-red-100 text-red-700',      ring: 'border-red-300'    },
  'Insufficient Data': { bar: 'bg-gray-300',   badge: 'bg-gray-100 text-gray-500',    ring: 'border-gray-200'   },
}

const riskColors = {
  Low:      'bg-green-100 text-green-700',
  Medium:   'bg-amber-100 text-amber-700',
  High:     'bg-orange-100 text-orange-700',
  Critical: 'bg-red-100 text-red-700',
  Unknown:  'bg-gray-100 text-gray-500',
}

// ── Individual card ───────────────────────────────────────────────────────────
function ShelfLifeCard({ item }) {
  const cfg = freshnessConfig[item.freshnessStatus] || freshnessConfig.Fresh
  const pct = item.shelfLifeDays > 0
    ? Math.min(100, Math.max(0, Math.round((item.remainingDays / item.shelfLifeDays) * 100)))
    : 0

  const harvestLabel = item.harvestDate
    ? new Date(item.harvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Not yet harvested'

  const expiryLabel = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const sourceLabel = {
    'farmer-estimate':     'Your estimate',
    'crop-name-reference': 'Industry reference',
    'category-reference':  'Category reference',
  }[item.source] || null

  return (
    <div className={`card border-2 ${cfg.ring} hover:shadow-md transition-shadow duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌿</div>
          <div>
            <h3 className="font-bold text-gray-900">{item.cropName}</h3>
            <p className="text-xs text-gray-400">
              {item.variety ? `${item.variety} · ` : ''}{item.quantity?.toLocaleString()} {item.unit}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`status-badge text-xs ${cfg.badge}`}>{item.freshnessStatus}</span>
          <span className={`status-badge text-xs ${riskColors[item.riskLevel] || riskColors.Unknown}`}>
            {item.riskLevel} Risk
          </span>
        </div>
      </div>

      {/* Shelf life bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
          <span>Remaining shelf life</span>
          <span className="font-semibold">
            {item.shelfLifeDays === 0 ? 'Unknown' : item.remainingDays <= 0 ? 'Expired' : `${item.remainingDays} days`}
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {item.shelfLifeDays > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {pct}% of {item.shelfLifeDays}-day estimated shelf life remaining
            {sourceLabel && <span className="ml-1 text-gray-300">· {sourceLabel}</span>}
          </p>
        )}
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {[
          { label: 'Harvest Date',       value: harvestLabel },
          item.shelfLifeDays > 0
            ? { label: 'Estimated Expiry',  value: expiryLabel }
            : null,
          item.elapsedDays > 0
            ? { label: 'Days Since Harvest', value: `${item.elapsedDays} days` }
            : null,
          { label: 'Storage Location',   value: item.storageLocation || '—' },
        ].filter(Boolean).map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-gray-400">{label}</span>
            <span className="text-gray-700 font-medium text-right">{value}</span>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="bg-gray-50 rounded-xl px-3 py-2.5 mb-2">
        <p className="text-xs text-gray-600 leading-relaxed">{item.recommendedAction}</p>
      </div>

      {/* Disclaimer */}
      {item.disclaimer && (
        <p className="text-[10px] text-gray-400 italic">{item.disclaimer}</p>
      )}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-8 bg-gray-100 rounded-xl" />
      <div className="space-y-2">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded w-full" />)}
      </div>
      <div className="h-12 bg-gray-50 rounded-xl" />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ShelfLifeMonitor() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  function load() {
    setLoading(true)
    setError('')
    fetchShelfLife()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <AgentPageHeader
        title="Shelf-Life Monitor"
        subtitle="Track crop freshness and identify spoilage risk before it becomes a problem."
        icon="shelf"
        statusLabel="Live"
        statusColor="active"
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 flex items-center justify-between mb-5">
          <span>{error}</span>
          <button onClick={load} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data ? null : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Monitored',     value: data.summary.totalMonitored, cls: 'bg-gray-50' },
              { label: '🟢 Fresh',      value: data.summary.fresh,          cls: 'bg-green-50' },
              { label: '🟡 Attention',  value: data.summary.attention,      cls: 'bg-amber-50' },
              { label: '🔴 Critical',   value: data.summary.critical,       cls: 'bg-red-50'   },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-xl px-4 py-2.5 text-center`}>
                <p className="text-sm font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
            {data.meta?.harvestedCrops != null && (
              <div className="bg-blue-50 rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-gray-700">{data.meta.harvestedCrops}</p>
                <p className="text-xs text-gray-400">Harvested</p>
              </div>
            )}
            <button
              onClick={load}
              className="ml-auto self-center text-xs text-agri-green hover:text-agri-dark font-medium flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-agri-light transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {/* Empty state */}
          {data.items?.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🌿</div>
              <p className="font-semibold text-gray-700">No crops to monitor</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {data.meta?.message || 'Harvested crops will appear here with freshness estimates.'}
              </p>
              <button
                onClick={() => window.location.href = '/farmer/crops/add'}
                className="btn-primary text-xs px-5 mt-4"
              >
                + Add Crop
              </button>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {data.items.map((item) => <ShelfLifeCard key={item.id} item={item} />)}
              </div>
              {data.meta?.disclaimer && (
                <p className="text-[11px] text-gray-400 italic text-center mt-4">
                  ⚠ {data.meta.disclaimer}
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
