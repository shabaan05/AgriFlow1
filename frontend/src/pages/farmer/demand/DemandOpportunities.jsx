import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDemand }     from '../../../context/DemandContext.jsx'
import OpportunityCard   from '../../../components/demand/OpportunityCard.jsx'
import PageHeader        from '../../../components/ui/PageHeader.jsx'

// ── Toast-style action feedback ───────────────────────────────────────────────
function ActionToast({ message, onClose }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium
                    px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm w-full mx-4">
      <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function DemandOpportunities() {
  const navigate = useNavigate()
  const { opportunities, loading, error } = useDemand()

  const [toast, setToast] = useState('')

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  function handleListCrop(opp) {
    // Navigate to Add Crop pre-filled with crop name — full linking in Bookings module
    showToast(`Navigating to Add Crop for ${opp.cropName}…`)
    setTimeout(() => navigate('/farmer/crops/add'), 1200)
  }

  function handlePreBook(opp) {
    // Placeholder — Pre-booking logic lives in Bookings & Orders module
    showToast(`Pre-booking for ${opp.cropName} in ${opp.location} — Bookings module coming next.`)
  }

  return (
    <div>
      <PageHeader
        title="Demand Opportunities"
        subtitle="High-demand signals where your crops can get the best price right now."
      />

      {/* Banner */}
      <div className="bg-gradient-to-r from-agri-dark to-agri-green rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">💡</div>
        <div>
          <p className="text-white font-semibold text-sm">Act on demand signals before they expire</p>
          <p className="text-green-100 text-xs mt-0.5">
            List your crop or pre-book directly against an active buyer requirement to lock in a better price.
            Pre-booking automation will be handled by the AI Harvest & Booking Agent in a future release.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : opportunities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">💡</div>
          <p className="font-semibold text-gray-700">No high-demand opportunities right now</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Check back soon — demand opportunities update regularly based on buyer activity.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              onListCrop={handleListCrop}
              onPreBook={handlePreBook}
            />
          ))}
        </div>
      )}

      <ActionToast message={toast} onClose={() => setToast('')} />
    </div>
  )
}
