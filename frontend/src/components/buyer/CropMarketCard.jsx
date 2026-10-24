import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShortlist } from '../../context/ShortlistContext.jsx'
import BookingModal from './BookingModal.jsx'

const categoryEmoji = {
  'Vegetables':       '🥦',
  'Fruits':           '🍎',
  'Grains & Cereals': '🌾',
  'Pulses & Legumes': '🫘',
  'Spices & Herbs':   '🌿',
  'Oilseeds':         '🌻',
  'Other':            '🌱',
}

const statusCls = {
  'Pre-Harvest':    'bg-orange-100 text-orange-700',
  'Harvest Ready':  'bg-emerald-100 text-emerald-700',
  'Harvested':      'bg-teal-100 text-teal-700',
  'Booked':         'bg-violet-100 text-violet-700',
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex justify-between items-center py-1 last:pb-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs font-medium ${highlight ? 'text-agri-green font-semibold' : 'text-gray-700'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

export default function CropMarketCard({ crop, compact = false }) {
  const navigate             = useNavigate()
  const { isShortlisted, toggleShortlist } = useShortlist()
  const saved = isShortlisted(crop.id)
  const emoji = categoryEmoji[crop.category] || '🌱'
  const [showBooking, setShowBooking] = useState(false)
  const noStock = !crop.availableQty || crop.availableQty <= 0

  const harvestDate = crop.expectedHarvestDate
    ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'

  return (
    <div className={`card border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col
                     hover:border-agri-green/20 group ${compact ? 'p-4' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">
            {emoji}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{crop.name}</h3>
            <p className="text-xs text-gray-400 truncate">{crop.variety || crop.category}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Shortlist heart button */}
          <button
            onClick={(e) => { e.stopPropagation(); toggleShortlist(crop) }}
            className={`p-2 rounded-xl transition-colors ${
              saved
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400'
            }`}
            aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
            title={saved ? 'Remove from shortlist' : 'Shortlist this crop'}
          >
            <svg className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={saved ? 0 : 2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <span className={`status-badge text-xs ${statusCls[crop.status] || 'bg-gray-100 text-gray-600'}`}>
            {crop.status}
          </span>
        </div>
      </div>

      {/* Info rows */}
      <div className="flex-1 mb-3 space-y-0.5">
        <InfoRow label="Available"    value={`${crop.availableQty?.toLocaleString()} ${crop.unit}`} />
        <InfoRow label="Price"        value={`₹${crop.expectedPrice}/${crop.unit}`} highlight />
        <InfoRow label="Grade"        value={crop.grade} />
        <InfoRow label="Harvest"      value={harvestDate} />
        {crop.shelfLifeDays > 0 && (
          <InfoRow label="Shelf life" value={`${crop.shelfLifeDays} days`} />
        )}
        <InfoRow label="Location"     value={crop.farmLocation} />
      </div>

      {/* Farmer badge */}
      {crop.farmer && (
        <div className="flex items-center justify-between mb-3 bg-gray-50 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 bg-agri-green rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">
                {crop.farmer.name?.charAt(0)?.toUpperCase() || 'F'}
              </span>
            </div>
            <span className="text-xs font-medium text-gray-700 truncate">{crop.farmer.name}</span>
          </div>
          {crop.farmer.verification === 'Verified' ? (
            <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
              <span>✓</span> Verified
            </span>
          ) : (
            <span className="text-xs text-gray-400 flex-shrink-0">Unverified</span>
          )}
        </div>
      )}

      {/* Traceability ready badge */}
      <div className="flex items-center gap-1 text-xs text-agri-muted mb-3">
        <span>🔗</span>
        <span>Traceability Ready</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/buyer/marketplace/crop/${crop.id}`)}
          className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-agri-green text-white
                     hover:bg-agri-dark transition-colors"
        >
          View Details
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            if (!noStock) setShowBooking(true)
          }}
          disabled={noStock}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors
            ${noStock
              ? 'border-dashed border-gray-300 text-gray-400 cursor-not-allowed'
              : 'border-agri-green text-agri-green hover:bg-agri-light'}`}
          title={noStock ? 'No stock available' : 'Book this crop'}
        >
          Book
        </button>
      </div>

      {showBooking && (
        <BookingModal
          crop={crop}
          onSuccess={(booking) => {
            setShowBooking(false)
            navigate(booking?.id ? `/buyer/bookings/${booking.id}` : '/buyer/bookings')
          }}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  )
}
