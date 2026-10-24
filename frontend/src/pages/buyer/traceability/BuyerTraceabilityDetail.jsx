import React, { useState, useEffect }     from 'react'
import { useNavigate, useParams }          from 'react-router-dom'
import { fetchBuyerOrderTraceability }     from '../../../services/traceabilityApi.js'

const EVENT_FLOW = [
  'HARVESTED',
  'QUALITY_CHECKED',
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'PAYMENT_RECEIVED',
]

const eventMeta = {
  HARVESTED:        { icon: '🌾', label: 'Harvested',          color: 'bg-green-100 text-green-700' },
  QUALITY_CHECKED:  { icon: '✅', label: 'Quality Checked',    color: 'bg-emerald-100 text-emerald-700' },
  BOOKED:           { icon: '📋', label: 'Booked',             color: 'bg-blue-100 text-blue-700' },
  PICKUP_SCHEDULED: { icon: '📅', label: 'Pickup Scheduled',   color: 'bg-violet-100 text-violet-700' },
  PICKED_UP:        { icon: '🚛', label: 'Picked Up',          color: 'bg-teal-100 text-teal-700' },
  IN_TRANSIT:       { icon: '🚛', label: 'In Transit',         color: 'bg-blue-100 text-blue-800' },
  DELIVERED:        { icon: '📦', label: 'Delivered',          color: 'bg-emerald-100 text-emerald-800' },
  PAYMENT_RECEIVED: { icon: '💰', label: 'Payment Received',   color: 'bg-green-100 text-green-800' },
}

const statusCls = {
  completed: { ring: 'bg-agri-green text-white',                        line: 'bg-agri-green'  },
  current:   { ring: 'bg-amber-500 text-white ring-4 ring-amber-200',  line: 'bg-gray-200'    },
  pending:   { ring: 'bg-gray-100 text-gray-400',                       line: 'bg-gray-100'    },
}

function fmtDate(d) {
  if (!d) return null
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
    </div>
  )
}

export default function BuyerTraceabilityDetail() {
  const { orderId } = useParams()
  const navigate    = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchBuyerOrderTraceability(orderId)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [orderId])

  if (loading) {
    return (
      <div className="max-w-3xl animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded-xl w-48" />
        {[1,2,3].map((i) => <div key={i} className="card h-28" />)}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mb-4">🔍</div>
        <p className="font-semibold text-gray-700">Traceability record not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/buyer/traceability')} className="btn-primary mt-4 text-sm px-6">
          Back to Traceability
        </button>
      </div>
    )
  }

  const { summary, timeline } = data
  const completedCount = timeline.filter((t) => t.status === 'completed').length
  const progressPct    = Math.round((completedCount / EVENT_FLOW.length) * 100)

  return (
    <div className="max-w-3xl">
      {/* Back */}
      <button onClick={() => navigate('/buyer/traceability')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Traceability
      </button>

      {/* Summary card */}
      <div className="card mb-6 border border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{summary.cropName}</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {summary.variety || '—'} · {summary.quantity} · Order #{summary.orderId.slice(-8).toUpperCase()}
            </p>
          </div>
          {summary.totalAmount && (
            <div className="text-right">
              <p className="text-2xl font-bold text-agri-green">₹{summary.totalAmount?.toLocaleString()}</p>
              <p className="text-xs text-gray-400">Total amount</p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>Journey Progress</span>
            <span>{completedCount} of {EVENT_FLOW.length} events · {progressPct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-agri-green rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 pb-3 border-b border-gray-100">
          Crop Journey
        </h3>

        <div className="relative">
          {timeline.map((item, idx) => {
            const meta     = eventMeta[item.eventType] || { icon: '•', label: item.eventType, color: 'bg-gray-100 text-gray-600' }
            const scfg     = statusCls[item.status] || statusCls.pending
            const isLast   = idx === timeline.length - 1

            return (
              <div key={item.eventType} className="flex gap-4 pb-8 last:pb-0 relative">
                {/* Connector line */}
                {!isLast && (
                  <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${scfg.line}`} />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 ${scfg.ring}`}>
                  {item.status === 'completed' ? '✓' : item.status === 'current' ? meta.icon : (idx + 1)}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold
                      ${item.status === 'completed' ? 'text-gray-900' : ''}
                      ${item.status === 'current'   ? 'text-agri-green' : ''}
                      ${item.status === 'pending'   ? 'text-gray-400' : ''}`}>
                      {meta.label}
                    </p>
                    {item.status === 'current' && (
                      <span className="text-xs font-semibold bg-agri-green text-white px-2 py-0.5 rounded-full">Current</span>
                    )}
                    {item.status === 'completed' && item.eventType && (
                      <span className={`status-badge text-xs ${meta.color}`}>{meta.label}</span>
                    )}
                  </div>

                  {item.status !== 'pending' && item.timestamp ? (
                    <>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(item.timestamp)}</p>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </p>
                      )}
                      {/* Metadata badges */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {item.metadata.grade && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">Grade: {item.metadata.grade}</span>
                          )}
                          {item.metadata.amount && (
                            <span className="text-xs bg-agri-light text-agri-green px-2 py-0.5 rounded-md">₹{item.metadata.amount?.toLocaleString()}</span>
                          )}
                        </div>
                      )}
                    </>
                  ) : item.status === 'pending' ? (
                    <p className="text-xs text-gray-300 mt-0.5">Awaiting this step</p>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Farmer section */}
      {summary.farmer && (
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
            Farmer
          </h3>
          <Row label="Name"         value={summary.farmer.name} />
          <Row label="Farm"         value={summary.farmer.farmName || '—'} />
          <Row label="Location"     value={summary.farmer.farmLocation} />
          <Row label="Verified"     value={summary.farmer.verification === 'Verified' ? '✓ Verified' : 'Unverified'} />
        </div>
      )}

      {/* Delivery section */}
      <div className="card mb-5">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">
          Order Summary
        </h3>
        <Row label="Order ID"          value={`#${summary.orderId.slice(-8).toUpperCase()}`} />
        <Row label="Delivery Location" value={summary.deliveryLocation} />
        <Row label="Order Date"        value={fmtDate(summary.orderDate)} />
      </div>

      {/* Blockchain placeholder */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">⛓️</span>
          <p className="text-sm font-semibold text-gray-700">Blockchain Verification</p>
          <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full ml-auto">Coming Soon</span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          All traceability events are currently stored in the AgriFlow database.
          Immutable on-chain verification via blockchain will be added in a future release,
          providing tamper-proof supply chain records for every crop journey.
        </p>
      </div>
    </div>
  )
}
