import React, { useState, useEffect } from 'react'
import { useNavigate, useParams }     from 'react-router-dom'
import { fetchRequirementById, updateRequirement } from '../../../services/requirementsApi.js'
import RequirementForm from '../../../components/buyer/RequirementForm.jsx'
import PageHeader      from '../../../components/ui/PageHeader.jsx'

export default function EditRequirement() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [req,      setReq]      = useState(null)
  const [fetching, setFetching] = useState(true)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    fetchRequirementById(id)
      .then(setReq)
      .catch((e) => setError(e.message))
      .finally(() => setFetching(false))
  }, [id])

  if (fetching) {
    return (
      <div className="max-w-3xl space-y-4">
        {[1,2,3,4].map((i) => <div key={i} className="card h-28 animate-pulse" />)}
      </div>
    )
  }

  if (!req) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Requirement not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/requirements')} className="btn-primary mt-4 text-sm px-6">
          Back to Requirements
        </button>
      </div>
    )
  }

  if (req.status !== 'ACTIVE') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔒</div>
        <p className="font-semibold text-gray-700">Cannot Edit Requirement</p>
        <p className="text-sm text-gray-400 mt-1">
          Only <strong>ACTIVE</strong> requirements can be edited. This requirement is <strong>{req.status}</strong>.
        </p>
        <button onClick={() => navigate(`/buyer/requirements/${id}`)} className="btn-primary mt-4 text-sm px-6">
          View Details
        </button>
      </div>
    )
  }

  async function handleSubmit(data) {
    setLoading(true)
    setError('')
    try {
      await updateRequirement(id, data)
      navigate(`/buyer/requirements/${id}`, { state: { fromEdit: true } })
    } catch (err) {
      setError(err.message || 'Failed to update. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={`Edit — ${req.cropName}`}
        subtitle="Update your procurement requirement. Changes are saved immediately."
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <RequirementForm
        initialData={{
          ...req,
          minPricePerKg: req.minPricePerKg ?? '',
          maxPricePerKg: req.maxPricePerKg ?? '',
        }}
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/buyer/requirements/${id}`)}
        isEdit
        loading={loading}
      />
    </div>
  )
}
