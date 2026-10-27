/**
 * RouteOptimization.jsx
 *
 * Route Optimization — /transporter/routes
 *
 * Allows a transporter to:
 *   1. Load all PENDING pickup requests
 *   2. Select requests to include in a route plan
 *   3. Enter vehicle capacity
 *   4. Optimize → view sequenced stops, KPIs, and per-stop details
 *   5. Navigate to individual pickup/trip pages
 *
 * Uses POST /api/transporter/routes/optimize (no ML, deterministic scoring).
 */
import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchPickupRequests, optimizeRoute, fetchVehicleInfo } from '../../../services/transporterApi.js'
import PageHeader from '../../../components/ui/PageHeader.jsx'

// ── Constants ─────────────────────────────────────────────────────────────────
const URGENCY_META = {
  HIGH:   { label: 'Urgent',  bg: 'bg-red-100',   text: 'text-red-700'   },
  MEDIUM: { label: 'Soon',    bg: 'bg-amber-100',  text: 'text-amber-700' },
  NORMAL: { label: 'Normal',  bg: 'bg-gray-100',   text: 'text-gray-600'  },
}

// ── Small reusable components ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-extrabold ${accent ? 'text-agri-green' : 'text-gray-900'}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
  )
}

// ── Pickup request selection card ─────────────────────────────────────────────
function RequestSelectCard({ req, selected, onToggle, disabled }) {
  const pickupDateStr = req.pickupDate
    ? new Date(req.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : '—'
  const urgMeta = URGENCY_META[req.urgency] || URGENCY_META.NORMAL

  // Derive urgency from pickupDate client-side for display (backend does authoritative calc)
  const urgency = (() => {
    if (!req.pickupDate) return 'NORMAL'
    const days = (new Date(req.pickupDate) - Date.now()) / (1000 * 60 * 60 * 24)
    if (days <= 1) return 'HIGH'
    if (days <= 3) return 'MEDIUM'
    return 'NORMAL'
  })()
  const displayMeta = URGENCY_META[urgency] || URGENCY_META.NORMAL

  return (
    <div
      className={`card border-2 transition-all duration-200 cursor-pointer select-none
        ${selected
          ? 'border-agri-green bg-agri-light/20 shadow-md'
          : disabled
            ? 'border-gray-100 opacity-60 cursor-not-allowed'
            : 'border-gray-100 hover:border-agri-green/40 hover:shadow'
        }`}
      onClick={() => !disabled && onToggle(req.id)}
      role="checkbox"
      aria-checked={selected}
      tabIndex={0}
      onKeyDown={(e) => !disabled && (e.key === ' ' || e.key === 'Enter') && onToggle(req.id)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox indicator */}
        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors
          ${selected ? 'bg-agri-green border-agri-green' : 'border-gray-300'}`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">{req.cropName}</h3>
              <p className="text-xs text-gray-400">{req.quantity} {req.unit}{req.variety ? ` · ${req.variety}` : ''}</p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${displayMeta.bg} ${displayMeta.text}`}>
                {displayMeta.label}
              </span>
            </div>
          </div>

          {/* Route */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-agri-green" />
              <span className="w-px h-3 bg-gray-300" />
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
            </div>
            <div className="flex-1 space-y-1 min-w-0">
              <p className="text-gray-600 truncate">{req.pickupLocation || 'Pickup TBD'}</p>
              <p className="text-gray-600 truncate">{req.deliveryLocation || 'Delivery TBD'}</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>📍 {req.estimatedDistanceKm} km</span>
            <span>🗓 {pickupDateStr}</span>
            <span className="text-agri-green font-semibold ml-auto">₹{req.estimatedEarnings?.toLocaleString()}</span>
          </div>

          {req.farmerName && (
            <p className="text-[10px] text-gray-400 mt-1.5">Farmer: {req.farmerName}</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Route stop item ───────────────────────────────────────────────────────────
function StopItem({ stop, index }) {
  const isPickup   = stop.type === 'PICKUP'
  const isLast     = false  // passed from parent if needed
  const urgMeta    = isPickup ? (URGENCY_META[stop.urgency] || URGENCY_META.NORMAL) : null
  const pickupDate = stop.pickupDate
    ? new Date(stop.pickupDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null

  return (
    <div className="flex gap-4">
      {/* Timeline connector */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold
          ${isPickup ? 'bg-agri-green' : 'bg-orange-400'}`}>
          {stop.stopNumber}
        </div>
        <div className="w-0.5 flex-1 bg-gray-200 mt-1 min-h-[24px]" />
      </div>

      {/* Content */}
      <div className={`flex-1 pb-4 rounded-2xl mb-1 p-3 border
        ${isPickup ? 'bg-agri-light/30 border-agri-green/20' : 'bg-orange-50/50 border-orange-200/40'}`}>
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full
                ${isPickup ? 'bg-agri-green text-white' : 'bg-orange-400 text-white'}`}>
                {isPickup ? '🚜 Pickup' : '📦 Delivery'}
              </span>
              {isPickup && urgMeta && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${urgMeta.bg} ${urgMeta.text}`}>
                  {urgMeta.label}
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {isPickup ? stop.cropName : `Deliver: ${stop.cropName}`}
            </p>
            <p className="text-xs text-gray-500">{stop.location}</p>
          </div>
          {isPickup ? (
            <div className="text-right text-xs">
              <p className="font-semibold text-gray-700">{stop.quantity} {stop.unit}</p>
              {pickupDate && <p className="text-gray-400">{pickupDate}</p>}
            </div>
          ) : (
            <div className="text-right text-xs">
              {stop.distanceFromPrev > 0 && (
                <p className="font-semibold text-gray-700">{stop.distanceFromPrev} km leg</p>
              )}
              {stop.estimatedEarnings > 0 && (
                <p className="text-agri-green font-bold">+₹{stop.estimatedEarnings?.toLocaleString()}</p>
              )}
            </div>
          )}
        </div>

        {/* Cumulative stats */}
        <div className="flex gap-4 mt-2 text-[10px] text-gray-400">
          {isPickup && stop.cumulativeLoadKg > 0 && (
            <span>Load so far: {stop.cumulativeLoadKg} kg</span>
          )}
          {!isPickup && stop.cumulativeDistanceKm > 0 && (
            <span>Cumulative dist: {stop.cumulativeDistanceKm} km</span>
          )}
          {isPickup && stop.farmerName && (
            <span>Farmer: {stop.farmerName}</span>
          )}
          {!isPickup && stop.buyerName && (
            <span>Buyer: {stop.buyerName}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function RouteOptimization() {
  const navigate = useNavigate()

  // ── Data state ────────────────────────────────────────────────────────────
  const [allRequests, setAllRequests]   = useState([])
  const [loadingReqs, setLoadingReqs]   = useState(true)
  const [reqError,    setReqError]      = useState('')

  // Vehicle capacity (from profile or manually entered)
  const [capacityKg,  setCapacityKg]    = useState('')
  const [capacityRaw, setCapacityRaw]   = useState('') // raw string from profile

  // Selection
  const [selectedIds, setSelectedIds]   = useState(new Set())

  // Optimization result
  const [optimizing,  setOptimizing]    = useState(false)
  const [result,      setResult]        = useState(null)
  const [optError,    setOptError]      = useState('')

  // ── Load PENDING pickup requests + vehicle info ───────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoadingReqs(true)

    Promise.all([
      fetchPickupRequests().catch(() => []),
      fetchVehicleInfo().catch(() => null),
    ]).then(([reqs, vehicle]) => {
      if (cancelled) return
      const pending = (reqs || []).filter(r => r.status === 'PENDING')
      setAllRequests(pending)

      // Pre-fill capacity from vehicle profile
      if (vehicle?.capacity) {
        const parsed = parseFloat(vehicle.capacity)
        setCapacityRaw(vehicle.capacity)
        if (!isNaN(parsed) && parsed > 0) setCapacityKg(String(Math.round(parsed)))
      }
      setLoadingReqs(false)
    }).catch((err) => {
      if (!cancelled) { setReqError(err.message || 'Failed to load requests'); setLoadingReqs(false) }
    })

    return () => { cancelled = true }
  }, [])

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setResult(null) // clear previous result when selection changes
    setOptError('')
  }

  const selectAll = () => {
    setSelectedIds(new Set(allRequests.map(r => r.id)))
    setResult(null)
  }
  const clearAll  = () => { setSelectedIds(new Set()); setResult(null) }

  const selectedRequests = useMemo(
    () => allRequests.filter(r => selectedIds.has(r.id)),
    [allRequests, selectedIds]
  )

  const totalSelectedKg  = useMemo(
    () => selectedRequests.reduce((s, r) => s + (r.quantity || 0), 0),
    [selectedRequests]
  )

  const capNum = parseFloat(capacityKg) || 0
  const overCapacity = capNum > 0 && totalSelectedKg > capNum

  // ── Optimize ──────────────────────────────────────────────────────────────
  async function handleOptimize() {
    if (selectedIds.size === 0) return
    setOptimizing(true)
    setOptError('')
    setResult(null)

    try {
      const data = await optimizeRoute({
        pickupRequestIds: [...selectedIds],
        vehicleCapacity:  capNum || 1000,
      })
      setResult(data)
    } catch (err) {
      setOptError(err.message || 'Optimization failed. Please try again.')
    } finally {
      setOptimizing(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Route Optimization"
        subtitle="Select pickup requests, set your vehicle capacity, and generate an optimized delivery sequence."
      />

      {/* ── Load error ─────────────────────────────────────────────────── */}
      {reqError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{reqError}</span>
          <button
            onClick={() => { setReqError(''); setLoadingReqs(true); fetchPickupRequests().then(d => setAllRequests(d.filter(r => r.status === 'PENDING'))).catch(e => setReqError(e.message)).finally(() => setLoadingReqs(false)) }}
            className="font-semibold hover:underline ml-4"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr,400px] gap-6 items-start">
        {/* ── LEFT: Available requests ────────────────────────────────────── */}
        <div>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">
                Available Pickup Requests
                {!loadingReqs && (
                  <span className="ml-2 text-agri-green font-bold">{allRequests.length}</span>
                )}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Only PENDING requests can be included in a route plan
              </p>
            </div>
            {allRequests.length > 0 && !loadingReqs && (
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs px-3 py-1.5 rounded-xl border border-agri-green text-agri-green font-medium hover:bg-agri-light transition-colors"
                >
                  Select All
                </button>
                <button
                  onClick={clearAll}
                  className="text-xs px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Cards */}
          {loadingReqs ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : allRequests.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-3">🚛</div>
              <p className="text-sm font-semibold text-gray-700">No pending pickup requests</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs">
                Pickup requests appear here when a Farmer marks an order as "Ready for Pickup".
              </p>
              <button
                onClick={() => navigate('/transporter/pickups')}
                className="btn-outline text-xs px-5 mt-4"
              >
                View All Requests
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {allRequests.map(req => (
                <RequestSelectCard
                  key={req.id}
                  req={req}
                  selected={selectedIds.has(req.id)}
                  onToggle={toggleSelect}
                  disabled={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Config + result panel ─────────────────────────────────── */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {/* Config card */}
          <div className="card">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
              Route Configuration
            </h2>

            {/* Capacity input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vehicle Capacity (kg)
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                placeholder={capacityRaw ? `From profile: ${capacityRaw}` : 'e.g. 1000'}
                value={capacityKg}
                onChange={e => setCapacityKg(e.target.value)}
              />
              {capacityRaw && !capacityKg && (
                <p className="text-xs text-gray-400 mt-1">Profile: {capacityRaw} (enter kg value above)</p>
              )}
            </div>

            {/* Selection summary */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Selected requests</span>
                <span className="font-bold text-gray-900">{selectedIds.size}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Total load</span>
                <span className={`font-bold ${overCapacity ? 'text-red-600' : 'text-gray-900'}`}>
                  {totalSelectedKg} kg
                </span>
              </div>
              {capNum > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Capacity</span>
                  <span className="font-bold text-gray-900">{capNum} kg</span>
                </div>
              )}
              {/* Capacity bar */}
              {capNum > 0 && totalSelectedKg > 0 && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${overCapacity ? 'bg-red-500' : 'bg-agri-green'}`}
                      style={{ width: `${Math.min(100, (totalSelectedKg / capNum) * 100)}%` }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${overCapacity ? 'text-red-600 font-semibold' : 'text-gray-400'}`}>
                    {overCapacity
                      ? `⚠ Exceeds capacity by ${totalSelectedKg - capNum} kg`
                      : `${Math.round((totalSelectedKg / capNum) * 100)}% of capacity used`
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Optimize button */}
            <button
              onClick={handleOptimize}
              disabled={selectedIds.size === 0 || optimizing}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {optimizing ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Optimizing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {selectedIds.size === 0 ? 'Select requests to optimize' : `Optimize ${selectedIds.size} Request${selectedIds.size > 1 ? 's' : ''}`}
                </>
              )}
            </button>

            {selectedIds.size === 0 && (
              <p className="text-xs text-center text-gray-400 mt-2">
                Select pickup requests from the list to enable optimization
              </p>
            )}
          </div>

          {/* Optimization error */}
          {optError && (
            <div className="card border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">Optimization failed</p>
              <p className="text-sm text-red-600 mt-1">{optError}</p>
              <button
                onClick={() => setOptError('')}
                className="mt-2 text-xs text-red-700 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Result */}
          {result && result.success && (
            <>
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Total Distance" value={`${result.totalDistanceKm} km`} />
                <KpiCard label="Est. Duration"  value={`~${Math.round(result.estimatedDurationMinutes / 60 * 10) / 10} hrs`} />
                <KpiCard label="Total Load"     value={`${result.totalLoadKg} kg`} sub={result.overCapacity ? '⚠ Over capacity' : `of ${result.vehicleCapacity} kg`} />
                <KpiCard label="Est. Earnings"  value={`₹${result.totalEarnings?.toLocaleString()}`} accent />
              </div>

              {/* Capacity warning */}
              {result.overCapacity && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-xl flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>
                    Total load ({result.totalLoadKg} kg) exceeds your vehicle capacity ({result.vehicleCapacity} kg).
                    Consider removing lower-priority requests.
                  </span>
                </div>
              )}

              {/* Priority explanation */}
              {result.priorityReason && (
                <div className="card border-l-4 border-l-agri-green bg-agri-light/20">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Optimization Logic</p>
                  <p className="text-sm text-gray-600">{result.priorityReason}</p>
                  {result.optimizationSummary && (
                    <p className="text-xs text-gray-500 mt-2">{result.optimizationSummary}</p>
                  )}
                </div>
              )}

              {/* Stop sequence */}
              <div className="card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Optimized Stop Sequence
                  </h3>
                  <span className="text-xs text-gray-400">{result.stopCount} stops</span>
                </div>

                <div className="space-y-0">
                  {result.stops.map((stop, i) => (
                    <StopItem key={`${stop.requestId}-${stop.type}`} stop={stop} index={i} />
                  ))}
                  {/* End marker */}
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1 pb-2 pt-1.5">
                      <p className="text-xs text-gray-400 font-medium">Route complete</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejected requests (if any) */}
              {result.rejected?.length > 0 && (
                <div className="card border border-amber-100 bg-amber-50">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-2">
                    Excluded from plan ({result.rejected.length})
                  </p>
                  <ul className="space-y-1">
                    {result.rejected.map((r, i) => (
                      <li key={r.id || i} className="text-xs text-amber-700">• {r.reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate('/transporter/pickups')}
                  className="btn-primary w-full text-sm py-3 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Accept Requests &amp; Start Trips →
                </button>
                <button
                  onClick={() => navigate('/transporter/trips')}
                  className="btn-outline w-full text-sm py-3"
                >
                  View My Active Trips
                </button>
                <button
                  onClick={() => { setResult(null); setOptError(''); setSelectedIds(new Set()) }}
                  className="text-xs text-center text-gray-400 hover:text-agri-green underline transition-colors"
                >
                  Reset &amp; Plan Again
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
