import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCrops }  from '../../../context/CropsContext.jsx'
import CropForm      from '../../../components/crops/CropForm.jsx'
import PageHeader    from '../../../components/ui/PageHeader.jsx'
import * as api      from '../../../services/cropApi.js'

export default function EditCrop() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { updateCrop, getCropById } = useCrops()

  // Prefer local state first (instant); fetch fresh copy from API on mount
  const [crop,     setCrop]     = useState(() => getCropById(id) || null)
  const [fetching, setFetching] = useState(!crop)
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    if (crop) return   // already have it from context
    setFetching(true)
    api.fetchCropById(id)
      .then((data) => { setCrop(data); setFetching(false) })
      .catch((err) => { setApiError(err.message); setFetching(false) })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (fetching) {
    return (
      <div className="max-w-3xl space-y-5">
        {[1,2,3,4].map((i) => (
          <div key={i} className="card animate-pulse h-32" />
        ))}
      </div>
    )
  }

  if (!crop) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
        <p className="font-semibold text-gray-700 text-lg">Crop not found</p>
        <p className="text-sm text-gray-400 mt-1">{apiError || 'This crop may have been deleted.'}</p>
        <button onClick={() => navigate('/farmer/crops')} className="btn-primary mt-5 text-sm px-6">
          Back to My Crops
        </button>
      </div>
    )
  }

  async function handleSubmit(data) {
    setLoading(true)
    setApiError('')
    try {
      const updated = await updateCrop(id, data)
      navigate(`/farmer/crops/${updated.id}`, { state: { fromEdit: true } })
    } catch (err) {
      setApiError(err.message || 'Failed to update crop. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Edit — ${crop.name}`}
        subtitle="Update your crop details. Changes are saved to the database."
      />

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {apiError}
        </div>
      )}

      <CropForm
        initialData={crop}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/farmer/crops/${id}`)}
        isEdit
        loading={loading}
      />
    </div>
  )
}
