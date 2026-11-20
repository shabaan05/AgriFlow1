/**
 * WastagePrevention.jsx  — /farmer/ai/wastage-prevention
 *
 * Connected to real data from GET /api/ai/wastage-prevention.
 * Response shape from wastagePreventionService:
 *   { success, isDemo:false, alerts[], summary, meta }
 *
 * Each alert:
 *   id, cropName, variety, availableQty, unit,
 *   riskLevel (Critical|High|Medium|Low),
 *   riskReasons[], potentialWastageKg, potentialRevenueLoss (string),
 *   expectedPrice, remainingShelfLifeDays, hasBookings, committedQty,
 *   recommendedActions[{action, label, priority}], urgency
 */
import React, { useState, useEffect } from 'react'
import { useNavigate }             from 'react-router-dom'
import { fetchWastagePrevention }  from '../../../services/aiApi.js'
import AgentPageHeader             from '../../../components/ai/AgentPageHeader.jsx'

// ── Visual configs ────────────────────────────────────────────────────────────
const riskConfig = {
  Critical: { badge: 'bg-red-100 text-red-800',    bar: 'bg-red-600',    border: 'border-red-300'   },
  High:     { badge: 'bg-red-100 text-red-700',    bar: 'bg-red-500',    border: 'border-red-200'   },
  Medium:   { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500',  border: 'border-amber-200' },
  Low:      { badge: 'bg-gray-100 text-gray-600',  bar: 'bg-gray-400',   border: 'border-gray-200'  },
}

const actionColors = {
  'Find Buyer':        'bg-agri-green text-white hover:bg-agri-dark',
  'Offer Discount':    'bg-amber-500 text-white hover:bg-amber-600',
  'Prioritize Pickup': 'bg-blue-600 text-white hover:bg-blue-700',
  'Sell Locally':      'bg-gray-700 text-white hover:bg-gray-800',
}

// ── Wastage card ──────────────────────────────────────────────────────────────
function WastageCard({ alert }) {
  const navigate = useNavigate()
  const cfg      = riskConfig[alert.riskLevel] || riskConfig.Low

  function handleAction(action) {
    if (action === 'Find Buyer')        navigate('/farmer/ai/buyer-matches')
    else if (action === 'Prioritize Pickup') navigate('/farmer/orders')
    // Other actions (Offer Discount, Sell Locally) are recommendations — farmer decides
  }

  const shelfLabel = alert.remainingShelfLifeDays != null
    ? (alert.remainingShelfLifeDays <= 0
        ? 'Expired'
        : `${alert.remainingShelfLifeDays} days remaining`)
    : '—'

  return (
    <div className={`card border-2 ${cfg.border} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
          <div>
            <h3 className="font-bold text-gray-900">{alert.cropName}</h3>
            <p className="text-xs text-gray-400">{alert.variety || 'No variety specified'}</p>
          </div>
        </div>
        <span className={`status-badge text-xs ${cfg.badge}`}>{alert.riskLevel} Risk</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Available</p>
          <p className="text-base font-bold text-gray-800">{alert.availableQty?.toLocaleString()} {alert.unit}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">At-Risk Qty</p>
          <p className="text-base font-bold text-red-700">{alert.potentialWastageKg} {alert.unit}</p>
        </div>
      </div>

      {/* Revenue risk */}
      <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2.5 mb-3">
        <p className="text-xs text-red-600 font-medium">Est. Revenue Loss</p>
        <p className="text-base font-bold text-red-700">{alert.potentialRevenueLoss}</p>
      </div>

      {/* Shelf life */}
      {alert.remainingShelfLifeDays != null && (
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 mb-4">
          <p className="text-xs text-gray-500">Shelf life remaining</p>
          <p className={`text-xs font-semibold ${alert.remainingShelfLifeDays <= 3 ? 'text-red-600' : 'text-gray-700'}`}>
            {shelfLabel}
          </p>
        </div>
      )}

      {/* Risk reasons */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Risk Factors</p>
        <ul className="space-y-1.5">
          {alert.riskReasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Urgency */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
        <p className="text-xs font-semibold text-amber-700">⏱ {alert.urgency}</p>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {alert.recommendedActions.map(({ action, label }) => (
          <button
            key={action}
            onClick={() => handleAction(action)}
            className={`py-2.5 rounded-xl text-xs font-semibold transition-colors ${actionColors[action] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            {label}
          </button>
        ))}
      </div>
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
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="h-16 bg-red-50 rounded-xl" />
      </div>
      <div className="h-10 bg-gray-50 rounded-xl" />
      <div className="space-y-1.5">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function WastagePrevention() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  function load() {
    setLoading(true)
    setError('')
    fetchWastagePrevention()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const hasAlerts = data?.alerts?.length > 0

  return (
    <div>
      <AgentPageHeader
        title="Wastage Prevention"
        subtitle="At-risk crops and actionable recommendations to reduce revenue loss."
        icon="wastage"
        statusLabel={hasAlerts ? 'Alert' : 'Live'}
        statusColor={hasAlerts ? 'alert' : 'active'}
      />

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 flex items-center justify-between mb-5">
          <span>{error}</span>
          <button onClick={load} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1,2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data ? null : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'At-Risk Crops',    value: data.summary.atRiskCrops,            cls: 'bg-red-50'    },
              { label: 'At-Risk Quantity', value: `${data.summary.potentialWastageKg} kg`, cls: 'bg-amber-50' },
              { label: 'Potential Loss',   value: data.summary.potentialRevenueLoss,    cls: 'bg-red-50'    },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-xl px-4 py-2.5 text-center`}>
                <p className="text-sm font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
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
          {!hasAlerts ? (
            <div className="card flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4">✅</div>
              <p className="font-semibold text-gray-700">No crops at risk of wastage</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                {data.meta?.message || 'All your crops have adequate shelf life or confirmed buyers.'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 gap-5">
                {data.alerts.map((a) => <WastageCard key={a.id} alert={a} />)}
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
