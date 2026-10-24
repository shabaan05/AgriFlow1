import React from 'react'
import { useNavigate } from 'react-router-dom'
import DemandLevelBadge from './DemandLevelBadge.jsx'
import TrendBadge       from './TrendBadge.jsx'

const categoryEmoji = {
  'Vegetables':       '🥦',
  'Fruits':           '🍎',
  'Grains & Cereals': '🌾',
  'Pulses & Legumes': '🫘',
  'Spices & Herbs':   '🌿',
  'Oilseeds':         '🌻',
  'Other':            '🌱',
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-agri-green font-semibold' : 'text-gray-700'}`}>
        {value}
      </span>
    </div>
  )
}

export default function DemandCard({ demand }) {
  const navigate = useNavigate()
  const emoji = categoryEmoji[demand.category] || '🌱'

  const deadline = demand.requiredBy
    ? new Date(demand.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const priceRange = demand.expectedPriceMin && demand.expectedPriceMax
    ? `₹${demand.expectedPriceMin}–${demand.expectedPriceMax}/${demand.unit}`
    : '—'

  const buyerCount = demand.buyerRequirements?.length || 0

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 flex flex-col gap-0 p-0 overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">{demand.cropName}</h3>
            <p className="text-xs text-gray-400 truncate">{demand.variety || demand.category}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <DemandLevelBadge level={demand.demandLevel} />
          <TrendBadge trend={demand.demandTrend} />
        </div>
      </div>

      {/* Info */}
      <div className="px-5 pb-3">
        <InfoRow label="Demand Qty"    value={`${demand.demandQuantity.toLocaleString()} ${demand.unit}`} />
        <InfoRow label="Price Range"   value={priceRange} highlight />
        <InfoRow label="Location"      value={demand.location} />
        <InfoRow label="Required By"   value={deadline} />
        <InfoRow label="Buyer Enquiries" value={buyerCount > 0 ? `${buyerCount} buyer${buyerCount > 1 ? 's' : ''}` : 'None yet'} />
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-5 py-3">
        <button
          onClick={() => navigate(`/farmer/demand/opportunities`)}
          className="w-full text-xs font-semibold text-agri-green bg-agri-light
                     py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          View Opportunity →
        </button>
      </div>
    </div>
  )
}
