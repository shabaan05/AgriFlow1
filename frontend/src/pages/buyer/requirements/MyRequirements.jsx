import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate }        from 'react-router-dom'
import { fetchRequirements, cancelRequirement } from '../../../services/requirementsApi.js'
import PageHeader             from '../../../components/ui/PageHeader.jsx'

const STATUS_LABELS = ['All', 'ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED']

const statusCls = {
  ACTIVE:    'bg-green-100 text-green-800',
  FULFILLED: 'bg-blue-100 text-blue-700',
  EXPIRED:   'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

function CancelDialog({ req, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">Cancel Requirement?</h3>
        <p className="text-sm text-gray-500 mb-5">
          Cancel your requirement for <span className="font-semibold text-gray-800">{req?.cropName}</span>?
          This cannot be undone.
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

function RequirementCard({ req, onCancel }) {
  const navigate  = useNavigate()
  const isActive  = req.status === 'ACTIVE'

  const byDate = req.requiredByDate
    ? new Date(req.requiredByDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  const priceRange = req.minPricePerKg || req.maxPricePerKg
    ? `₹${req.minPricePerKg ?? '—'} – ₹${req.maxPricePerKg ?? '—'}`
    : '—'

  return (
    <div className="card border border-gray-100 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900">{req.cropName}</h3>
            {req.variety && <span className="text-xs text-gray-400">· {req.variety}</span>}
          </div>
          {req.category && <p className="text-xs text-gray-400 mt-0.5">{req.category}</p>}
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mb-4 text-xs">
        <div><span className="text-gray-400">Quantity</span><p className="font-medium text-gray-800">{req.quantity?.toLocaleString()} {req.unit}</p></div>
        <div><span className="text-gray-400">Grade</span><p className="font-medium text-gray-800">{req.qualityGrade || 'Any'}</p></div>
        <div><span className="text-gray-400">Price Range</span><p className="font-medium text-agri-green">{priceRange}</p></div>
        <div><span className="text-gray-400">Required By</span><p className="font-medium text-gray-800">{byDate}</p></div>
        <div className="col-span-2"><span className="text-gray-400">Delivery</span><p className="font-medium text-gray-800 truncate">{req.deliveryLocation}</p></div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-100">
        <button onClick={() => navigate(`/buyer/requirements/${req.id}`)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-agri-light text-agri-green hover:bg-green-100 transition-colors">
          View Details
        </button>
        {isActive && (
          <>
            <button onClick={() => navigate(`/buyer/requirements/${req.id}/edit`)}
              className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors">
              Edit
            </button>
            <button onClick={() => onCancel(req)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors border border-red-200">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function MyRequirements() {
  const navigate = useNavigate()

  const [reqs,        setReqs]        = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [search,      setSearch]      = useState('')
  const [statusFilter,setStatusFilter]= useState('All')
  const [cancelTarget,setCancelTarget]= useState(null)
  const [cancelling,  setCancelling]  = useState(false)
  const [feedback,    setFeedback]    = useState('')

  function load() {
    setLoading(true)
    fetchRequirements()
      .then(setReqs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => reqs.filter((r) => {
    const matchSearch = !search || r.cropName.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchSearch && matchStatus
  }), [reqs, search, statusFilter])

  const activeCnt = reqs.filter((r) => r.status === 'ACTIVE').length

  async function confirmCancel() {
    if (!cancelTarget) return
    setCancelling(true)
    try {
      const updated = await cancelRequirement(cancelTarget.id)
      setReqs((prev) => prev.map((r) => (r.id === cancelTarget.id ? updated : r)))
      setFeedback(`Requirement for ${cancelTarget.cropName} cancelled.`)
      setTimeout(() => setFeedback(''), 4000)
      setCancelTarget(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="My Requirements"
        subtitle={`${activeCnt} active requirement${activeCnt !== 1 ? 's' : ''}`}
        action={
          <button onClick={() => navigate('/buyer/requirements/create')} className="btn-primary text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Requirement
          </button>
        }
      />

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); load() }} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
               fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by crop name…" className="input-field pl-9"
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input-field bg-white sm:w-44 flex-shrink-0"
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          {STATUS_LABELS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading && reqs.length === 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <div key={i} className="card h-56 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">📋</div>
          <p className="font-semibold text-gray-700">
            {reqs.length === 0 ? 'No active requirements yet' : 'No requirements match your filter'}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {reqs.length === 0
              ? 'Create your first procurement requirement to start finding the right farmers and supply.'
              : 'Try a different search or filter.'}
          </p>
          {reqs.length === 0 && (
            <button onClick={() => navigate('/buyer/requirements/create')} className="btn-primary mt-5 text-sm px-6">
              Create Requirement
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((req) => (
            <RequirementCard key={req.id} req={req} onCancel={setCancelTarget} />
          ))}
        </div>
      )}

      {cancelTarget && (
        <CancelDialog
          req={cancelTarget}
          onConfirm={confirmCancel}
          onCancel={() => !cancelling && setCancelTarget(null)}
          loading={cancelling}
        />
      )}
    </div>
  )
}
