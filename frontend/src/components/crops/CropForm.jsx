/**
 * CropForm — shared form component used by both AddCrop and EditCrop.
 * Props:
 *   initialData  — object with existing crop values (for edit mode)
 *   onSubmit(data) — called with validated form data
 *   onCancel()   — called when user cancels
 *   isEdit       — boolean, controls submit button label
 *   loading      — boolean, disables submit while saving
 */
import React, { useState } from 'react'
import { CROP_CATEGORIES, QUALITY_GRADES, UNITS, CROP_STATUSES } from '../../data/cropData.js'

const EMPTY_FORM = {
  name:                '',
  variety:             '',
  category:            'Vegetables',
  totalQty:            '',
  availableQty:        '',
  unit:                'kg',
  expectedHarvestDate: '',
  shelfLifeDays:       '',
  expectedPrice:       '',
  minPrice:            '',
  farmLocation:        '',
  grade:               'Grade A',
  status:              'Pre-Harvest',
  notes:               '',
}

function FormSection({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">
        {title}
      </h3>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function CropForm({ initialData = {}, onSubmit, onCancel, isEdit = false, loading = false }) {
  const [form, setForm]     = useState({ ...EMPTY_FORM, ...initialData })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // ── Validation ──────────────────────────────────────────────────────────
  function validate() {
    const e = {}
    if (!form.name.trim())                    e.name           = 'Crop name is required.'
    if (!form.category)                       e.category       = 'Category is required.'
    if (!form.totalQty || Number(form.totalQty) <= 0)
                                              e.totalQty       = 'Total quantity must be greater than 0.'
    if (form.availableQty === '' || Number(form.availableQty) < 0)
                                              e.availableQty   = 'Available quantity is required.'
    if (Number(form.availableQty) > Number(form.totalQty))
                                              e.availableQty   = 'Cannot exceed total quantity.'
    if (!form.unit)                           e.unit           = 'Unit is required.'
    if (!form.expectedHarvestDate)            e.expectedHarvestDate = 'Harvest date is required.'
    if (!form.expectedPrice || Number(form.expectedPrice) <= 0)
                                              e.expectedPrice  = 'Expected price is required.'
    if (form.minPrice && Number(form.minPrice) > Number(form.expectedPrice))
                                              e.minPrice       = 'Min price cannot exceed expected price.'
    if (!form.farmLocation.trim())            e.farmLocation   = 'Farm location is required.'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      // scroll to first error
      const firstKey = Object.keys(errs)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onSubmit({
      ...form,
      totalQty:      Number(form.totalQty),
      availableQty:  Number(form.availableQty),
      expectedPrice: Number(form.expectedPrice),
      minPrice:      form.minPrice ? Number(form.minPrice) : 0,
      shelfLifeDays: form.shelfLifeDays ? Number(form.shelfLifeDays) : 0,
    })
  }

  const inputCls  = (field) =>
    `input-field ${errors[field] ? 'border-red-400 focus:ring-red-400' : ''}`
  const selectCls = (field) =>
    `input-field bg-white ${errors[field] ? 'border-red-400' : ''}`

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Basic Info ── */}
      <FormSection title="Basic Information">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Crop Name" required>
            <input
              id="field-name"
              type="text"
              className={inputCls('name')}
              placeholder="e.g. Tomato"
              value={form.name}
              onChange={set('name')}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </Field>

          <Field label="Variety">
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Hybrid Roma"
              value={form.variety}
              onChange={set('variety')}
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Category" required>
            <select id="field-category" className={selectCls('category')} value={form.category} onChange={set('category')}>
              {CROP_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </Field>

          <Field label="Quality Grade">
            <select className={selectCls('grade')} value={form.grade} onChange={set('grade')}>
              {QUALITY_GRADES.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Farm Location" required>
          <input
            id="field-farmLocation"
            type="text"
            className={inputCls('farmLocation')}
            placeholder="e.g. Nashik, Maharashtra"
            value={form.farmLocation}
            onChange={set('farmLocation')}
          />
          {errors.farmLocation && <p className="text-xs text-red-500 mt-1">{errors.farmLocation}</p>}
        </Field>
      </FormSection>

      {/* ── Quantity ── */}
      <FormSection title="Quantity">
        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Total Quantity" required>
            <input
              id="field-totalQty"
              type="number"
              min="0"
              className={inputCls('totalQty')}
              placeholder="800"
              value={form.totalQty}
              onChange={set('totalQty')}
            />
            {errors.totalQty && <p className="text-xs text-red-500 mt-1">{errors.totalQty}</p>}
          </Field>

          <Field label="Available Quantity" required>
            <input
              id="field-availableQty"
              type="number"
              min="0"
              className={inputCls('availableQty')}
              placeholder="800"
              value={form.availableQty}
              onChange={set('availableQty')}
            />
            {errors.availableQty && <p className="text-xs text-red-500 mt-1">{errors.availableQty}</p>}
          </Field>

          <Field label="Unit" required>
            <select id="field-unit" className={selectCls('unit')} value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
            {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
          </Field>
        </div>
      </FormSection>

      {/* ── Harvest & Shelf Life ── */}
      <FormSection title="Harvest & Shelf Life">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Expected Harvest Date" required>
            <input
              id="field-expectedHarvestDate"
              type="date"
              className={inputCls('expectedHarvestDate')}
              value={form.expectedHarvestDate}
              onChange={set('expectedHarvestDate')}
            />
            {errors.expectedHarvestDate && (
              <p className="text-xs text-red-500 mt-1">{errors.expectedHarvestDate}</p>
            )}
          </Field>

          <Field label="Expected Shelf Life (days)" hint="How many days the crop stays fresh after harvest">
            <input
              type="number"
              min="1"
              className="input-field"
              placeholder="7"
              value={form.shelfLifeDays}
              onChange={set('shelfLifeDays')}
            />
          </Field>
        </div>
      </FormSection>

      {/* ── Pricing ── */}
      <FormSection title="Pricing">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Expected Price / unit (₹)" required>
            <input
              id="field-expectedPrice"
              type="number"
              min="0"
              className={inputCls('expectedPrice')}
              placeholder="25"
              value={form.expectedPrice}
              onChange={set('expectedPrice')}
            />
            {errors.expectedPrice && <p className="text-xs text-red-500 mt-1">{errors.expectedPrice}</p>}
          </Field>

          <Field label="Minimum Acceptable Price / unit (₹)" hint="Lowest price you will accept from a buyer">
            <input
              id="field-minPrice"
              type="number"
              min="0"
              className={inputCls('minPrice')}
              placeholder="20"
              value={form.minPrice}
              onChange={set('minPrice')}
            />
            {errors.minPrice && <p className="text-xs text-red-500 mt-1">{errors.minPrice}</p>}
          </Field>
        </div>
      </FormSection>

      {/* ── Status (edit only) + Notes ── */}
      <FormSection title="Status & Notes">
        {isEdit && (
          <Field label="Crop Status">
            <select className="input-field bg-white" value={form.status} onChange={set('status')}>
              {CROP_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        )}

        <Field label="Notes / Additional Info">
          <textarea
            rows={3}
            className="input-field resize-none"
            placeholder="Any additional details about this crop, storage conditions, special requirements…"
            value={form.notes}
            onChange={set('notes')}
          />
        </Field>
      </FormSection>

      {/* ── Images placeholder ── */}
      <FormSection title="Images">
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center
                        hover:border-agri-green/40 transition-colors">
          <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">Image upload coming soon</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload photos of your crop for buyer verification (feature in next module)
          </p>
        </div>
      </FormSection>

      {/* ── Form Actions ── */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline px-6"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary px-8 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Saving…
            </>
          ) : (isEdit ? 'Save Changes' : 'Add Crop')}
        </button>
      </div>
    </form>
  )
}
