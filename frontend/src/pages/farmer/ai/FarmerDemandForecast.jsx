/**
 * FarmerDemandForecast.jsx
 *
 * Demand Forecast Agent — Farmer perspective.
 * Route: /farmer/ai/demand-forecast
 *
 * Reuses the same POST /api/ai/demand-forecast endpoint and SVG chart
 * as the Buyer version, but frames everything around farmer production
 * and harvest decisions.
 *
 * "What demand can I expect for my crop? Should I grow more or less?"
 */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runDemandForecast } from '../../../services/aiApi.js'
import AgentPageHeader from '../../../components/ai/AgentPageHeader.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────
const PERIOD_OPTIONS = [
  { value: '1',  label: '1 Month'   },
  { value: '3',  label: '3 Months'  },
  { value: '6',  label: '6 Months'  },
  { value: '12', label: '12 Months' },
]

const TREND_META = {
  INCREASING: { label: 'Increasing ↑', bg: 'bg-green-100',  text: 'text-green-800',  icon: '📈' },
  STABLE:     { label: 'Stable →',     bg: 'bg-blue-100',   text: 'text-blue-800',   icon: '➡️' },
  DECREASING: { label: 'Decreasing ↓', bg: 'bg-red-100',    text: 'text-red-700',    icon: '📉' },
}

const LEVEL_META = {
  HIGH:   { label: 'High',   bg: 'bg-green-100', text: 'text-green-800' },
  MEDIUM: { label: 'Medium', bg: 'bg-amber-100',  text: 'text-amber-800' },
  LOW:    { label: 'Low',    bg: 'bg-gray-100',   text: 'text-gray-700'  },
}

const CONF_META = {
  HIGH:   { label: 'High Confidence',   bg: 'bg-green-100', text: 'text-green-800', barColor: '#16a34a' },
  MEDIUM: { label: 'Medium Confidence', bg: 'bg-amber-100',  text: 'text-amber-800', barColor: '#d97706' },
  LOW:    { label: 'Low Confidence',    bg: 'bg-gray-100',   text: 'text-gray-600',  barColor: '#9ca3af' },
}

// ── Farmer-framed recommendation ──────────────────────────────────────────────
/**
 * Convert the backend's procurement-oriented recommendation into a
 * farmer-oriented production/harvest recommendation.
 */
function farmerRecommendation(result) {
  const crop = result.cropName
  const { trend, demandLevel } = result

  if (trend === 'INCREASING') {
    const priceHint = result.expectedPriceMin
      ? ` Expected selling price is ₹${result.expectedPriceMin}–₹${result.expectedPriceMax}/kg.`
      : ''
    return `Demand for ${crop} is rising — consider maintaining or increasing your ${crop} production.` +
      ` Start planning your next harvest cycle early to take advantage of the higher demand.${priceHint}`
  }

  if (trend === 'DECREASING') {
    return `Demand for ${crop} is softening. You may face more competition from other farmers.` +
      ` Consider diversifying to other crops or reducing new plantings for this cycle.`
  }

  // STABLE
  if (demandLevel === 'HIGH') {
    return `Demand for ${crop} is stable at a high level — a reliable crop to continue growing.` +
      ` Standard harvest planning should work well for the coming period.`
  }
  if (demandLevel === 'LOW') {
    return `Demand for ${crop} is stable but low. Review whether this crop is the best use of your farm capacity,` +
      ` or seek buyers directly through the marketplace before committing to the next harvest.`
  }
  return `Demand for ${crop} is broadly stable. Continue normal production planning.` +
    ` No major supply pressure or shortage is expected in the coming period.`
}

