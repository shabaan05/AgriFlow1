/**
 * HarvestPlanner.jsx  — /farmer/ai/harvest-planner
 *
 * Connected to real data from GET /api/ai/harvest-planner.
 * Response shape from harvestPlannerService:
 *   { success, isDemo:false, recommendations[], summary, meta }
 *
 * Each recommendation:
 *   cropName, variety, currentStatus, expectedHarvestDate,
 *   recommendedHarvestDate, availableQty, unit, urgency, daysUntilHarvest,
 *   linkedBookings, linkedBuyers, confirmedQty, qtyShortfall,
 *   rule, recommendation, reasons[], actions[]
 */
import React, { useState, useEffect } from 'react'
import { fetchHarvestPlan } from '../../../services/aiApi.js'
import AgentPageHeader      from '../../../components/ai/AgentPageHeader.jsx'
import UrgencyBadge         from '../../../components/ai/UrgencyBadge.jsx'

// ── Status badge colours ──────────────────────────────────────────────────────
const STATUS_CLS = {
  'Pre-Harvest':      'bg-orange-100 text-orange-700',
  'Harvest Ready':    'bg-emerald-100 text-emerald-700',
  'Booked':           'bg-violet-100 text-violet-700',
  'Harvested':        'bg-blue-100 text-blue-700',
  'Pickup Scheduled': 'bg-sky-100 text-sky-700',
}

// Rule → border accent
const RULE_BORDER = {
  HARVEST_NOW:        'border-l-red-500',
  HARVEST_SOON:       'border-l-amber-400',
  WAIT:               'border-l-gray-200',
  ALREADY_HARVESTED:  'border-l-blue-300',
  INSUFFICIENT_DATA:  'border-l-gray-300',
}

// ── Individual recommendation card ───────────────────────────────────────────
function HarvestCard({ item }) {
  const [showReasons, setShowReasons] = useState(false)

  const recDate = item.recommendedHarvestDate
    ? new Date(item.recommendedHarvestDate).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'long',
      })
    : '—'

  const statusCls  = STATUS_CLS[item.currentStatus]  || 'bg-gray-100 text-gray-600'
  const borderCls  = RULE_BORDER[item.rule]           || 'border-l-gray-200'
  const daysLabel  = item.daysUntilHarvest === null
    ? '—'
    : item.daysUntilHarvest <= 0
      ? 'Past due'
      : item.daysUntilHarvest

  return (
    <div className={`card border border-gray-100 border-l-4 ${borderCls} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
          <div>
            <h3 className="font-bold text-gray-900">{item.cropName}</h3>
            <p className="text-xs text-gray-400">
              {item.variety ? `${item.variety} · ` : ''}
              {item.availableQty?.toLocaleString()} {item.unit}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <UrgencyBadge level={item.urgency} />
          <span className={`status-badge text-xs ${statusCls}`}>{item.currentStatus}</span>
        </div>
      </div>

      {/* Harvest date + countdown */}
      <div className="bg-agri-light rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Recommended Harvest</p>
          <p className="text-sm font-bold text-agri-green mt-0.5">{recDate}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Days Until Harvest</p>
          <p className={`text-xl font-bold ${item.daysUntilHarvest !== null && item.daysUntilHarvest <= 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {daysLabel}
          </p>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Recommendation</p>
        <p className="text-sm text-gray-700 leading-relaxed">{item.recommendation}</p>
      </div>

      {/* Quantity shortfall warning */}
      {item.qtyShortfall > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mb-4 flex items-start gap-2 text-xs text-amber-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Quantity shortfall: bookings require {item.confirmedQty} kg but only {item.availableQty} kg available
            ({item.qtyShortfall} kg gap)
          </span>
        </div>
      )}

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
        {item.confirmedQty > 0 && (
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
            <p className="text-sm font-bold text-gray-800">{item.confirmedQty} {item.unit}</p>
            <p className="text-xs text-gray-400">Committed</p>
          </div>
        )}
      </div>

      {/* Reasons (expandable) */}
      {item.reasons?.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowReasons(v => !v)}
            className="text-xs text-agri-green hover:text-agri-dark font-medium flex items-center gap-1 mb-2"
          >
            {showReasons ? 'Hide' : 'Show'} why ({item.reasons.length})
            <svg className={`w-3 h-3 transition-transform ${showReasons ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {showReasons && (
            <ul className="space-y-1">
              {item.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-agri-green mt-0.5">•</span>
                  {r}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Actions */}
      {item.actions?.length > 0 && (
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
      <div className="h-14 bg-gray-100 rounded-xl" />
      <div className="h-16 bg-gray-50 rounded-xl" />
      <div className="h-10 bg-gray-50 rounded-xl" />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function HarvestPlanner() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  function load() {
    setLoading(true)
    setError('')
    fetchHarvestPlan()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <AgentPageHeader
        title="Harvest Planner"
        subtitle="Optimal harvest timing based on your bookings, demand signals and crop readiness."
        icon="harvest"
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
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data ? null : (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              {
                label: 'Upcoming Harvests',
                value: data.summary.upcomingHarvests,
              },
              {
                label: 'Urgent This Week',
                value: data.summary.urgentHarvests,
              },
              {
                label: 'Next Harvest',
                value: data.summary.nextHarvestDate
                  ? new Date(data.summary.nextHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : '—',
              },
            ].map(({ label, value }) => (
              <div key={label} className="bg-agri-light rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-agri-green">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
            {data.meta && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-gray-700">{data.meta.withBookings}</p>
                <p className="text-xs text-gray-400">Crops with Bookings</p>
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
          {data.recommendations?.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📅</div>
              <p className="font-semibold text-gray-700">No harvest recommendations</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {data.meta?.message || 'No active crops found. Add crops to see harvest planning.'}
              </p>
              <button
                onClick={() => window.location.href = '/farmer/crops/add'}
                className="btn-primary text-xs px-5 mt-4"
              >
                + Add Crop
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.recommendations.map((item) => (
                <HarvestCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {/* Meta info */}
          {data.meta && data.recommendations?.length > 0 && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              {data.meta.totalCrops} crop{data.meta.totalCrops !== 1 ? 's' : ''} analysed
              {data.meta.demandSignalsFound > 0 && ` · ${data.meta.demandSignalsFound} demand signal${data.meta.demandSignalsFound !== 1 ? 's' : ''} found`}
              {data.meta.activeRequirements > 0 && ` · ${data.meta.activeRequirements} active buyer requirement${data.meta.activeRequirements !== 1 ? 's' : ''}`}
            </p>
          )}
        </>
      )}
    </div>
  )
}
