import React, { useState, useMemo } from 'react'
import { useDemand } from '../../../context/DemandContext.jsx'
import BuyerRequirementRow from '../../../components/demand/BuyerRequirementRow.jsx'
import DemandLevelBadge    from '../../../components/demand/DemandLevelBadge.jsx'
import PageHeader          from '../../../components/ui/PageHeader.jsx'

// ── Detail modal ──────────────────────────────────────────────────────────────
function BuyerDetailModal({ req, onClose }) {
  if (!req) return null
  const deadline = req.deadline
    ? new Date(req.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{req.cropName} Requirement</h3>
            <p className="text-sm text-gray-500 mt-0.5">{req.companyName || req.buyerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Details */}
        <div className="space-y-0 divide-y divide-gray-50">
          {[
            { label: 'Crop',               value: `${req.cropName}${req.variety ? ` · ${req.variety}` : ''}` },
            { label: 'Buyer',              value: req.buyerName },
            { label: 'Company',            value: req.companyName || '—' },
            { label: 'Required Quantity',  value: `${req.requiredQuantity.toLocaleString()} ${req.unit}` },
            { label: 'Quality Grade',      value: req.qualityGrade },
            { label: 'Expected Price',     value: `₹${req.expectedPrice} / ${req.unit}`, highlight: true },
            { label: 'Delivery Location',  value: req.deliveryLocation },
            { label: 'Deadline',           value: deadline },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between py-2.5">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-medium ${highlight ? 'text-agri-green' : 'text-gray-800'}`}>{value}</span>
            </div>
          ))}
        </div>

        {req.notes && (
          <div className="mt-4 bg-gray-50 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-1">Notes</p>
            <p className="text-sm text-gray-700">{req.notes}</p>
          </div>
        )}

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => { alert('Listing crop against this requirement — coming in Bookings & Orders module.'); onClose() }}
            className="flex-1 py-2.5 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors"
          >
            List My Crop
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BuyerRequirements() {
  const { buyerReqs, loading, error } = useDemand()

  const [search,   setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => buyerReqs.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.cropName.toLowerCase().includes(q) ||
      (r.companyName || '').toLowerCase().includes(q) ||
      r.buyerName.toLowerCase().includes(q) ||
      (r.deliveryLocation || '').toLowerCase().includes(q)
    )
  }), [buyerReqs, search])

  return (
    <div>
      <PageHeader
        title="Buyer Requirements"
        subtitle={`${buyerReqs.length} active buyer requirement${buyerReqs.length !== 1 ? 's' : ''} in your region.`}
      />

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search crop, buyer or location…"
          className="input-field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 mb-5">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map((i) => (
            <div key={i} className="card h-14 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🛒</div>
          <p className="font-semibold text-gray-700">No buyer requirements found</p>
          <p className="text-sm text-gray-400 mt-1">
            {search ? 'Try a different search term.' : 'Check back soon — new buyer requirements are added regularly.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Crop', 'Buyer / Company', 'Qty Required', 'Grade', 'Price', 'Location', 'Deadline', 'Demand', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((req) => (
                  <BuyerRequirementRow key={req.id} req={req} onView={setSelected} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <BuyerDetailModal req={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
