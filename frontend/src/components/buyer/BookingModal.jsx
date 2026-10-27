/**
 * BookingModal — inline booking form shown over the Crop Detail page.
 * Uses the existing POST /api/bookings endpoint.
 * Buyer's identity comes from JWT — not entered in the form.
 */
import React, { useState } from 'react'
import { createBooking } from '../../services/ordersApi.js'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function BookingModal({ crop, onSuccess, onClose }) {
  const { user } = useAuth()

  const [form, setForm] = useState({
    quantity: '',
    pricePerUnit: crop.expectedPrice || '',
    deliveryLocation: '',
    requestedDeliveryDate: '',
    notes: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const availQty = crop.availableQty || 0
  const totalCalc = form.quantity && form.pricePerUnit
    ? (Number(form.quantity) * Number(form.pricePerUnit)).toLocaleString()
    : '—'

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.quantity || Number(form.quantity) <= 0) e.quantity = 'Quantity must be greater than 0.'
    if (Number(form.quantity) > availQty) e.quantity = `Cannot exceed available quantity (${availQty} ${crop.unit}).`
    if (!form.pricePerUnit || Number(form.pricePerUnit) <= 0) e.pricePerUnit = 'Price is required.'
    if (!form.deliveryLocation.trim()) e.deliveryLocation = 'Delivery location is required.'
    if (!form.requestedDeliveryDate) e.requestedDeliveryDate = 'Delivery date is required.'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    setLoading(true)
    try {
      const booking = await createBooking({
        cropId: crop.id,
        farmerId: crop.farmer?.id || undefined,
        // buyerName etc. derived from JWT on backend; send as backup
        buyerName: user?.name || 'Buyer',
        buyerCompany: '',
        buyerContact: user?.phone || '',
        quantity: Number(form.quantity),
        pricePerUnit: Number(form.pricePerUnit),
        deliveryLocation: form.deliveryLocation,
        requestedDeliveryDate: form.requestedDeliveryDate,
        notes: form.notes,
      })
      onSuccess(booking)
    } catch (err) {
      setApiError(err.message || 'Failed to create booking. Please try again.')
      setLoading(false)
    }
  }

  const inputCls = (f) => `input-field ${errors[f] ? 'border-red-400 focus:ring-red-400' : ''}`

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Book / Pre-book</h2>
            <p className="text-sm text-gray-500 mt-0.5">{crop.name}{crop.variety ? ` · ${crop.variety}` : ''}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Crop summary */}
        <div className="px-6 pt-4 pb-2">
          <div className="bg-agri-light rounded-2xl p-4 grid grid-cols-2 gap-3 text-xs">
            {[
              { l: 'Available Qty', v: `${availQty} ${crop.unit}` },
              { l: 'Listed Price', v: `₹${crop.expectedPrice}/${crop.unit}` },
              { l: 'Grade', v: crop.grade },
              { l: 'Harvest Date', v: crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—' },
              { l: 'Farmer', v: crop.farmer?.name || '—' },
              { l: 'Verified', v: crop.farmer?.verification === 'Verified' ? '✓ Yes' : 'No' },
            ].map(({ l, v }) => (
              <div key={l}>
                <p className="text-gray-400">{l}</p>
                <p className="font-semibold text-gray-800 mt-0.5">{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {apiError}
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Quantity ({crop.unit}) *
              </label>
              <input type="number" min="1" max={availQty} className={inputCls('quantity')}
                placeholder={`Max ${availQty}`} value={form.quantity} onChange={set('quantity')} />
              {errors.quantity && <p className="text-xs text-red-500 mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Offered Price / {crop.unit} (₹) *
              </label>
              <input type="number" min="0" step="0.01" className={inputCls('pricePerUnit')}
                placeholder={crop.expectedPrice} value={form.pricePerUnit} onChange={set('pricePerUnit')} />
              {errors.pricePerUnit && <p className="text-xs text-red-500 mt-1">{errors.pricePerUnit}</p>}
            </div>
          </div>

          {/* Total amount indicator */}
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex justify-between items-center">
            <span className="text-sm text-gray-500">Estimated Total</span>
            <span className="text-lg font-bold text-agri-green">₹{totalCalc}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Location *</label>
            <input type="text" className={inputCls('deliveryLocation')}
              placeholder="e.g. Pune, Maharashtra" value={form.deliveryLocation} onChange={set('deliveryLocation')} />
            {errors.deliveryLocation && <p className="text-xs text-red-500 mt-1">{errors.deliveryLocation}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Requested Delivery Date *</label>
            <input type="date" className={inputCls('requestedDeliveryDate')}
              value={form.requestedDeliveryDate} onChange={set('requestedDeliveryDate')} />
            {errors.requestedDeliveryDate && <p className="text-xs text-red-500 mt-1">{errors.requestedDeliveryDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes / Special Requirements</label>
            <textarea rows={2} className="input-field resize-none"
              placeholder="Any special requirements about quality, packaging, delivery…"
              value={form.notes} onChange={set('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 rounded-xl bg-agri-green text-white text-sm font-semibold hover:bg-agri-dark transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Sending…
                </>
              ) : 'Send Booking Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
