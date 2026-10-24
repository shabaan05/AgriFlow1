import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchEarningById } from '../../../services/transporterApi.js'

const statusCls = {
  PENDING: 'bg-amber-100 text-amber-700',
  PAID:    'bg-green-100 text-green-800',
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

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function EarningDetail() {
  const { id }    = useParams()
  const navigate  = useNavigate()

  const [earning, setEarning] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    fetchEarningById(id)
      .then(setEarning)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl animate-pulse space-y-4">
        {[1,2,3,4].map((i) => <div key={i} className="card h-28" />)}
      </div>
    )
  }

  if (!earning) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="font-semibold text-gray-700">Earning record not found</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button onClick={() => navigate('/transporter/earnings')} className="btn-primary mt-4 text-sm px-6">Back to Earnings</button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate('/transporter/earnings')}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Earnings
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
            ₹{earning.amount?.toLocaleString()}
            <span className={`status-badge text-xs ${statusCls[earning.status] || 'bg-gray-100 text-gray-600'}`}>{earning.status}</span>
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">{earning.cropName} · Trip #{earning.pickupRequestId?.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      {/* Earnings calculation card */}
      <div className="bg-gradient-to-br from-agri-dark to-agri-green rounded-2xl p-5 mb-5 text-white">
        <p className="text-green-200 text-xs font-semibold uppercase tracking-wider mb-3">💰 Earnings Breakdown</p>
        <div className="space-y-2">
          {earning.calculation && (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Base Transport Fee</span>
                <span className="font-semibold">₹{earning.calculation.baseAmount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Distance ({earning.calculation.distanceKm} km × ₹5/km)</span>
                <span className="font-semibold">₹{earning.calculation.distanceComponent}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-200">Quantity ({earning.quantity} {earning.unit} × ₹0.50/{earning.unit})</span>
                <span className="font-semibold">₹{earning.calculation.quantityComponent}</span>
              </div>
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between">
                <span className="font-bold">Total Earning</span>
                <span className="text-xl font-bold">₹{earning.amount?.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <Section title="Trip Details">
        <Row label="Crop"          value={`${earning.cropName}`} />
        <Row label="Quantity"      value={`${earning.quantity} ${earning.unit}`} />
        <Row label="Pickup From"    value={earning.pickupLocation} />
        <Row label="Delivered To"   value={earning.deliveryLocation} />
        <Row label="Completed On"   value={fmtDate(earning.completedAt)} />
      </Section>

      {earning.order && (
        <Section title="Order Information">
          <Row label="Order ID"     value={`#${earning.order.id?.slice(-8).toUpperCase()}`} />
          <Row label="Order Status" value={earning.order.status} />
          <Row label="Buyer"        value={earning.order.buyerCompany || earning.order.buyerName} />
          <Row label="Order Value"  value={`₹${earning.order.totalAmount?.toLocaleString()}`} />
        </Section>
      )}

      <Section title="Payment Status">
        <Row label="Status"    value={earning.status} highlight={earning.status === 'PAID'} />
        <Row label="Paid On"   value={earning.paidAt ? fmtDate(earning.paidAt) : '—'} />
        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mt-3 text-xs text-amber-700 font-medium">
          Payout processing will be available in a future update.
        </div>
      </Section>
    </div>
  )
}
