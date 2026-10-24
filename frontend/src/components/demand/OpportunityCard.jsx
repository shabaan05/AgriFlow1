import React from 'react'
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

export default function OpportunityCard({ opp, onListCrop, onPreBook }) {
  const emoji    = categoryEmoji[opp.category] || '🌱'
  const deadline = opp.requiredBy
    ? new Date(opp.requiredBy).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-agri-green/20">
      {/* Top */}
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-base">{opp.cropName} Demand</h3>
            <DemandLevelBadge level={opp.demandLevel} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{opp.location}</p>
        </div>
        <TrendBadge trend={opp.demandTrend} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-0.5">Demand</p>
          <p className="text-sm font-bold text-gray-800">{opp.demandQuantity.toLocaleString()}</p>
          <p className="text-xs text-gray-400">{opp.unit}</p>
        </div>
        <div className="bg-agri-light rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-0.5">Price Range</p>
          <p className="text-sm font-bold text-agri-green">₹{opp.expectedPriceMin}–{opp.expectedPriceMax}</p>
          <p className="text-xs text-gray-400">per {opp.unit}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-400 mb-0.5">Buyers</p>
          <p className="text-sm font-bold text-gray-800">{opp.buyerRequirements?.length || 0}</p>
          <p className="text-xs text-gray-400">active</p>
        </div>
      </div>

      {/* Detail row */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-5 pb-4 border-b border-gray-100">
        <span>📅 Required by {deadline}</span>
        <span className="font-medium">{opp.variety ? `Variety: ${opp.variety}` : opp.category}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onListCrop(opp)}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold
                     bg-agri-green text-white hover:bg-agri-dark transition-colors"
        >
          List My Crop
        </button>
        <button
          onClick={() => onPreBook(opp)}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold
                     border-2 border-agri-green text-agri-green hover:bg-agri-light transition-colors"
        >
          Pre-Book
        </button>
      </div>
    </div>
  )
}
