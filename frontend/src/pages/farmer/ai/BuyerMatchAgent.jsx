/**
 * BuyerMatchAgent.jsx  — /farmer/ai/buyer-matches
 *
 * Fetches REAL buyer match data from GET /api/ai/buyer-matches.
 * Shows ranked buyer requirements that match the farmer's available crops.
 *
 * Response shape (from farmerBuyerMatchService):
 *   { success, isDemo, matches[], summary, meta }
 *
 * Each match has:
 *   cropId, cropName, variety, availableQty, unit, expectedPrice, qualityGrade, farmLocation
 *   requirementId, buyerId, buyerName, buyerCompany, buyerContact, buyerLocation, buyerVerification
 *   requiredQuantity, requiredUnit, maxPricePerKg, qualityRequired, deliveryLocation, requiredByDate
 *   matchScore, factors{}, reasons[], urgency, deadline
 */
import React, { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { fetchBuyerMatches }   from '../../../services/aiApi.js'
import AgentPageHeader         from '../../../components/ai/AgentPageHeader.jsx'

// ── Urgency badge ─────────────────────────────────────────────────────────────
const URGENCY_CLS = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-gray-100 text-gray-500',
}

function UrgencyBadge({ level }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${URGENCY_CLS[level] || URGENCY_CLS.Low}`}>
      {level}
    </span>
  )
}

// ── Score ring ─────────────────────────────────────────────────────────────────
function MatchScoreRing({ score }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-gray-500'
  const border = score >= 80
    ? 'border-green-200 bg-green-50'
    : score >= 60
      ? 'border-amber-200 bg-amber-50'
      : 'border-gray-200 bg-gray-50'

  return (
    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4 flex-shrink-0 ${border}`}>
      <span className={`text-lg font-bold leading-none ${color}`}>{score}</span>
      <span className="text-[9px] text-gray-400 font-medium">score</span>
    </div>
  )
}

// ── Factor bar ────────────────────────────────────────────────────────────────
const FACTOR_COLORS = {
  price:    'bg-emerald-500',
  quality:  'bg-blue-500',
  quantity: 'bg-violet-500',
  location: 'bg-amber-500',
  dateSuit: 'bg-sky-500',
  buyer:    'bg-rose-400',
}
const FACTOR_LABELS = {
  price:    'Price',
  quality:  'Quality',
  quantity: 'Quantity',
  location: 'Location',
  dateSuit: 'Date',
  buyer:    'Buyer',
}

