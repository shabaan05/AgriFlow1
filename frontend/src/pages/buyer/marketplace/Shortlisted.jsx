import React, { useState, useEffect } from 'react'
import { useNavigate }              from 'react-router-dom'
import { fetchShortlist }           from '../../../services/marketplaceApi.js'
import { ShortlistProvider }        from '../../../context/ShortlistContext.jsx'
import CropMarketCard               from '../../../components/buyer/CropMarketCard.jsx'
import PageHeader                   from '../../../components/ui/PageHeader.jsx'

function ShortlistedContent() {
  const navigate           = useNavigate()
  const [crops,   setCrops]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  function load() {
    setLoading(true)
    fetchShortlist()
      .then(setCrops)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <PageHeader
        title="Shortlisted Crops"
        subtitle={loading ? 'Loading…' : `${crops.length} crop${crops.length !== 1 ? 's' : ''} shortlisted`}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={load} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => (
            <div key={i} className="card h-64 animate-pulse" />
          ))}
        </div>
      ) : crops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">⭐</div>
          <p className="font-semibold text-gray-700 text-lg">Your shortlist is empty</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Browse the marketplace and click the heart icon to shortlist crops you're interested in.
          </p>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="btn-primary mt-5 text-sm px-6"
          >
            Browse Marketplace
          </button>
        </div>
      ) : (
        <>
          <p className="text-xs text-gray-400 mb-5">
            Click the ♥ to remove a crop from your shortlist. Changes are saved automatically.
          </p>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {crops.map((crop) => <CropMarketCard key={crop.id} crop={crop} />)}
          </div>
        </>
      )}
    </div>
  )
}

export default function ShortlistedPage() {
  return (
    <ShortlistProvider>
      <ShortlistedContent />
    </ShortlistProvider>
  )
}
