import React, { useState, useEffect } from 'react'
import { useNavigate }         from 'react-router-dom'
import { fetchBuyerPayments, buyerPayNow }  from '../../../services/ordersApi.js'
import PageHeader              from '../../../components/ui/PageHeader.jsx'

// ── Status badge ─────────────────────────────────────────────────────────────
const statusCls = {
  Pending: 'bg-amber-100 text-amber-700',
  Paid:    'bg-green-100 text-green-800',
  Failed:  'bg-red-100 text-red-700',
}

function PaymentBadge({ status }) {
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusCls[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  )
}

// ── Summary KPI card ─────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color }) {
  const colors = {
    green:  'bg-green-50 text-agri-green',
    amber:  'bg-amber-50 text-amber-700',
    blue:   'bg-blue-50  text-blue-700',
    gray:   'bg-gray-50  text-gray-600',
  }
  return (
    <div className={`rounded-2xl px-5 py-5 ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[1,2,3,4,5,6,7].map((i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-3.5 bg-gray-200 rounded-full w-full" />
        </td>
      ))}
    </tr>
  )
}

// ── Payment detail modal ─────────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose, onNavigate, onPaid }) {
  const [paying,   setPaying]   = useState(false)
  const [payError, setPayError] = useState('')
  const [confirm,  setConfirm]  = useState(false)

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  async function handlePay() {
    setPaying(true)
    setPayError('')
    try {
      const result = await buyerPayNow(payment.id)
      onPaid(result)   // refresh list + close modal
    } catch (e) {
      setPayError(e.message)
      setConfirm(false)
    } finally {
      setPaying(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Payment Details</h3>
            <p className="text-xs text-gray-400 mt-0.5">{payment.cropName}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-0 divide-y divide-gray-50">
          {[
            { label: 'Payment ID',   value: payment.id.slice(-10).toUpperCase() },
            { label: 'Order ID',     value: payment.orderId?.slice(-8).toUpperCase() },
            { label: 'Crop',         value: payment.cropName },
            { label: 'Farmer',       value: payment.farmerName },
            { label: 'Quantity',     value: payment.quantity ? `${payment.quantity} ${payment.unit}` : '—' },
            { label: 'Amount',       value: `₹${payment.amount?.toLocaleString()}`, highlight: true },
            { label: 'Order Date',   value: fmtDate(payment.orderDate) },
            { label: 'Payment Date', value: payment.paidAt ? fmtDate(payment.paidAt) : '—' },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex justify-between py-3 gap-4">
              <span className="text-sm text-gray-500">{label}</span>
              <span className={`text-sm font-medium text-right ${highlight ? 'text-agri-green font-semibold' : 'text-gray-800'}`}>
                {value}
              </span>
            </div>
          ))}

          {/* Status */}
          <div className="flex justify-between py-3 gap-4 items-center">
            <span className="text-sm text-gray-500">Status</span>
            <PaymentBadge status={payment.status} />
          </div>

          {/* Pay Now section */}
          {payment.status === 'Pending' && (
            <div className="pt-4 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700 font-medium">
                <span className="font-bold">Demo Payment</span> — No real money is transferred. This confirms the payment record in the system for demo/testing purposes.
              </div>
              {payError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-700">{payError}</div>
              )}
              {!confirm ? (
                <button
                  onClick={() => setConfirm(true)}
                  className="w-full py-3 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors"
                >
                  Pay Now (Demo) — ₹{payment.amount?.toLocaleString()}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 text-center font-medium">
                    Confirm demo payment of <span className="text-agri-green font-bold">₹{payment.amount?.toLocaleString()}</span>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirm(false)}
                      disabled={paying}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePay}
                      disabled={paying}
                      className="flex-1 py-2.5 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {paying ? (
                        <>
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Processing…
                        </>
                      ) : 'Confirm Payment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {payment.status === 'Paid' && (
            <div className="pt-4">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 font-medium flex items-center gap-2">
                <span>✅</span> Payment confirmed on {fmtDate(payment.paidAt)}.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Close
          </button>
          <button onClick={() => { onClose(); onNavigate(payment.orderId) }}
            className="flex-1 py-2.5 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors">
            View Order
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BuyerPayments() {
  const navigate = useNavigate()

  const [data,     setData]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState(null)
  const [filter,   setFilter]   = useState('All')
  const [feedback, setFeedback] = useState('')

  function load() {
    setLoading(true)
    fetchBuyerPayments()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const payments = data?.payments || []
  const summary  = data?.summary  || {}

  const filtered = filter === 'All' ? payments : payments.filter((p) => p.status === filter)

  const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  // Called by PaymentDetailModal after successful payment confirmation
  function handlePaid(updatedPayment) {
    setSelected(null)
    setFeedback(`✅ Payment of ₹${updatedPayment.amount?.toLocaleString()} confirmed successfully.`)
    setTimeout(() => setFeedback(''), 5000)
    load()   // re-fetch from backend so summary KPIs and status badges update
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        subtitle="Payment records for your delivered orders."
      />

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => { setError(''); load() }} className="font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [1,2,3,4].map((i) => <div key={i} className="rounded-2xl h-20 bg-gray-100 animate-pulse" />)
        ) : (
          <>
            <KPICard label="Total Orders"    value={summary.totalOrders    || 0}                                  color="gray"  />
            <KPICard label="Total Amount"    value={`₹${(summary.totalAmount    || 0).toLocaleString()}`}         color="blue"  />
            <KPICard label="Paid"            value={`₹${(summary.paidAmount     || 0).toLocaleString()}`}         color="green" />
            <KPICard label="Pending Payment" value={`₹${(summary.pendingAmount  || 0).toLocaleString()}`}         color="amber" />
          </>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Pending', 'Paid', 'Failed'].map((f) => {
          const count = f === 'All' ? payments.length : payments.filter((p) => p.status === f).length
          return (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
                ${filter === f ? 'bg-agri-green text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}>
              {f} {count > 0 && <span className="ml-1 font-bold">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Demo payment notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6 flex items-center gap-2 text-xs text-blue-700 font-medium">
        <span>ℹ️</span>
        This is a demo payment system. No real money is transferred. Use "Pay Now" on a pending payment to confirm it in the system.
      </div>

      {/* Table */}
      {loading && payments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <tbody>{[1,2,3].map((i) => <SkeletonRow key={i} />)}</tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">💰</div>
          <p className="font-semibold text-gray-700">
            {payments.length === 0 ? 'No payment records yet' : 'No payments match this filter'}
          </p>
          <p className="text-sm text-gray-400 mt-1 max-w-xs">
            {payments.length === 0
              ? 'Payment records appear here after your orders are delivered.'
              : 'Try a different filter.'}
          </p>
          {payments.length === 0 && (
            <button onClick={() => navigate('/buyer/orders')} className="btn-primary mt-5 text-sm px-6">
              View Orders
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Order ID', 'Crop', 'Farmer', 'Order Date', 'Amount', 'Status', 'Payment Date', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-500">{p.orderId?.slice(-8).toUpperCase() || '—'}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-900">{p.cropName}</p>
                      {p.quantity && <p className="text-xs text-gray-400">{p.quantity} {p.unit}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{p.farmerName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{fmtDate(p.orderDate)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-agri-green">₹{p.amount?.toLocaleString()}</td>
                    <td className="px-4 py-3.5"><PaymentBadge status={p.status} /></td>
                    <td className="px-4 py-3.5 text-sm text-gray-500">{p.paidAt ? fmtDate(p.paidAt) : '—'}</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setSelected(p)}
                        className={`text-xs font-semibold whitespace-nowrap ${p.status === 'Pending' ? 'text-agri-green hover:underline' : 'text-gray-500 hover:underline'}`}>
                        {p.status === 'Pending' ? 'Pay Now →' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment detail modal */}
      {selected && (
        <PaymentDetailModal
          payment={selected}
          onClose={() => setSelected(null)}
          onNavigate={(orderId) => navigate(`/buyer/orders/${orderId}`)}
          onPaid={handlePaid}
        />
      )}
    </div>
  )
}
