import React, { useState, useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { fetchPickupRequestById, acceptPickupRequest, rejectPickupRequest } from '../../../services/transporterApi.js'

const statusCls = {
  PENDING:   'bg-amber-100 text-amber-700',
  ACCEPTED:  'bg-green-100 text-green-800',
  REJECTED:  'bg-red-100 text-red-600',
  CANCELLED: 'bg-gray-100 text-gray-600',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
}

function Section({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">{title}</h3>
      {children}
    </div>
  )
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}`}>{value || '—'}</span>
    </div>
  )
}

function ConfirmDialog({ title, message, confirmLabel, confirmCls, onConfirm, onCancel, loading, children }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        {children}
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-70 flex items-center justify-center gap-2 ${confirmCls}`}>
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PickupRequestDetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()

  const [req,       setReq]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [dialog,    setDialog]    = useState(null)  // 'accept' | 'reject' | null
  const [acting,    setActing]    = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [feedback,  setFeedback]  = useState('')

  useEffect(() => {
    fetchPickupRequestById(id)
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
        <p className="font-semibold text-gray-700">Request not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/transporter/pickups')} className="btn-primary mt-4 text-sm px-6">Back</button>
      </div>
    )
  }

  const pickupDate   = req.pickupDate ? new Date(req.pickupDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : '—'
  const createdDate  = req.createdAt  ? new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const isPending    = req.status === 'PENDING'
  const showBanner   = location.state?.accepted || location.state?.rejected

  async function handleAction(type) {
    setActing(true)
    try {
      let updated
      if (type === 'accept') {
        updated = await acceptPickupRequest(id)
      } else {
        updated = await rejectPickupRequest(id, rejectReason)
      }
      setReq(updated)
      setDialog(null)
      setRejectReason('')
      setFeedback(type === 'accept'
        ? '✅ Request accepted! This trip will appear in My Trips.'
        : 'Request rejected.')
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setError(err.message)
      setDialog(null)
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Back */}
      <button onClick={() => navigate('/transporter/pickups')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Pickup Requests
      </button>

      {feedback && (
        <div className={`text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5 border
          ${feedback.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            {req.cropName}
            <span className={`status-badge text-xs ${statusCls[req.status] || 'bg-gray-100 text-gray-600'}`}>{req.status}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{req.quantity} {req.unit} · Request posted {createdDate}</p>
        </div>
        {isPending && (
          <div className="flex gap-2">
            <button onClick={() => setDialog('reject')}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors">
              Reject
            </button>
            <button onClick={() => setDialog('accept')} className="btn-primary text-sm px-5">
              Accept Request
            </button>
          </div>
        )}
      </div>

      {/* Transport summary */}
      <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-5 mb-5 text-white">
        <div className="flex items-center justify-between mb-4">
          <p className="text-green-200 text-xs font-semibold uppercase tracking-wider">🚛 Transport Summary</p>
          <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">
            ~{req.estimatedDistanceKm} km
          </span>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-3 bg-green-300 rounded-full" />
            <div className="w-0.5 h-10 bg-white/30" />
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs text-green-200">Pickup · {pickupDate}</p>
              <p className="text-sm font-semibold">{req.pickupLocation || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-green-200">Delivery</p>
              <p className="text-sm font-semibold">{req.deliveryLocation || '—'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-200 text-xs">Est. Earnings</p>
            <p className="text-2xl font-bold">₹{req.estimatedEarnings?.toLocaleString()}</p>
            <p className="text-green-200 text-xs mt-0.5">~{req.estimatedDurationHrs}h trip</p>
          </div>
        </div>
      </div>

      <Section title="Crop & Order">
        <Row label="Crop"         value={`${req.cropName}${req.variety ? ` · ${req.variety}` : ''}`} />
        <Row label="Quantity"     value={`${req.quantity} ${req.unit}`} />
        <Row label="Order Value"  value={`₹${req.totalAmount?.toLocaleString()}`} highlight />
        <Row label="Buyer"        value={req.buyerCompany || req.buyerName} />
        <Row label="Delivery To"  value={req.deliveryLocation} />
      </Section>

      {req.farmer && (
        <Section title="Farmer">
          <Row label="Name"         value={req.farmer.name} />
          <Row label="Farm"         value={req.farmer.farmName || '—'} />
          <Row label="Pickup From"  value={req.farmer.farmLocation || req.pickupLocation} />
          <Row label="Contact"      value={req.farmer.phone || '—'} />
          <Row label="Verified"     value={req.farmer.verification === 'Verified' ? '✓ Verified' : 'Unverified'} />
        </Section>
      )}

      <Section title="Transport Details">
        <Row label="Est. Distance" value={`${req.estimatedDistanceKm} km`} />
        <Row label="Est. Duration" value={`~${req.estimatedDurationHrs} hours`} />
        <Row label="Est. Earnings" value={`₹${req.estimatedEarnings?.toLocaleString()}`} highlight />
        <Row label="Pickup Date"   value={pickupDate} />
        <p className="text-xs text-gray-400 mt-3">
          Distance/duration/earnings are estimates. Real route optimization coming in a future update.
        </p>
      </Section>

      {req.rejectionReason && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-red-600"><span className="font-semibold">Rejection reason: </span>{req.rejectionReason}</p>
        </div>
      )}

      {/* Accept dialog */}
      {dialog === 'accept' && (
        <ConfirmDialog
          title="Accept Pickup Request?"
          message={`Accept this request for ${req.quantity} ${req.unit} of ${req.cropName}? This trip will appear in My Trips.`}
          confirmLabel="Accept"
          confirmCls="bg-agri-green hover:bg-agri-dark text-white"
          onConfirm={() => handleAction('accept')}
          onCancel={() => setDialog(null)}
          loading={acting}
        />
      )}

      {/* Reject dialog */}
      {dialog === 'reject' && (
        <ConfirmDialog
          title="Reject Request?"
          message="Reject this pickup request?"
          confirmLabel="Reject"
          confirmCls="bg-red-600 hover:bg-red-700 text-white"
          onConfirm={() => handleAction('reject')}
          onCancel={() => setDialog(null)}
          loading={acting}
        >
          <textarea rows={2} className="input-field resize-none text-sm mt-2"
            placeholder="Reason (optional)"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)} />
        </ConfirmDialog>
      )}
    </div>
  )
}
