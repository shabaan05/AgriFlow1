/**
 * BuyerMatchPage.jsx
 *
 * Buyer–Farmer Matching Agent UI.
 * Route: /buyer/ai/buyer-match
 *
 * Calls POST /api/ai/buyer-match and renders ranked crop/farmer results
 * with per-factor score breakdown and booking actions.
 *
 * Design: matches the AgriFlow Buyer UI system (Tailwind, card, input-field,
 * btn-primary, agri-green palette).
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runBuyerMatch } from '../../../services/aiApi.js'
import BookingModal from '../../../components/buyer/BookingModal.jsx'

// ── Constants ────────────────────────────────────────────────────────────────
const GRADES = ['Any', 'Grade A', 'Grade B', 'Grade C']

const FACTOR_META = {
  price:       { label: 'Price',              color: 'bg-emerald-500' },
  quality:     { label: 'Quality',            color: 'bg-blue-500'    },
  quantity:    { label: 'Quantity Availability', color: 'bg-violet-500' },
  location:    { label: 'Location',           color: 'bg-amber-500'   },
  dateSuit:    { label: 'Date Suitability',   color: 'bg-sky-500'     },
  reliability: { label: 'Farmer Reliability', color: 'bg-rose-500'    },
}

const SCORE_TIERS = [
  { min: 80, label: 'Excellent',    bg: 'bg-green-100',  text: 'text-green-800',  ring: 'ring-green-300'  },
  { min: 60, label: 'Good',         bg: 'bg-blue-100',   text: 'text-blue-800',   ring: 'ring-blue-300'   },
  { min: 40, label: 'Fair',         bg: 'bg-amber-100',  text: 'text-amber-800',  ring: 'ring-amber-300'  },
  { min: 0,  label: 'Low',          bg: 'bg-gray-100',   text: 'text-gray-700',   ring: 'ring-gray-300'   },
]

function scoreTier(score) {
  return SCORE_TIERS.find(t => score >= t.min) || SCORE_TIERS[3]
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const tier  = scoreTier(score)
  const circ  = 2 * Math.PI * 28   // r = 28
  const dash  = (score / 100) * circ
  const ringColor =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#2563eb' :
    score >= 40 ? '#d97706' : '#9ca3af'

  return (
    <div className={`relative w-20 h-20 flex items-center justify-center rounded-full ring-4 ${tier.ring} flex-shrink-0`}>
      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle
          cx="32" cy="32" r="28" fill="none"
          stroke={ringColor} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="relative text-center">
        <div className="text-xl font-extrabold text-gray-900 leading-none">{score}</div>
        <div className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide leading-none mt-0.5">score</div>
      </div>
    </div>
  )
}

function FactorBar({ label, value, colorCls }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span className="font-semibold text-gray-700">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorCls}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function MatchCard({ match, rank, onBook }) {
  const [expanded, setExpanded] = useState(false)
  const tier = scoreTier(match.matchScore)
  const harvestLabel = match.expectedHarvestDate
    ? new Date(match.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className={`card border-l-4 ${rank === 1 ? 'border-l-agri-green' : rank === 2 ? 'border-l-blue-400' : 'border-l-gray-200'} transition-shadow hover:shadow-lg`}>
      {/* Header row */}
      <div className="flex items-start gap-4">
        <ScoreRing score={match.matchScore} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-gray-900">
                  {match.cropName}{match.variety ? ` · ${match.variety}` : ''}
                </h3>
                <span className={`status-badge text-xs ${tier.bg} ${tier.text}`}>{tier.label} Match</span>
                {rank === 1 && (
                  <span className="bg-agri-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Best Match
                  </span>
                )}
              </div>
              {match.farmerName && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {match.farmerName}
                  {match.farmerVerification === 'Verified' && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-xs text-green-600 font-medium">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                  {match.farmName && <span className="text-gray-400"> · {match.farmName}</span>}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => onBook(match)}
                className="btn-primary text-xs px-4 py-2"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Key stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-3 text-xs">
            <div>
              <span className="text-gray-400">Price</span>
              <p className="font-semibold text-gray-800">₹{match.expectedPricePerKg}/kg</p>
            </div>
            <div>
              <span className="text-gray-400">Available Qty</span>
              <p className="font-semibold text-gray-800">{match.availableQuantityKg?.toLocaleString()} {match.unit}</p>
            </div>
            <div>
              <span className="text-gray-400">Quality Grade</span>
              <p className="font-semibold text-gray-800">{match.qualityGrade}</p>
            </div>
            <div>
              <span className="text-gray-400">Location</span>
              <p className="font-semibold text-gray-800 truncate">{match.farmLocation || '—'}</p>
            </div>
            {harvestLabel && (
              <div>
                <span className="text-gray-400">Harvest Date</span>
                <p className="font-semibold text-gray-800">{harvestLabel}</p>
              </div>
            )}
            <div>
              <span className="text-gray-400">Status</span>
              <p className="font-semibold text-gray-800">{match.status}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="mt-4 w-full flex items-center justify-between text-xs font-medium text-agri-green hover:text-agri-dark py-2 border-t border-gray-100 transition-colors"
      >
        <span>{expanded ? 'Hide' : 'Show'} match details</span>
        <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-5">
          {/* Factor breakdown */}
          {match.factors && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Score Breakdown</p>
              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3">
                {Object.entries(FACTOR_META).map(([key, meta]) => (
                  match.factors[key] != null && (
                    <FactorBar
                      key={key}
                      label={meta.label}
                      value={match.factors[key]}
                      colorCls={meta.color}
                    />
                  )
                ))}
              </div>
            </div>
          )}

          {/* Why this match */}
          {match.reasons?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why This Match?</p>
              <ul className="space-y-1.5">
                {match.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-agri-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Form input helper ─────────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BuyerMatchPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    cropName:         '',
    quantity:         '',
    maxPricePerKg:    '',
    qualityGrade:     'Any',
    requiredByDate:   '',
    deliveryCity:     '',
    deliveryState:    '',
  })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)   // { matches[], meta }
  const [apiError, setApiError] = useState('')
  const [searched, setSearched] = useState(false)

  // BookingModal state
  const [bookingTarget, setBookingTarget] = useState(null)  // match object → adapted to BookingModal crop shape
  const [bookingSuccess, setBookingSuccess] = useState(null)

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.cropName.trim()) e.cropName = 'Crop name is required'
    if (form.quantity && Number(form.quantity) <= 0)       e.quantity = 'Quantity must be greater than 0'
    if (form.maxPricePerKg && Number(form.maxPricePerKg) <= 0) e.maxPricePerKg = 'Max price must be greater than 0'
    if (form.requiredByDate) {
      const d = new Date(form.requiredByDate)
      if (isNaN(d.getTime())) e.requiredByDate = 'Invalid date'
      else if (d < new Date()) e.requiredByDate = 'Required-by date must be in the future'
    }
    return e
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const deliveryLocation = [form.deliveryCity, form.deliveryState].filter(Boolean).join(', ')

    setLoading(true)
    setSearched(true)
    setResult(null)
    try {
      const data = await runBuyerMatch({
        cropName:         form.cropName.trim(),
        quantity:         form.quantity         ? Number(form.quantity)      : undefined,
        maxPricePerKg:    form.maxPricePerKg    ? Number(form.maxPricePerKg) : undefined,
        qualityGrade:     form.qualityGrade !== 'Any' ? form.qualityGrade : undefined,
        requiredByDate:   form.requiredByDate   || undefined,
        deliveryLocation: deliveryLocation      || undefined,
      })
      setResult(data)
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Adapt a match result to BookingModal's expected "crop" prop shape ──────
  function matchToCrop(match) {
    return {
      id:                  match.cropId,
      name:                match.cropName,
      variety:             match.variety,
      availableQty:        match.availableQuantityKg,
      unit:                match.unit || 'kg',
      expectedPrice:       match.expectedPricePerKg,
      grade:               match.qualityGrade,
      expectedHarvestDate: match.expectedHarvestDate,
      farmer: {
        id:           match.farmerId,
        name:         match.farmerName,
        verification: match.farmerVerification,
      },
    }
  }

  const inputCls = (f) =>
    `input-field ${errors[f] ? 'border-red-400 focus:ring-red-400' : ''}`

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-5xl">
      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-7 gap-4 flex-wrap">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/buyer/ai')}
            className="mt-1 p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-agri-green transition-colors flex-shrink-0"
            aria-label="Back to AI Centre"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-agri-light text-agri-green rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">Buyer–Farmer Match</h1>
                <span className="status-badge text-xs bg-agri-light text-agri-green">AI Agent</span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                Enter your procurement criteria and we'll rank the best available farmers and crops for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[360px,1fr] gap-6 items-start">
        {/* ── Input form ───────────────────────────────────────────────────── */}
        <div className="card sticky top-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
            Procurement Criteria
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Crop Name" error={errors.cropName} required>
              <input
                type="text"
                className={inputCls('cropName')}
                placeholder="e.g. Tomato, Wheat, Onion"
                value={form.cropName}
                onChange={set('cropName')}
              />
            </Field>

            <Field label="Required Quantity (kg)" error={errors.quantity}>
              <input
                type="number" min="1" className={inputCls('quantity')}
                placeholder="e.g. 500"
                value={form.quantity} onChange={set('quantity')}
              />
            </Field>

            <Field label="Maximum Price per Kg (₹)" error={errors.maxPricePerKg}>
              <input
                type="number" min="0" step="0.01" className={inputCls('maxPricePerKg')}
                placeholder="e.g. 40"
                value={form.maxPricePerKg} onChange={set('maxPricePerKg')}
              />
            </Field>

            <Field label="Minimum Quality Grade">
              <select className="input-field bg-white" value={form.qualityGrade} onChange={set('qualityGrade')}>
                {GRADES.map(g => <option key={g}>{g}</option>)}
              </select>
            </Field>

            <Field label="Required By Date" error={errors.requiredByDate}>
              <input
                type="date" className={inputCls('requiredByDate')}
                min={today}
                value={form.requiredByDate} onChange={set('requiredByDate')}
              />
            </Field>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Location</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text" className="input-field" placeholder="City"
                  value={form.deliveryCity} onChange={set('deliveryCity')}
                />
                <input
                  type="text" className="input-field" placeholder="State"
                  value={form.deliveryState} onChange={set('deliveryState')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Finding Matches…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Best Matches
                </>
              )}
            </button>
          </form>
        </div>

        {/* ── Results panel ─────────────────────────────────────────────────── */}
        <div className="min-h-[320px]">

          {/* Initial state */}
          {!searched && !loading && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-agri-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Ready to match</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Fill in your procurement criteria on the left and click <strong>Find Best Matches</strong> to discover
                ranked farmer crops with explainable scores.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-3 pt-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        {[1,2,3].map(j => <div key={j} className="h-3 bg-gray-100 rounded" />)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API error */}
          {!loading && apiError && (
            <div className="card border border-red-200 bg-red-50 flex items-start gap-3 p-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-red-800">Match search failed</p>
                <p className="text-sm text-red-600 mt-0.5">{apiError}</p>
                <button
                  onClick={() => { setApiError(''); setSearched(false) }}
                  className="mt-2 text-xs font-medium text-red-700 underline"
                >
                  Clear and try again
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !apiError && result && (
            <>
              {/* Meta bar */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    {result.matches.length > 0
                      ? `${result.matches.length} Match${result.matches.length > 1 ? 'es' : ''} Found`
                      : 'No Matches Found'}
                  </h2>
                  {result.meta && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {result.meta.total} crop{result.meta.total !== 1 ? 's' : ''} scanned ·
                      {' '}{result.meta.filtered} eligible ·
                      {' '}showing top {result.matches.length}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => { setSearched(false); setResult(null) }}
                  className="text-xs text-gray-500 hover:text-agri-green underline transition-colors"
                >
                  New search
                </button>
              </div>

              {/* Empty */}
              {result.matches.length === 0 && (
                <div className="card flex flex-col items-center py-14 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No eligible matches</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs">
                    {result.message || 'No crops currently match your criteria. Try relaxing quantity, price, or quality filters.'}
                  </p>
                  <button
                    onClick={() => { setSearched(false); setResult(null) }}
                    className="btn-outline text-xs px-5 mt-4"
                  >
                    Adjust Criteria
                  </button>
                </div>
              )}

              {/* Match cards */}
              {result.matches.length > 0 && (
                <>
                  {/* Booking success banner */}
                  {bookingSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Booking request sent for <strong>{bookingSuccess.cropName}</strong>.
                      <button
                        onClick={() => navigate('/buyer/bookings')}
                        className="ml-auto text-green-700 underline font-semibold"
                      >
                        View Bookings →
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {result.matches.map((match, idx) => (
                      <MatchCard
                        key={match.cropId || idx}
                        match={match}
                        rank={idx + 1}
                        onBook={(m) => {
                          setBookingSuccess(null)
                          setBookingTarget(matchToCrop(m))
                        }}
                      />
                    ))}
                  </div>

                  {/* Weights legend */}
                  {result.meta?.weights && (
                    <div className="mt-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Scoring Weights</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(FACTOR_META).map(([key, meta]) => (
                          result.meta.weights[key] != null && (
                            <span key={key} className="inline-flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-2.5 py-1 text-gray-600">
                              <span className={`w-2 h-2 rounded-full ${meta.color}`} />
                              {meta.label}: {result.meta.weights[key]}%
                            </span>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* BookingModal — reuses existing workflow */}
      {bookingTarget && (
        <BookingModal
          crop={bookingTarget}
          onSuccess={(booking) => {
            setBookingTarget(null)
            setBookingSuccess({ cropName: bookingTarget.name })
          }}
          onClose={() => setBookingTarget(null)}
        />
      )}
    </div>
  )
}
