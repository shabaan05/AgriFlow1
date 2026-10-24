import React, { useState, useEffect, useMemo } from 'react'
import { fetchMarketplaceCrops } from '../../../services/marketplaceApi.js'
import { ShortlistProvider }     from '../../../context/ShortlistContext.jsx'
import CropMarketCard            from '../../../components/buyer/CropMarketCard.jsx'
import PageHeader                from '../../../components/ui/PageHeader.jsx'

const CATEGORIES  = ['All', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const GRADES      = ['All', 'Grade A', 'Grade B', 'Grade C']
const STATUSES    = ['All', 'Pre-Harvest', 'Harvest Ready', 'Harvested', 'Booked']

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3 p-5">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      {[1,2,3,4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  )
}

function FilterBar({ filters, setFilters, locations, onClear }) {
  const hasActive = filters.search || filters.category !== 'All' || filters.grade !== 'All' ||
                    filters.status !== 'All' || filters.location !== 'All' ||
                    filters.minPrice || filters.maxPrice

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
             fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search crop name, variety or farmer…"
          className="input-field pl-9"
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Row 2 — dropdowns */}
      <div className="flex flex-wrap gap-3">
        <select className="input-field bg-white flex-1 min-w-[130px]"
          value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select className="input-field bg-white flex-1 min-w-[120px]"
          value={filters.grade} onChange={(e) => setFilters({ ...filters, grade: e.target.value })}>
          {GRADES.map((g) => <option key={g}>{g}</option>)}
        </select>

        <select className="input-field bg-white flex-1 min-w-[140px]"
          value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select className="input-field bg-white flex-1 min-w-[160px]"
          value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })}>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>

        {/* Price range */}
        <input type="number" placeholder="Min ₹" min={0}
          className="input-field w-24"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
        <input type="number" placeholder="Max ₹" min={0}
          className="input-field w-24"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
      </div>

      {/* Clear */}
      {hasActive && (
        <div className="flex justify-end">
          <button onClick={onClear} className="text-sm text-agri-green font-semibold hover:underline">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}

function BrowseContent() {
  const [crops,   setCrops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const EMPTY_FILTERS = { search: '', category: 'All', grade: 'All', status: 'All', location: 'All', minPrice: '', maxPrice: '' }
  const [filters, setFilters] = useState(EMPTY_FILTERS)

  useEffect(() => {
    setLoading(true)
    fetchMarketplaceCrops()
      .then(setCrops)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const locations = useMemo(() => {
    const locs = [...new Set(crops.map((c) => c.farmLocation).filter(Boolean))]
    return ['All', ...locs.sort()]
  }, [crops])

  const filtered = useMemo(() => crops.filter((c) => {
    const q = filters.search.toLowerCase()
    if (q && !c.name.toLowerCase().includes(q) &&
             !((c.variety || '').toLowerCase().includes(q)) &&
             !((c.farmer?.name || '').toLowerCase().includes(q))) return false
    if (filters.category !== 'All' && c.category !== filters.category) return false
    if (filters.grade    !== 'All' && c.grade !== filters.grade) return false
    if (filters.status   !== 'All' && c.status !== filters.status) return false
    if (filters.location !== 'All' && c.farmLocation !== filters.location) return false
    if (filters.minPrice && c.expectedPrice < Number(filters.minPrice)) return false
    if (filters.maxPrice && c.expectedPrice > Number(filters.maxPrice)) return false
    return true
  }), [crops, filters])

  return (
    <div>
      <PageHeader
        title="Browse Crops"
        subtitle={loading ? 'Loading available crops…' : `${filtered.length} crop${filtered.length !== 1 ? 's' : ''} available`}
      />

      {/* USP strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { icon: '🌾', label: 'Direct Farmer Supply' },
          { icon: '📊', label: 'Quality Transparency' },
          { icon: '🕐', label: 'Freshness Visibility' },
          { icon: '🔗', label: 'Traceability Ready' },
        ].map((b) => (
          <div key={b.label} className="bg-agri-light rounded-xl px-3 py-2.5 flex items-center gap-2">
            <span className="text-lg">{b.icon}</span>
            <span className="text-xs font-medium text-agri-green">{b.label}</span>
          </div>
        ))}
      </div>

      <FilterBar
        filters={filters}
        setFilters={setFilters}
        locations={locations}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-4 rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => { setError(''); setLoading(true); fetchMarketplaceCrops().then(setCrops).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
            className="font-semibold hover:underline ml-4"
          >
            Retry
          </button>
        </div>
      ) : loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
          <p className="font-semibold text-gray-700">No crops match your criteria</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search term.</p>
          <button onClick={() => setFilters(EMPTY_FILTERS)}
            className="mt-4 text-sm text-agri-green font-semibold hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((crop) => <CropMarketCard key={crop.id} crop={crop} />)}
        </div>
      )}
    </div>
  )
}

export default function MarketplaceBrowse() {
  return (
    <ShortlistProvider>
      <BrowseContent />
    </ShortlistProvider>
  )
}
