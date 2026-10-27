import React, { useState, useEffect } from 'react'
import { useNavigate }               from 'react-router-dom'
import { fetchBuyerTraceability }    from '../../../services/traceabilityApi.js'
import PageHeader                    from '../../../components/ui/PageHeader.jsx'
import { BlockchainNetworkBanner }   from '../../../components/common/BlockchainVerification.jsx'


const eventLabel = {
  HARVESTED:        { icon: '🌾', label: 'Harvested'         },
  QUALITY_CHECKED:  { icon: '✓',  label: 'Quality Checked'   },
  BOOKED:           { icon: '📋', label: 'Booked'            },
  PICKUP_SCHEDULED: { icon: '📅', label: 'Pickup Scheduled'  },
  PICKED_UP:        { icon: '🚛', label: 'Picked Up'         },
  IN_TRANSIT:       { icon: '🚛', label: 'In Transit'        },
  DELIVERED:        { icon: '📦', label: 'Delivered'         },
  PAYMENT_RECEIVED: { icon: '💰', label: 'Payment Received'  },
}

const orderStatusCls = {
  Confirmed:          'bg-blue-100 text-blue-700',
  Preparing:          'bg-orange-100 text-orange-700',
  'Ready for Pickup': 'bg-violet-100 text-violet-700',
  'Picked Up':        'bg-teal-100 text-teal-700',
  'In Transit':       'bg-blue-100 text-blue-800',
  Delivered:          'bg-emerald-100 text-emerald-800',
  Cancelled:          'bg-gray-100 text-gray-600',
}

function SkeletonCard() {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="flex gap-3">
        <div className="w-11 h-11 bg-gray-200 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      {[1,2,3].map((i) => <div key={i} className="h-3 bg-gray-100 rounded w-full" />)}
    </div>
  )
}

export default function BuyerTraceability() {
  const navigate = useNavigate()

  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchBuyerTraceability()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const items = data?.items || []

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div>
      <PageHeader
        title="Traceability"
        subtitle="Track the complete farm-to-delivery journey of your purchased crops."
      />

      {/* Blockchain Network Status Banner */}
      <BlockchainNetworkBanner />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); setLoading(true); fetchBuyerTraceability().then(setData).catch((e) => setError(e.message)).finally(() => setLoading(false)) }}
            className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1,2,3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🔗</div>
          <p className="font-semibold text-gray-700">No traceability records yet</p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            Traceability records appear here once your orders are processed through the AgriFlow workflow.
          </p>
          <button onClick={() => navigate('/buyer/orders')} className="btn-primary mt-5 text-sm px-6">
            View My Orders
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {items.map((item) => {
            const lastEv = item.lastEvent
            const evMeta = lastEv ? eventLabel[lastEv.eventType] : null
            const progressSteps = ['HARVESTED','QUALITY_CHECKED','BOOKED','PICKUP_SCHEDULED','PICKED_UP','IN_TRANSIT','DELIVERED','PAYMENT_RECEIVED']
            const progressIdx   = lastEv ? progressSteps.indexOf(lastEv.eventType) : -1
            const progressPct   = progressIdx >= 0 ? Math.round(((progressIdx + 1) / progressSteps.length) * 100) : 0

            return (
              <div key={item.orderId}
                className="card border border-gray-100 hover:shadow-md transition-all hover:border-agri-green/20 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 bg-agri-light rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">🌾</div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-base leading-tight truncate">{item.cropName}</h3>
                      <p className="text-xs text-gray-400 truncate">{item.variety || '—'} · {item.quantity}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`status-badge text-xs flex-shrink-0 ${orderStatusCls[item.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                      {item.orderStatus}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      ⛓️ Polygon Verified
                    </span>
                  </div>
                </div>


                {/* Info rows */}
                <div className="space-y-1 mb-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Farmer</span>
                    <span className="font-medium text-gray-700">{item.farmerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order Date</span>
                    <span className="font-medium text-gray-700">{fmtDate(item.orderDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Events Recorded</span>
                    <span className="font-medium text-gray-700">{item.eventCount}</span>
                  </div>
                  {lastEv && evMeta && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Last Event</span>
                      <span className="font-medium text-agri-green">{evMeta.icon} {evMeta.label}</span>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Journey Progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-agri-green rounded-full transition-all duration-700"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Action */}
                <button
                  onClick={() => navigate(`/buyer/traceability/${item.orderId}`)}
                  className="mt-auto w-full py-2.5 rounded-xl text-xs font-semibold bg-agri-light text-agri-green hover:bg-green-100 transition-colors">
                  View Full Journey →
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
