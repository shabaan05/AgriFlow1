import React, { useState } from 'react'
import { useNavigate }      from 'react-router-dom'
import { createRequirement } from '../../../services/requirementsApi.js'
import RequirementForm      from '../../../components/buyer/RequirementForm.jsx'
import PageHeader           from '../../../components/ui/PageHeader.jsx'

export default function CreateRequirement() {
  const navigate              = useNavigate()
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  async function handleSubmit(data) {
    setLoading(true)
    setApiError('')
    try {
      const req = await createRequirement(data)
      navigate(`/buyer/requirements/${req.id}`, { state: { fromCreate: true } })
    } catch (err) {
      setApiError(err.message || 'Failed to create requirement. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Create Requirement"
        subtitle="Define exactly what agricultural supply you need. This requirement will help match you with the right farmers."
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

      <RequirementForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/buyer/requirements')}
        isEdit={false}
        loading={loading}
      />
    </div>
  )
}
