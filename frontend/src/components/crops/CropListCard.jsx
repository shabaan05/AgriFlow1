import React from 'react'
import { useNavigate } from 'react-router-dom'
import StatusBadge from '../ui/StatusBadge.jsx'

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

export default function CropListCard({ crop, onDelete }) {
  const navigate = useNavigate()
  const emoji = categoryEmoji[crop.category] || '🌱'

  const availPct = crop.totalQty > 0
    ? Math.round((crop.availableQty / crop.totalQty) * 100)
    : 0

  const harvestDate = crop.expectedHarvestDate
    ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  return (
    <div className="card flex flex-col gap-0 hover:shadow-md transition-shadow duration-200 p-0 overflow-hidden">
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
              {crop.name}
            </h3>
            <p className="text-xs text-gray-400 truncate">{crop.variety || crop.category}</p>
          </div>
        </div>
        <StatusBadge label={crop.status} />
      </div>

      {/* Info rows */}
      <div className="px-5 pb-3">
        <InfoRow label="Total Qty"     value={`${crop.totalQty} ${crop.unit}`} />
        <InfoRow label="Available"     value={`${crop.availableQty} ${crop.unit}`} />
        <InfoRow label="Harvest Date"  value={harvestDate} />
        <InfoRow label="Price / unit"  value={`₹${crop.expectedPrice}/${crop.unit}`} highlight />
        <InfoRow label="Grade"         value={crop.grade} />
      </div>

      {/* Availability bar */}
      <div className="px-5 pb-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Availability</span>
          <span>{availPct}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-agri-green rounded-full transition-all duration-500"
            style={{ width: `${availPct}%` }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-2">
        <button
          onClick={() => navigate(`/farmer/crops/${crop.id}`)}
          className="flex-1 text-xs font-semibold text-agri-green bg-agri-light
                     py-2 rounded-lg hover:bg-green-100 transition-colors"
        >
          View Details
        </button>
        <button
          onClick={() => navigate(`/farmer/crops/${crop.id}/edit`)}
          className="flex-1 text-xs font-semibold text-gray-600 bg-gray-50
                     py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(crop.id)}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Delete crop"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
