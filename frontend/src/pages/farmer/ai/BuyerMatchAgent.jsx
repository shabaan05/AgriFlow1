import React, { useState, useEffect } from 'react'
import { useNavigate }      from 'react-router-dom'
import { fetchBuyerMatches } from '../../../services/aiApi.js'
import AgentPageHeader       from '../../../components/ai/AgentPageHeader.jsx'
import DemoBanner            from '../../../components/ai/DemoBanner.jsx'
import UrgencyBadge          from '../../../components/ai/UrgencyBadge.jsx'

function MatchScoreRing({ score }) {
  const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-gray-500'
  return (
    <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full border-4
      ${score >= 80 ? 'border-green-200 bg-green-50' : score >= 60 ? 'border-amber-200 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
    >
      <span className={`text-lg font-bold leading-none ${color}`}>{score}</span>
      <span className="text-[9px] text-gray-400 font-medium">score</span>
    </div>
  )
}

function MatchCard({ match }) {
  const navigate   = useNavigate()
  const deadline   = match.deadline
    ? new Date(match.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 border border-gray-100">
      {/* Top */}
      <div className="flex items-start gap-4 mb-4">
        <MatchScoreRing score={match.matchScore} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{match.buyerName}</h3>
            <UrgencyBadge level={match.urgency} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{match.buyerContact} · {match.location}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-agri-green">₹{match.expectedPrice}</p>
          <p className="text-xs text-gray-400">per {match.unit}</p>
        </div>
      </div>

      {/* Crop info */}
      <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 mb-4">
        <span className="text-lg">🌾</span>
        <div>
          <p className="text-sm font-semibold text-gray-800">{match.cropName} · {match.variety}</p>
          <p className="text-xs text-gray-500">{match.quantity.toLocaleString()} {match.unit} · Deadline {deadline}</p>
        </div>
      </div>

      {/* Reasons */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Why this match</p>
        <ul className="space-y-1.5">
          {match.matchReasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <svg className="w-3.5 h-3.5 text-agri-green flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate('/farmer/demand/buyers')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-agri-green text-white hover:bg-agri-dark transition-colors"
        >
          View Buyer Details
        </button>
        <button
          onClick={() => alert('Matching / booking flow coming in Bookings & Orders module.')}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 border-agri-green text-agri-green hover:bg-agri-light transition-colors"
        >
          Match & Book
        </button>
      </div>
    </div>
  )
}

export default function BuyerMatchAgent() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchBuyerMatches()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <AgentPageHeader
        title="Buyer Match Agent"
        subtitle="Recommended buyers for your crops based on price, grade, quantity and location."
        icon="match"
        statusLabel="Demo"
        statusColor="demo"
      />
      <DemoBanner />

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1,2,3,4].map((i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'Total Matches',       value: data.summary.totalMatches },
              { label: 'High-Score (80+)',     value: data.summary.highScoreMatches },
              { label: 'Top Crop',             value: data.summary.topCrop },
            ].map(({ label, value }) => (
              <div key={label} className="bg-agri-light rounded-xl px-4 py-2.5 text-center">
                <p className="text-sm font-bold text-agri-green">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {data.recommendations.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        </>
      )}
    </div>
  )
}
