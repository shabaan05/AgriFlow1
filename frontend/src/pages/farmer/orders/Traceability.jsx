import React, { useState, useEffect } from 'react'
import { useNavigate }             from 'react-router-dom'
import {
  fetchTraceabilityOverview,
  fetchCropTraceability,
} from '../../../services/traceabilityApi.js'
import PageHeader from '../../../components/ui/PageHeader.jsx'

// ── Event flow constants ─────────────────────────────────────────────────────
const EVENT_FLOW = [
  { type: 'HARVESTED',        label: 'Harvested',         icon: '🌾' },
  { type: 'QUALITY_CHECKED',  label: 'Quality Checked',   icon: '✓'  },
  { type: 'BOOKED',           label: 'Booked',             icon: '📋' },
  { type: 'PICKUP_SCHEDULED', label: 'Pickup Scheduled',   icon: '📅' },
  { type: 'PICKED_UP',        label: 'Picked Up',          icon: '🚛' },
  { type: 'IN_TRANSIT',       label: 'In Transit',         icon: '🚛' },
  { type: 'DELIVERED',        label: 'Delivered',          icon: '📦' },
  { type: 'PAYMENT_RECEIVED', label: 'Payment Received',  icon: '💰' },
]

// ── Timeline event visual config ──────────────────────────────────────────────
const statusConfig = {
  completed: { ring: 'bg-agri-green text-white',            line: 'bg-agri-green', label: 'Completed', text: 'text-gray-900' },
  current:  { ring: 'bg-amber-500 text-white ring-4 ring-amber-200', line: 'bg-gray-200', label: 'In Progress', text: 'text-amber-700' },
  pending:  { ring: 'bg-gray-200 text-gray-400',            line: 'bg-gray-100', label: 'Pending',   text: 'text-gray-400' },
}

import {
  BlockchainBadge,
  BlockchainAuditModal,
  BlockchainNetworkBanner,
} from '../../../components/common/BlockchainVerification.jsx'

// ── Detail view (single crop timeline) ────────────────────────────────────────
function TraceabilityTimeline({ data, onAuditClick }) {
  const { summary, timeline } = data

  function formatDate(d) {
    if (!d) return null
    const dt = new Date(d)
    return {
      date: dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Blockchain Network Status Banner */}
      <BlockchainNetworkBanner />

      {/* Summary card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-agri-light rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-gray-900 text-lg">{summary.cropName}</h2>
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                  ⛓️ Polygon Amoy Protected
                </span>
              </div>
              <p className="text-sm text-gray-400">{summary.variety || '—'} · {summary.quantity}</p>
              {summary.grade && <p className="text-xs text-gray-500 mt-0.5">Grade: {summary.grade}</p>}
            </div>
          </div>
          <div className="text-right">
            {summary.buyerName && <p className="text-sm font-medium text-gray-700">{summary.buyerName}</p>}
            {summary.totalAmount && <p className="text-lg font-bold text-agri-green">₹{summary.totalAmount.toLocaleString()}</p>}
            {summary.orderId && <p className="text-xs font-mono text-gray-400 mt-0.5">#{summary.orderId.slice(-8).toUpperCase()}</p>}
          </div>
        </div>
        {summary.farmLocation && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {summary.farmLocation}
          </div>
        )}
      </div>

      {/* Vertical timeline */}
      <div className="card">
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Decentralized Crop Journey
          </h3>
          <span className="text-xs text-purple-700 font-medium bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
            Smart Contract Verified
          </span>
        </div>

        <div className="relative">
          {timeline.map((item, idx) => {
            const cfg = statusConfig[item.status] || statusConfig.pending
            const meta = EVENT_FLOW.find((e) => e.type === item.eventType)
            const dt   = item.timestamp ? formatDate(item.timestamp) : null
            const isLast = idx === timeline.length - 1

            return (
              <div key={item.eventType} className="flex gap-4 pb-8 last:pb-0 relative">
                {/* Connector line */}
                {!isLast && (
                  <div className={`absolute left-5 top-12 bottom-0 w-0.5 ${cfg.line}`} />
                )}

                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10 ${cfg.ring}`}>
                  {item.status === 'completed' ? '✓' : meta?.icon || '•'}
                </div>

                {/* Content */}
                <div className="flex-1 -mt-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-semibold ${cfg.text}`}>
                      {meta?.label || item.eventType}
                    </p>
                    {item.status === 'current' && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                        In Progress
                      </span>
                    )}
                  </div>

                  {dt ? (
                    <>
                      <p className="text-xs text-gray-500 mt-1">
                        {dt.date} · {dt.time}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">{item.description}</p>
                      )}
                      {item.location && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </p>
                      )}

                      {/* Metadata */}
                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.metadata.grade && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                              Grade: {item.metadata.grade}
                            </span>
                          )}
                          {item.metadata.amount && (
                            <span className="text-xs bg-agri-light text-agri-green px-2 py-0.5 rounded-md">
                              ₹{item.metadata.amount.toLocaleString()}
                            </span>
                          )}
                          {item.metadata.buyerName && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md">
                              {item.metadata.buyerName}
                            </span>
                          )}
                        </div>
                      )}

                      {/* On-Chain Blockchain Proof Badge */}
                      <BlockchainBadge
                        event={item}
                        onAuditClick={onAuditClick}
                      />
                    </>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Awaiting this step…</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}


