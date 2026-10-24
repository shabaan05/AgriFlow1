import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useCrops }  from '../../../context/CropsContext.jsx'
import StatusBadge   from '../../../components/ui/StatusBadge.jsx'
import { useAuth }   from '../../../hooks/useAuth.jsx'
import * as api      from '../../../services/cropApi.js'

// ── Sub-components (unchanged from Phase 1) ───────────────────────────────────
function Section({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Row({ label, value, highlight, large }) {
  return (
    <div className="flex justify-between items-start py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm text-right font-medium
        ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}
        ${large ? 'text-base' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}

const STATUS_ORDER = ['Pre-Harvest', 'Harvest Ready', 'Harvested', 'Booked', 'Pickup Scheduled', 'Delivered']

function StatusTimeline({ current }) {
  const currentIdx = STATUS_ORDER.indexOf(current)
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
        Crop Journey
      </h3>
      <div className="flex items-center gap-0 overflow-x-auto pb-1">
        {STATUS_ORDER.map((status, i) => {
          const done   = i < currentIdx
          const active = i === currentIdx
          return (
            <React.Fragment key={status}>
              <div className="flex flex-col items-center min-w-[80px]">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${active ? 'bg-agri-green text-white ring-4 ring-agri-green/20' : ''}
                  ${done   ? 'bg-green-200 text-green-800'                        : ''}
                  ${!active && !done ? 'bg-gray-100 text-gray-400'                : ''}`}
                >
                  {done ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (i + 1)}
                </div>
                <p className={`text-[10px] font-medium mt-1.5 text-center leading-tight
                  ${active ? 'text-agri-green' : done ? 'text-green-700' : 'text-gray-400'}`}
                  style={{ maxWidth: 72 }}
                >
                  {status}
                </p>
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 rounded-full flex-shrink-0
                  ${i < currentIdx ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CropDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()
  const { getCropById, deleteCrop } = useCrops()
  const { user }     = useAuth()

  // Seed from context immediately; fetch fresh copy from API
  const [crop,     setCrop]     = useState(() => getCropById(id) || null)
  const [fetching, setFetching] = useState(true)
  const [fetchErr, setFetchErr] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    setFetching(true)
    api.fetchCropById(id)
      .then((data) => { setCrop(data); setFetching(false) })
      .catch((err) => { setFetchErr(err.message); setFetching(false) })
  }, [id])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (fetching && !crop) {
    return (
      <div className="max-w-3xl animate-pulse space-y-5">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        {[1,2,3,4].map((i) => <div key={i} className="card h-32" />)}
      </div>
    )
  }

  // ── Not found ─────────────────────────────────────────────────────────────
  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
        <p className="font-semibold text-gray-700 text-lg">Crop not found</p>
        <p className="text-sm text-gray-400 mt-1">{fetchErr || 'This crop may have been deleted.'}</p>
        <button onClick={() => navigate('/farmer/crops')} className="btn-primary mt-5 text-sm px-6">
          Back to My Crops
        </button>
      </div>
    )
  }

  const harvestDate = crop.expectedHarvestDate
    ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
      })
    : '—'

  const createdDate = crop.createdAt
    ? new Date(crop.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      })
    : '—'

  const availPct = crop.totalQty > 0
    ? Math.round((crop.availableQty / crop.totalQty) * 100)
    : 0

  async function handleDelete() {
    if (!window.confirm(`Delete "${crop.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await deleteCrop(id)
      navigate('/farmer/crops')
    } catch (err) {
      alert(err.message || 'Failed to delete. Please try again.')
      setDeleting(false)
    }
  }

  const showSuccessBanner = location.state?.fromAdd || location.state?.fromEdit

  return (
    <div className="max-w-3xl">
      {/* Success banner */}
      {showSuccessBanner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium
                        px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {location.state?.fromAdd ? 'Crop added successfully.' : 'Crop updated successfully.'}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button
            onClick={() => navigate('/farmer/crops')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            My Crops
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {crop.name}
            <StatusBadge label={crop.status} />
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{crop.variety || crop.category} · Listed {createdDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/farmer/crops/${id}/edit`)}
            className="btn-outline text-sm px-5"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50
                       hover:bg-red-100 transition-colors border border-red-200
                       disabled:opacity-50 flex items-center gap-1.5"
          >
            {deleting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Deleting…
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>

      <StatusTimeline current={crop.status} />

      {/* Quantity */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
          Quantity & Availability
        </h3>
        <div className="flex gap-6 mb-4 flex-wrap">
          {[
            { label: 'Total',     value: crop.totalQty,                    cls: 'text-gray-900' },
            { label: 'Available', value: crop.availableQty,                cls: 'text-agri-green' },
            { label: 'Booked',    value: crop.totalQty - crop.availableQty, cls: 'text-gray-600' },
          ].map(({ label, value, cls }) => (
            <div key={label}>
              <p className="text-xs text-gray-400">{label}</p>
              <p className={`text-2xl font-bold ${cls}`}>
                {value}{' '}
                <span className="text-base font-medium text-gray-400">{crop.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Availability</span>
          <span>{availPct}% remaining</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-agri-green rounded-full transition-all duration-700"
            style={{ width: `${availPct}%` }}
          />
        </div>
      </div>

      <Section title="Crop Information">
        <Row label="Name"          value={crop.name} />
        <Row label="Variety"       value={crop.variety} />
        <Row label="Category"      value={crop.category} />
        <Row label="Quality Grade" value={crop.grade} />
      </Section>

      <Section title="Harvest & Shelf Life">
        <Row label="Expected Harvest Date" value={harvestDate} />
        <Row label="Shelf Life"            value={crop.shelfLifeDays ? `${crop.shelfLifeDays} days` : '—'} />
      </Section>

      <Section title="Pricing">
        <Row label="Expected Price"           value={`₹${crop.expectedPrice} / ${crop.unit}`} highlight large />
        <Row label="Minimum Acceptable Price" value={crop.minPrice ? `₹${crop.minPrice} / ${crop.unit}` : '—'} />
      </Section>

      <Section title="Farm Information">
        <Row label="Farm Location" value={crop.farmLocation} />
        <Row label="Farmer"        value={user?.name || '—'} />
        <Row label="Contact"       value={user?.mobile || '—'} />
      </Section>

      {crop.notes && (
        <Section title="Notes">
          <p className="text-sm text-gray-700 leading-relaxed">{crop.notes}</p>
        </Section>
      )}

      <Section title="Images">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
          <p className="text-sm text-gray-400">
            No images uploaded. Image upload feature coming in the next module.
          </p>
        </div>
      </Section>
    </div>
  )
}