// ── SVG Chart (shared logic — identical to buyer version) ─────────────────────
function DemandChart({ historical, forecast }) {
  const allPoints = [
    ...historical.map(p => ({ ...p, isForecast: false })),
    ...forecast.map(p =>   ({ ...p, isForecast: true  })),
  ]
  if (allPoints.length === 0) return null

  const maxQty = Math.max(...allPoints.map(p => p.quantity), 1)
  const W = 600, H = 200
  const PAD_L = 50, PAD_R = 16, PAD_T = 16, PAD_B = 48
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B
  const n = allPoints.length
  const barW = (chartW / n) * 0.6
  const gap  = chartW / n
  const yTicks = [0, Math.round(maxQty / 2), maxQty]

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-full"
        style={{ minWidth: Math.max(320, n * 32) }}
        aria-label="Demand chart: historical and forecast quantities"
      >
        {yTicks.map((tick, i) => {
          const y = PAD_T + chartH - (tick / maxQty) * chartH
          return (
            <g key={i}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#e5e7eb" strokeWidth="1" />
              <text x={PAD_L - 6} y={y + 4} fontSize="10" textAnchor="end" fill="#9ca3af">
                {tick >= 1000 ? `${(tick / 1000).toFixed(1)}k` : tick}
              </text>
            </g>
          )
        })}

        {forecast.length > 0 && historical.length > 0 && (() => {
          const divX = PAD_L + historical.length * gap
          return <line x1={divX} y1={PAD_T} x2={divX} y2={PAD_T + chartH}
            stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 3" />
        })()}

        {allPoints.map((pt, i) => {
          const barH  = Math.max(2, (pt.quantity / maxQty) * chartH)
          const x     = PAD_L + i * gap + (gap - barW) / 2
          const y     = PAD_T + chartH - barH
          const fill  = pt.isForecast ? '#86efac' : '#1a6b3c'
          const opacity = pt.isForecast ? 0.7 : 1
          return (
            <g key={i}>
              <rect x={x} y={y} width={barW} height={barH} fill={fill} opacity={opacity} rx="3" />
              {pt.quantity > 0 && barH > 14 && (
                <text x={x + barW / 2} y={y - 3} fontSize="8" textAnchor="middle"
                  fill={pt.isForecast ? '#166534' : '#0d3d22'}>
                  {pt.quantity >= 1000 ? `${(pt.quantity / 1000).toFixed(1)}k` : pt.quantity}
                </text>
              )}
              <text x={x + barW / 2} y={PAD_T + chartH + 16} fontSize="9" textAnchor="middle" fill="#6b7280"
                transform={`rotate(-35, ${x + barW / 2}, ${PAD_T + chartH + 16})`}>
                {pt.label}
              </text>
            </g>
          )
        })}

        <rect x={PAD_L} y={H - 12} width={10} height={8} fill="#1a6b3c" rx="2" />
        <text x={PAD_L + 14} y={H - 5} fontSize="9" fill="#6b7280">Historical</text>
        <rect x={PAD_L + 80} y={H - 12} width={10} height={8} fill="#86efac" rx="2" />
        <text x={PAD_L + 94} y={H - 5} fontSize="9" fill="#6b7280">Forecast</text>
      </svg>
    </div>
  )
}