// ── Overview (crop list with events) ──────────────────────────────────────────
function OverviewCard({ item, onClick }) {
  const lastEvent = item.lastEvent
  const meta = EVENT_FLOW.find((e) => e.type === lastEvent?.eventType)
  return (
    <div
      onClick={onClick}
      className="card border border-gray-100 hover:shadow-md hover:border-agri-green/30 transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl">🌾</div>
          <div>
            <h3 className="font-semibold text-gray-900 text-base">{item.cropName}</h3>
            <p className="text-xs text-gray-400">{item.variety || '—'}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="status-badge bg-gray-100 text-gray-600 text-xs">{item.status}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
            ⛓️ Polygon Verified
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{item.eventCount} event{item.eventCount !== 1 ? 's' : ''} recorded</span>
        {lastEvent && (
          <span className="font-medium text-agri-green">
            Last: {meta?.label || lastEvent.eventType}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-3">
        {EVENT_FLOW.map((e) => {
          const done = lastEvent && EVENT_FLOW.findIndex(x => x.type === lastEvent.eventType) >= EVENT_FLOW.findIndex(x => x.type === e.type)
          return (
            <div
              key={e.type}
              className={`h-1.5 flex-1 rounded-full ${done ? 'bg-agri-green' : 'bg-gray-100'}`}
              title={e.label}
            />
          )
        })}
      </div>

      <p className="text-xs font-semibold text-agri-green group-hover:underline">View Timeline →</p>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Traceability() {
  const navigate = useNavigate()

  const [overview,  setOverview]  = useState(null)
  const [detail,    setDetail]    = useState(null)
  const [selectedCrop,setSelectedCrop] = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [auditModalEvent, setAuditModalEvent] = useState(null)


  // Load overview on mount
  useEffect(() => {
    setLoading(true)
    fetchTraceabilityOverview()
      .then((data) => setOverview(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Load detail when a crop is selected
  function handleSelectCrop(cropId) {
    setSelectedCrop(cropId)
    setDetail(null)
    setError('')
    fetchCropTraceability(cropId)
      .then(setDetail)
      .catch((e) => setError(e.message))
  }

  function handleBack() {
    setSelectedCrop(null)
    setDetail(null)
  }

  return (
    <div>
      <PageHeader
        title="Traceability"
        subtitle="Track the complete journey of your crops from harvest to delivery."
      />

      {selectedCrop && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all crops
        </button>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
          {error}
        </div>
      )}

      {/* Detail view */}
      {selectedCrop ? (
        detail ? (
          <TraceabilityTimeline
            data={detail}
            onAuditClick={(ev) => setAuditModalEvent(ev)}
          />
        ) : (
          <div className="space-y-4">
            {[1,2,3].map((i) => <div key={i} className="card h-24 animate-pulse" />)}
          </div>
        )
      ) : (
        /* Overview */
        <>
          <BlockchainNetworkBanner />

          {loading ? (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1,2,3,4].map((i) => <div key={i} className="card h-40 animate-pulse" />)}
            </div>
          ) : overview?.items?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🔗</div>
              <p className="font-semibold text-gray-700">No traceability events yet</p>
              <p className="text-sm text-gray-400 mt-1 max-w-xs">
                Traceability events are created automatically as your crops move through the workflow —
                harvest, booking, pickup, delivery, and payment.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {overview?.items?.map((item) => (
                <OverviewCard key={item.cropId} item={item} onClick={() => handleSelectCrop(item.cropId)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Blockchain Cryptographic Audit Proof Modal */}
      {auditModalEvent && (
        <BlockchainAuditModal
          event={auditModalEvent}
          onClose={() => setAuditModalEvent(null)}
        />
      )}
    </div>
  )
}

