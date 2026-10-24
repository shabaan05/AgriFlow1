import React, { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { fetchWastagePrevention } from '../../../services/aiApi.js'
import AgentPageHeader           from '../../../components/ai/AgentPageHeader.jsx'
import DemoBanner                from '../../../components/ai/DemoBanner.jsx'

const riskConfig = {
  High:   { badge: 'bg-red-100 text-red-700',   bar: 'bg-red-500',   border: 'border-red-200' },
  Medium: { badge: 'bg-amber-100 text-amber-700', bar: 'bg-amber-500', border: 'border-amber-200' },
  Low:    { badge: 'bg-gray-100 text-gray-600',  bar: 'bg-gray-400',  border: 'border-gray-200' },
}

const actionColors = {
  'Find Buyer':        'bg-agri-green text-white hover:bg-agri-dark',
  'Offer Discount':    'bg-amber-500 text-white hover:bg-amber-600',
  'Prioritize Pickup': 'bg-blue-600 text-white hover:bg-blue-700',
  'Sell Locally':      'bg-gray-700 text-white hover:bg-gray-800',
}

function WastageCard({ alert }) {
  const navigate   = useNavigate()
  const cfg        = riskConfig[alert.riskLevel] || riskConfig.Low

  function handleAction(action) {
    if (action === 'Find Buyer') navigate('/farmer/ai/buyer-matches')
    else if (action === 'Prioritize Pickup') navigate('/farmer/orders')
    else alert(`${action} flow coming in Bookings & Orders module.`)
  }

  return (
    <div className={`card border-2 ${cfg.border} hover:shadow-md transition-shadow`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">⚠️</div>
          <div>
            <h3 className="font-bold text-gray-900">{alert.cropName}</h3>
            <p className="text-xs text-gray-400">{alert.variety}</p>
          </div>
        </div>
        <span className={`status-badge text-xs ${cfg.badge}`}>{alert.riskLevel} Risk</span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">Available</p>
          <p className="text-base font-bold text-gray-800">{alert.availableQty.toLocaleString()} {alert.unit}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400">At-Risk Qty</p>
          <p className="text-base font-bold text-red-700">{alert.potentialWastageKg} {alert.unit}</p>
        </div>
      </div>

      {/* Revenue risk */}
      <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2.5 mb-4">
        <p className="text-xs text-red-600 font-medium">Potential Revenue Loss</p>
        <p className="text-base font-bold text-red-700">{alert.potentialRevenueLoss}</p>
      </div>

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

export default function WastagePrevention() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchWastagePrevention()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <AgentPageHeader
        title="Wastage Prevention"
        subtitle="At-risk crops and recommended actions to reduce revenue loss."
        icon="wastage"
        statusLabel={data?.summary?.atRiskCrops > 0 ? 'Alert' : 'Demo'}
        statusColor={data?.summary?.atRiskCrops > 0 ? 'alert' : 'demo'}
      />
      <DemoBanner />

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-5">
          {[1,2].map((i) => <div key={i} className="card h-80 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700">{error}</div>
      ) : (
        <>
          {/* Summary */}
          <div className="flex flex-wrap gap-3 mb-5">
            {[
              { label: 'At-Risk Crops',     value: data.summary.atRiskCrops,        cls: 'bg-red-50'   },
              { label: 'At-Risk Quantity',  value: `${data.summary.potentialWastageKg} kg`, cls: 'bg-amber-50' },
              { label: 'Potential Loss',    value: data.summary.potentialRevenueLoss, cls: 'bg-red-50'  },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-xl px-4 py-2.5 text-center`}>
                <p className="text-sm font-bold text-gray-800">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {data.alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-3xl mb-4">✅</div>
              <p className="font-semibold text-gray-700">No crops at risk of wastage</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {data.alerts.map((a) => <WastageCard key={a.id} alert={a} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}
