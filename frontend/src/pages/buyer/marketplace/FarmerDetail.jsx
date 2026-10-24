import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }   from 'react-router-dom'
import { fetchFarmerProfile }       from '../../../services/marketplaceApi.js'
import { ShortlistProvider }        from '../../../context/ShortlistContext.jsx'
import CropMarketCard               from '../../../components/buyer/CropMarketCard.jsx'
import PageHeader                   from '../../../components/ui/PageHeader.jsx'

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
    </div>
  )
}

function FarmerDetailContent() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchFarmerProfile(id)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-40" />
        {[1,2,3].map((i) => <div key={i} className="card h-24" />)}
      </div>
    )
  }

  if (!data || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Farmer not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/marketplace')} className="btn-primary mt-4 text-sm px-6">
          Back to Marketplace
        </button>
      </div>
    )
  }

  const { farmer, crops } = data
  const memberSince = farmer.memberSince
    ? new Date(farmer.memberSince).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div>
      <button onClick={() => navigate('/buyer/marketplace')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Marketplace
      </button>

      {/* Farmer card */}
      <div className="card mb-6 flex items-start gap-5 flex-wrap">
        <div className="w-16 h-16 bg-agri-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {farmer.name?.charAt(0)?.toUpperCase() || 'F'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-bold text-gray-900">{farmer.name}</h1>
            {farmer.verification === 'Verified' ? (
              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">✓ Verified Farmer</span>
            ) : (
              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">Unverified</span>
            )}
          </div>
          <p className="text-sm text-gray-500">{farmer.farmName || 'Farm'} · {farmer.farmLocation}</p>
          <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
        </div>
      </div>

      {/* Farm details */}
      <div className="card mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
          Farm Information
        </h3>
        <Row label="Farm Name"      value={farmer.farmName} />
        <Row label="Location"       value={farmer.farmLocation} />
        <Row label="Farm Size"      value={farmer.farmSize} />
        <Row label="Farming Type"   value={farmer.farmingType} />
        <Row label="Verification"   value={farmer.verification} />
        {farmer.mainCrops?.length > 0 && (
          <div className="flex justify-between py-2.5 gap-4">
            <span className="text-sm text-gray-500 flex-shrink-0">Main Crops</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {farmer.mainCrops.map((c) => (
                <span key={c} className="text-xs bg-agri-light text-agri-green px-2 py-0.5 rounded-full font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}
        {farmer.description && (
          <div className="pt-3">
            <p className="text-xs text-gray-400 mb-1">About</p>
            <p className="text-sm text-gray-700 leading-relaxed">{farmer.description}</p>
          </div>
        )}
      </div>

      {/* Available crops */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">
          Available Crops <span className="text-gray-400 font-normal text-sm">({crops.length})</span>
        </h2>
        {crops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-3">🌾</div>
            <p className="text-sm text-gray-500">No crops currently available from this farmer.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {crops.map((crop) => <CropMarketCard key={crop.id} crop={crop} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default function FarmerDetailPage() {
  return (
    <ShortlistProvider>
      <FarmerDetailContent />
    </ShortlistProvider>
  )
}
