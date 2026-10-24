import React, { useState, useMemo } from 'react'
import { useDemand } from '../../../context/DemandContext.jsx'
import DemandCard       from '../../../components/demand/DemandCard.jsx'
import DemandLevelBadge from '../../../components/demand/DemandLevelBadge.jsx'
import PageHeader       from '../../../components/ui/PageHeader.jsx'

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const LEVELS     = ['All', 'High', 'Medium', 'Low']

// ── Skeleton ─────────────────────────────────────────────────────────────────
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
      {[1,2,3,4].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 bg-gray-100 rounded-full w-1/3" />
          <div className="h-3 bg-gray-200 rounded-full w-1/4" />
        </div>
      ))}
    </div>
  )
}

// ── Summary stat ─────────────────────────────────────────────────────────────
function StatPill({ label, value, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
        ${active
          ? 'bg-agri-green text-white shadow-sm'
          : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40 hover:text-agri-green'}`}
    >
      {label} <span className={`font-bold ml-1 ${active ? 'text-white' : 'text-gray-800'}`}>{value}</span>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MarketDemand() {
  const { demands, loading, error } = useDemand()

  const [search,   setSearch]   = useState('')
  const [category, setCategory] = useState('All')
  const [level,    setLevel]    = useState('All')
  const [location, setLocation] = useState('')

  // Derived locations from data
  const locations = useMemo(() => {
    const locs = [...new Set(demands.map((d) => d.location))]
    return ['All', ...locs.sort()]
  }, [demands])

  // Stats
  const highCount   = demands.filter((d) => d.demandLevel === 'High').length
  const mediumCount = demands.filter((d) => d.demandLevel === 'Medium').length
  const lowCount    = demands.filter((d) => d.demandLevel === 'Low').length

  const filtered = useMemo(() => demands.filter((d) => {
    const matchSearch   = !search   || d.cropName.toLowerCase().includes(search.toLowerCase()) || (d.location || '').toLowerCase().includes(search.toLowerCase())
    const matchCategory = category === 'All' || d.category === category
    const matchLevel    = level    === 'All' || d.demandLevel === level
    const matchLocation = !location || location === 'All' || d.location === location
    return matchSearch && matchCategory && matchLevel && matchLocation
  }), [demands, search, category, level, location])

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-8 text-center">
        <p className="text-sm font-semibold text-red-700 mb-1">Failed to load demand data</p>
        <p className="text-xs text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Market Demand"
        subtitle="Current and upcoming crop demand signals across your region."
      />

      {/* Quick filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <StatPill label="All"    value={demands.length} active={level === 'All'}    onClick={() => setLevel('All')} />
        <StatPill label="🔴 High"   value={highCount}   active={level === 'High'}   onClick={() => setLevel('High')} />
        <StatPill label="🟡 Medium" value={mediumCount} active={level === 'Medium'} onClick={() => setLevel('Medium')} />
        <StatPill label="⚪ Low"    value={lowCount}    active={level === 'Low'}    onClick={() => setLevel('Low')} />
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search crop or location…"
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input-field bg-white sm:w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input-field bg-white sm:w-52" value={location} onChange={(e) => setLocation(e.target.value)}>
          {locations.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">📊</div>
          <p className="font-semibold text-gray-700">No demand signals match your filter</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setLevel('All'); setLocation('') }}
            className="mt-4 text-sm text-agri-green font-semibold hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d) => <DemandCard key={d.id} demand={d} />)}
        </div>
      )}
    </div>
  )
}
