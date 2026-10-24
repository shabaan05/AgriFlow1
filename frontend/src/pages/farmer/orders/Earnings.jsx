import React, { useState } from 'react'
import { useOrders }    from '../../../context/OrdersContext.jsx'
import PageHeader       from '../../../components/ui/PageHeader.jsx'
import ConfirmDialog    from '../../../components/orders/ConfirmDialog.jsx'

const paymentBadge = {
  Pending: 'bg-amber-100 text-amber-700',
  Paid:    'bg-green-100 text-green-800',
  Failed:  'bg-red-100 text-red-700',
}

// ── KPI card ─────────────────────────────────────────────────────────────────
function EarningsKPI({ label, value, sub, color }) {
  const colors = {
    green:  'bg-green-50  text-agri-green',
    amber:  'bg-amber-50  text-amber-700',
    blue:   'bg-blue-50   text-blue-700',
    gray:   'bg-gray-50   text-gray-600',
  }
  return (
    <div className={`rounded-2xl px-5 py-5 ${colors[color] || colors.gray}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium mt-0.5 opacity-75">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Transaction row ───────────────────────────────────────────────────────────
function TxRow({ tx, onMarkPaid }) {
  const date = new Date(tx.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
  return (
    <tr className="hover:bg-gray-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <p className="text-xs font-mono text-gray-500">{tx.orderId?.slice(-8).toUpperCase() || '—'}</p>
      </td>
      <td className="px-4 py-3.5 text-sm font-medium text-gray-800">{tx.cropName}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{tx.buyerName}</td>
      <td className="px-4 py-3.5 text-sm font-semibold text-agri-green">
        ₹{tx.amount.toLocaleString()}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-500">{date}</td>
      <td className="px-4 py-3.5">
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${paymentBadge[tx.status] || paymentBadge.Pending}`}>
          {tx.status}
        </span>
      </td>
      <td className="px-4 py-3.5">
        {tx.status === 'Pending' && (
          <button
            onClick={() => onMarkPaid(tx)}
            className="text-xs font-semibold text-agri-green hover:underline"
          >
            Mark Paid
          </button>
        )}
      </td>
    </tr>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Earnings() {
  const { earnings, loading, error, markPaymentPaid } = useOrders()

  const [payTarget, setPayTarget] = useState(null)
  const [acting,    setActing]    = useState(false)
  const [feedback,  setFeedback]  = useState('')

  const summary = earnings?.summary || {}
  const txns    = earnings?.transactions || []

  const [filter, setFilter] = useState('All')
  const shown = filter === 'All' ? txns : txns.filter((t) => t.status === filter)

  async function handleMarkPaid() {
    if (!payTarget) return
    setActing(true)
    try {
      await markPaymentPaid(payTarget.id)
      setFeedback(`Payment of ₹${payTarget.amount.toLocaleString()} marked as Paid.`)
      setPayTarget(null)
      setTimeout(() => setFeedback(''), 4000)
    } catch (e) {
      setFeedback(`Error: ${e.message}`)
    } finally {
      setActing(false)
    }
  }

  return (
    <div>
      <PageHeader title="Earnings" subtitle="Your revenue, transactions and payment status." />

      {feedback && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm font-medium
                        px-4 py-3 rounded-xl flex items-center gap-2 mb-5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {feedback}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [1,2,3,4].map((i) => <div key={i} className="rounded-2xl h-20 bg-gray-100 animate-pulse" />)
        ) : (
          <>
            <EarningsKPI label="Total Earnings"    value={`₹${(summary.totalEarnings || 0).toLocaleString()}`}   color="green" />
            <EarningsKPI label="Pending Payments"  value={`₹${(summary.pendingPayments || 0).toLocaleString()}`} color="amber" />
            <EarningsKPI label="Completed Sales"   value={summary.completedSales || 0}                            color="blue"  />
            <EarningsKPI label="Total Transactions" value={summary.totalTransactions || 0}                        color="gray"  />
          </>
        )}
      </div>

      {/* Filter + table */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', 'Pending', 'Paid', 'Failed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors
              ${filter === f
                ? 'bg-agri-green text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-agri-green/40'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && txns.length === 0 ? (
        <div className="space-y-3">{[1,2,3].map((i) => <div key={i} className="card h-12 animate-pulse" />)}</div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">💰</div>
          <p className="font-semibold text-gray-700">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">Completed deliveries generate payment records here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Order ID', 'Crop', 'Buyer', 'Amount', 'Date', 'Payment', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {shown.map((tx) => (
                  <TxRow key={tx.id} tx={tx} onMarkPaid={setPayTarget} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {payTarget && (
        <ConfirmDialog
          title="Mark Payment as Paid?"
          message={`Mark ₹${payTarget.amount.toLocaleString()} from ${payTarget.buyerName} as Paid?`}
          confirmLabel="Mark Paid"
          onConfirm={handleMarkPaid}
          onCancel={() => setPayTarget(null)}
          loading={acting}
        />
      )}
    </div>
  )
}