// ── KPI card ──────────────────────────────────────────────────────────────────
function KpiCard({ label, value, valueCls, badge, badgeBg, badgeText, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${valueCls || 'text-gray-900'}`}>{value}</p>
      {badge && (
        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg} ${badgeText}`}>
          {badge}
        </span>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Confidence bar ────────────────────────────────────────────────────────────
function ConfidenceBar({ confidence, score }) {
  const meta = CONF_META[confidence] || CONF_META.LOW
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
          {meta.label}
        </span>
        <span className="text-xs text-gray-400">{score}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: meta.barColor }} />
      </div>
      <p className="text-xs text-gray-400 mt-1">
        Based on {score >= 60 ? 'strong' : score >= 40 ? 'moderate' : 'limited'} historical data
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function FarmerDemandForecast() {
  const navigate = useNavigate()

  const [form,     setForm]     = useState({ cropName: '', forecastPeriod: '3' })
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState(null)
  const [apiError, setApiError] = useState('')
  const [searched, setSearched] = useState(false)

  const set = (f) => (e) => {
    setForm(p => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.cropName.trim()) e.cropName = 'Crop name is required'
    return e
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    setSearched(true)
    setResult(null)

    try {
      const data = await runDemandForecast({
        cropName:       form.cropName.trim(),
        forecastPeriod: form.forecastPeriod,
      })
      setResult(data)
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const trendMeta = result?.trend ? TREND_META[result.trend] || TREND_META.STABLE : null
  const levelMeta = result?.demandLevel ? LEVEL_META[result.demandLevel] || LEVEL_META.MEDIUM : null

  return (
    <div>
      <AgentPageHeader
        title="Demand Forecast"
        subtitle="Understand future crop demand to make better planting and harvest decisions."
        icon="forecast"
        statusLabel="Live"
        statusColor="active"
      />

      <div className="grid lg:grid-cols-[300px,1fr] gap-6 items-start">
        {/* ── Input form ───────────────────────────────────────────────────── */}
        <div className="card sticky top-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
            Forecast Parameters
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Crop Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input-field ${errors.cropName ? 'border-red-400 focus:ring-red-400' : ''}`}
                placeholder="e.g. Tomato, Wheat, Onion"
                value={form.cropName}
                onChange={set('cropName')}
              />
              {errors.cropName && <p className="text-xs text-red-500 mt-1">{errors.cropName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Forecast Period</label>
              <select
                className="input-field bg-white"
                value={form.forecastPeriod}
                onChange={set('forecastPeriod')}
              >
                {PERIOD_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
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
                  Generating…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Forecast
                </>
              )}
            </button>
          </form>

          {/* How it helps you */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">How it helps you</p>
            <ul className="space-y-1.5">
              {[
                'See buyer demand trends for your crops',
                'Plan planting cycles around peak demand',
                'Estimate selling price range ahead of harvest',
                'Reduce risk of oversupply or missed demand',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-xs text-gray-500">
                  <svg className="w-3 h-3 text-agri-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 8 8">
                    <circle cx="4" cy="4" r="3" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Results panel ─────────────────────────────────────────────────── */}
        <div className="min-h-[320px]">

          {/* Initial state */}
          {!searched && !loading && (
            <div className="card flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-agri-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-gray-700 mb-1">Ready to forecast demand</h3>
              <p className="text-sm text-gray-400 max-w-xs">
                Enter one of your crops and a forecast period, then click{' '}
                <strong>Generate Forecast</strong> to see expected buyer demand,
                trend direction, and planting recommendations.
              </p>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1,2,3,4].map(i => <div key={i} className="card animate-pulse h-24" />)}
              </div>
              <div className="card animate-pulse h-56" />
              <div className="card animate-pulse h-20" />
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
                <p className="text-sm font-semibold text-red-800">Forecast failed</p>
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
              {/* No data */}
              {!result.hasData && (
                <div className="card flex flex-col items-center py-14 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No demand data found for "{result.cropName}"</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-sm">
                    {result.message || 'As more orders and bookings are recorded for this crop, the forecast will improve.'}
                  </p>
                  <button
                    onClick={() => { setSearched(false); setResult(null) }}
                    className="btn-outline text-xs px-5 mt-4"
                  >
                    Try another crop
                  </button>
                </div>
              )}

              {/* Full forecast */}
              {result.hasData && (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <div>
                      <h2 className="text-base font-bold text-gray-900">
                        {result.cropName} — {result.forecastLabel} Outlook
                      </h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Based on: {result.dataSources?.join(' · ') || 'platform data'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setSearched(false); setResult(null) }}
                      className="text-xs text-gray-500 hover:text-agri-green underline transition-colors"
                    >
                      New forecast
                    </button>
                  </div>

                  {/* KPI cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <KpiCard
                      label="Demand Trend"
                      value={trendMeta?.icon || ''}
                      badge={trendMeta?.label}
                      badgeBg={trendMeta?.bg}
                      badgeText={trendMeta?.text}
                    />
                    <KpiCard
                      label="Demand Level"
                      value={levelMeta?.label || result.demandLevel}
                      valueCls="text-gray-800"
                      badge={result.demandLevel}
                      badgeBg={levelMeta?.bg}
                      badgeText={levelMeta?.text}
                    />
                    <KpiCard
                      label="Expected Selling Price"
                      value={
                        result.expectedPriceMin && result.expectedPriceMax
                          ? `₹${result.expectedPriceMin}–${result.expectedPriceMax}`
                          : '—'
                      }
                      valueCls="text-agri-green"
                      sub={result.expectedPriceMin ? 'per kg' : 'Insufficient price data'}
                    />
                    <KpiCard
                      label="Forecast Demand"
                      value={result.totalForecastQty?.toLocaleString() ?? '—'}
                      sub={`kg over ${result.forecastLabel}`}
                    />
                  </div>

                  {/* Chart */}
                  <div className="card mb-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      Buyer Demand History vs Forecast (kg/month)
                    </h3>
                    <p className="text-xs text-gray-400 mb-4">
                      Past {result.meta?.historicalMonths} months · {result.meta?.nonZeroMonths} months with demand data
                    </p>
                    <DemandChart
                      historical={result.historicalPoints || []}
                      forecast={result.forecastPoints   || []}
                    />
                  </div>

                  {/* Confidence */}
                  <div className="card mb-5">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Forecast Confidence
                    </h3>
                    <ConfidenceBar confidence={result.confidence} score={result.confidenceScore} />
                    {result.meta && (
                      <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                        {[
                          { label: 'Transactions',    value: result.meta.totalTransactions  },
                          { label: 'Market Signals',  value: result.meta.demandSignalCount  },
                          { label: 'Months w/ Data',  value: result.meta.nonZeroMonths      },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xl font-bold text-gray-900">{value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Farmer-framed recommendation */}
                  <div className="card border-l-4 border-l-agri-green bg-agri-light/30">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-agri-light rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-agri-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-agri-dark mb-1">Production Recommendation</p>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {farmerRecommendation(result)}
                        </p>
                        {result.confidence === 'LOW' && (
                          <p className="text-xs text-amber-600 mt-2 italic">
                            ⚠ Confidence is low — more completed orders will improve future forecasts.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button
                      onClick={() => navigate('/farmer/crops/add')}
                      className="btn-primary text-sm px-5"
                    >
                      + Add / Plan Crop
                    </button>
                    <button
                      onClick={() => navigate('/farmer/demand')}
                      className="btn-outline text-sm px-5"
                    >
                      View Market Demand
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
