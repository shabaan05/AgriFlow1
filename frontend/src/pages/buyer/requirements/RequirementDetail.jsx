import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchRequirementById, cancelRequirement } from '../../../services/requirementsApi.js'

const statusCls = {
  ACTIVE:    'bg-green-100 text-green-800',
  FULFILLED: 'bg-blue-100 text-blue-700',
  EXPIRED:   'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

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

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

function CancelDialog({ name, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Cancel Requirement?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Cancel your requirement for <span className="font-semibold text-gray-800">{name}</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Keep
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Cancelling…
              </>
            ) : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RequirementDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const location     = useLocation()

  const [req,       setReq]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [dialog,    setDialog]    = useState(false)
  const [cancelling,setCancelling]= useState(false)

  useEffect(() => {
    fetchRequirementById(id)
      .then(setReq)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {[1,2,3].map((i) => <div key={i} className="card h-28" />)}
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

  const isActive   = req.status === 'ACTIVE'
  const byDate     = req.requiredByDate
    ? new Date(req.requiredByDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'
  const createdDate = req.createdAt
    ? new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'
  const priceRange = req.minPricePerKg || req.maxPricePerKg
    ? `₹${req.minPricePerKg ?? '—'} – ₹${req.maxPricePerKg ?? '—'} / ${req.unit}`
    : '—'

  async function handleCancel() {
    setCancelling(true)
    try {
      const updated = await cancelRequirement(id)
      setReq(updated)
      setDialog(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false) }
  }

  const showBanner = location.state?.fromCreate || location.state?.fromEdit

  return (
    <div className="max-w-2xl">
      {showBanner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {location.state?.fromCreate ? 'Requirement created successfully.' : 'Requirement updated successfully.'}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Back + header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <button onClick={() => navigate('/buyer/requirements')}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            My Requirements
          </button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {req.cropName}
            <span className={`status-badge text-xs ${statusCls[req.status] || 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Created {createdDate}</p>
        </div>
        {isActive && (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/buyer/requirements/${id}/edit`)} className="btn-outline text-sm px-5">Edit</button>
            <button onClick={() => setDialog(true)}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
              Cancel
            </button>
          </div>
        )}
      </div>

      <Section title="Crop Details">
        <Row label="Crop Name"  value={req.cropName} />
        <Row label="Variety"    value={req.variety} />
        <Row label="Category"   value={req.category} />
      </Section>

      <Section title="Quantity & Quality">
        <Row label="Quantity"      value={`${req.quantity?.toLocaleString()} ${req.unit}`} />
        <Row label="Quality Grade" value={req.qualityGrade || 'Any'} />
      </Section>

      <Section title="Pricing">
        <Row label="Price Range" value={priceRange} highlight />
      </Section>

      <Section title="Timeline & Delivery">
        <Row label="Required By"        value={byDate} />
        <Row label="Delivery Location"  value={req.deliveryLocation} />
      </Section>

      {req.notes && (
        <Section title="Notes">
          <p className="text-sm text-gray-700 leading-relaxed">{req.notes}</p>
        </Section>
      )}

      {/* AI placeholder section */}
      <div className="card border border-dashed border-agri-green/30 bg-agri-light/40">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-agri-light rounded-xl flex items-center justify-center text-xl">🤖</div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Buyer Match Intelligence</p>
            <p className="text-xs text-gray-400">Powered by AgriFlow AI</p>
          </div>
          <span className="ml-auto text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Coming Soon</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">
          Potential farmer matches will appear here once the Buyer Match AI Agent is enabled.
          The agent will rank available farmers and crops based on your quantity, grade, price range, location and timeline.
        </p>
      </div>

      {dialog && (
        <CancelDialog
          name={req.cropName}
          onConfirm={handleCancel}
          onCancel={() => !cancelling && setDialog(false)}
          loading={cancelling}
        />
      )}
    </div>
  )
}
