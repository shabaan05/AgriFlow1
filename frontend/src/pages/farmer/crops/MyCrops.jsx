import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCrops } from '../../../context/CropsContext.jsx'
import CropListCard from '../../../components/crops/CropListCard.jsx'
import PageHeader   from '../../../components/ui/PageHeader.jsx'
import { CROP_STATUSES } from '../../../data/cropData.js'

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  const colors = {
    green:  'bg-green-50  text-agri-green',
    orange: 'bg-orange-50 text-orange-700',
    blue:   'bg-blue-50   text-blue-700',
    gray:   'bg-gray-50   text-gray-600',
  }
  return (
    <div className={`rounded-2xl px-5 py-4 ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
    </div>
  )
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="card animate-pulse p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
          <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        </div>
      </div>
      <div className="space-y-2 pt-2">
        {[1,2,3,4].map((i) => (
          <div key={i} className="flex justify-between">
            <div className="h-3 bg-gray-100 rounded-full w-1/3" />
            <div className="h-3 bg-gray-200 rounded-full w-1/4" />
          </div>
        ))}
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full mt-2" />
    </div>
  )
}

// ── Delete modal ─────────────────────────────────────────────────────────────
function DeleteModal({ crop, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h3 className="font-bold text-gray-900 text-lg">Delete Crop?</h3>
        <p className="text-sm text-gray-500 mt-1">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-gray-800">{crop?.name}</span>?
          This cannot be undone.
        </p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                       text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold
                       hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Deleting…
              </>
            ) : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ hasFilter, onClear, onAdd }) {
  if (hasFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
        <p className="font-semibold text-gray-700">No crops match your filter</p>
        <p className="text-sm text-gray-400 mt-1">Try a different status or clear your search.</p>
        <button onClick={onClear} className="mt-4 text-sm text-agri-green font-semibold hover:underline">
          Clear filters
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🌾</div>
      <p className="font-semibold text-gray-700">No crops listed yet</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">
        Add your first crop to start connecting with buyers and managing your harvest.
      </p>
      <button onClick={onAdd} className="btn-primary mt-5 text-sm px-6">
        Add Your First Crop
      </button>
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-red-700 font-medium">{message}</p>
      </div>
      <button onClick={onRetry} className="text-sm font-semibold text-red-600 hover:underline flex-shrink-0">
        Retry
      </button>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MyCrops() {
  const navigate = useNavigate()
  const { crops, loading, error, fetchCrops, deleteCrop } = useCrops()

  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const total        = crops.length
  const preHarvest   = crops.filter((c) => c.status === 'Pre-Harvest').length
  const harvestReady = crops.filter((c) => c.status === 'Harvest Ready').length
  const active       = crops.filter((c) => c.status !== 'Delivered').length

  const filtered = useMemo(() => crops.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.variety || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.farmLocation || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || c.status === statusFilter
    return matchSearch && matchStatus
  }), [crops, search, statusFilter])

  const hasFilter = search.trim() !== '' || statusFilter !== 'All'

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCrop(deleteTarget.id)
      setDeleteTarget(null)
    } catch {
      // error already stored in context
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Crops"
        subtitle={loading ? 'Loading…' : `${total} crop${total !== 1 ? 's' : ''} listed`}
        action={
          <button
            onClick={() => navigate('/farmer/crops/add')}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Crop
          </button>
        }
      />

      {error && <ErrorBanner message={error} onRetry={fetchCrops} />}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Crops"   value={loading ? '—' : total}        color="gray"   />
        <StatCard label="Pre-Harvest"   value={loading ? '—' : preHarvest}   color="orange" />
        <StatCard label="Harvest Ready" value={loading ? '—' : harvestReady} color="green"  />
        <StatCard label="Active"        value={loading ? '—' : active}       color="blue"   />
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by crop name, variety or location…"
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field bg-white sm:w-48 flex-shrink-0"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {CROP_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Loading skeletons */}
      {loading && crops.length === 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasFilter={hasFilter}
          onClear={() => { setSearch(''); setStatusFilter('All') }}
          onAdd={() => navigate('/farmer/crops/add')}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((crop) => (
            <CropListCard
              key={crop.id}
              crop={crop}
              onDelete={(id) => setDeleteTarget(crops.find((c) => c.id === id))}
            />
          ))}
        </div>
      )}

      {deleteTarget && (
        <DeleteModal
          crop={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => !deleting && setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