function FactorBar({ name, value }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-gray-500">{FACTOR_LABELS[name] || name}</span>
        <span className="font-medium text-gray-600">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${FACTOR_COLORS[name] || 'bg-gray-400'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

// ── Match card ────────────────────────────────────────────────────────────────
function MatchCard({ match }) {
  const navigate     = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const deadline = match.deadline
    ? new Date(match.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const priceRange = match.maxPricePerKg != null
    ? (match.minPricePerKg != null
        ? `₹${match.minPricePerKg}–₹${match.maxPricePerKg}/kg`
        : `Up to ₹${match.maxPricePerKg}/kg`)
    : 'No price limit set'

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 border border-gray-100">
      {/* Top row */}
      <div className="flex items-start gap-4 mb-4">
        <MatchScoreRing score={match.matchScore} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="font-bold text-gray-900">{match.buyerName}</h3>
            <UrgencyBadge level={match.urgency} />
            {match.buyerVerification === 'Verified' && (
              <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            )}
          </div>
          {match.buyerCompany && (
            <p className="text-xs text-gray-400">{match.buyerCompany}</p>
          )}
          <p className="text-xs text-gray-500 mt-0.5">
            {match.buyerLocation || match.deliveryLocation || '—'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-agri-green">{priceRange}</p>
          <p className="text-xs text-gray-400 mt-0.5">Deadline: {deadline}</p>
        </div>
      </div>

      {/* Crop info panel */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
        <span className="text-lg flex-shrink-0">🌾</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">
            {match.cropName}{match.variety ? ` · ${match.variety}` : ''}
          </p>
          <p className="text-xs text-gray-500">
            They need {match.requiredQuantity?.toLocaleString()} {match.requiredUnit || 'kg'}
            {' · '}Grade required: {match.qualityRequired || 'Any'}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-gray-400">Your stock</p>
          <p className="text-sm font-semibold text-agri-green">
            {match.availableQty?.toLocaleString()} {match.unit}
          </p>
        </div>
      </div>

      {/* Reasons */}
      {match.reasons?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why this match</p>
          <ul className="space-y-1.5">
            {match.reasons.slice(0, expanded ? undefined : 3).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <svg className="w-3.5 h-3.5 text-agri-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Factor breakdown toggle */}
      {match.factors && (
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-xs text-agri-green hover:text-agri-dark font-medium mb-3 flex items-center gap-1"
        >
          {expanded ? 'Hide' : 'Show'} score breakdown
          <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
      {expanded && match.factors && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
          {Object.entries(match.factors).map(([k, v]) => (
            <FactorBar key={k} name={k} value={v} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate('/farmer/demand/buyers')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors"
        >
          View Buyer Requirements →
        </button>
        <button
          onClick={() => navigate('/farmer/crops')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 border-agri-green text-agri-green hover:bg-agri-light transition-colors"
        >
          Manage My Crops
        </button>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-14 bg-gray-100 rounded-xl" />
      <div className="space-y-1.5">
        {[1,2,3].map(i => <div key={i} className="h-3 bg-gray-100 rounded" />)}
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BuyerMatchAgent() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  function load() {
    setLoading(true)
    setError('')
    fetchBuyerMatches()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <AgentPageHeader
        title="Buyer Match Agent"
        subtitle="Active buyer requirements that match your available crops — ranked by compatibility."
        icon="match"
        statusLabel="Live"
        statusColor="active"
      />

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 flex items-center justify-between mb-5">
          <span>{error}</span>
          <button onClick={load} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : !data ? null : (
        <>
          {/* Summary bar */}
          {data.summary && (
            <div className="flex flex-wrap gap-3 mb-5">
              {[
                { label: 'Total Matches',      value: data.summary.totalMatches },
                { label: 'High-Score (80+)',    value: data.summary.highScoreMatches },
                { label: 'Top Crop',            value: data.summary.topCrop || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-agri-light rounded-xl px-4 py-2.5 text-center">
                  <p className="text-sm font-bold text-agri-green">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
              {data.meta && (
                <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-center">
                  <p className="text-sm font-bold text-gray-700">{data.meta.activeRequirements}</p>
                  <p className="text-xs text-gray-400">Active Requirements</p>
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
          )}

          {/* Empty state */}
          {data.matches?.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
              <p className="font-semibold text-gray-700">No buyer matches right now</p>
              <p className="text-sm text-gray-400 mt-1 max-w-sm">
                {data.meta?.message || 'No active buyer requirements match your available crops.'}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.href = '/farmer/crops/add'}
                  className="btn-primary text-xs px-5"
                >
                  + Add Crop
                </button>
                <button onClick={load} className="btn-outline text-xs px-5">
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {data.matches.map((m) => <MatchCard key={`${m.cropId}-${m.requirementId}`} match={m} />)}
            </div>
          )}

          {/* Meta info */}
          {data.meta && data.matches?.length > 0 && (
            <p className="text-xs text-gray-400 mt-4 text-center">
              Evaluated {data.meta.pairsEvaluated} crop–requirement pair{data.meta.pairsEvaluated !== 1 ? 's' : ''} from
              {' '}{data.meta.availableCrops} available crop{data.meta.availableCrops !== 1 ? 's' : ''} and
              {' '}{data.meta.activeRequirements} active requirement{data.meta.activeRequirements !== 1 ? 's' : ''}.
            </p>
          )}
        </>
      )}
    </div>
  )
}
