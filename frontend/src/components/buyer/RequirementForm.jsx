/**
 * RequirementForm — shared form for Create and Edit Requirement.
 * Props:
 *   initialData  — existing values (edit mode)
 *   onSubmit(data) — called with validated payload
 *   onCancel()
 *   isEdit       — boolean
 *   loading      — boolean
 */
import React, { useState } from 'react'

const CATEGORIES = ['', 'Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const GRADES     = ['', 'Grade A', 'Grade B', 'Grade C', 'Any']
const UNITS      = ['kg', 'quintal', 'ton', 'bag', 'piece']

const EMPTY = {
  cropName: '', variety: '', category: '',
  quantity: '', unit: 'kg', qualityGrade: '',
  minPricePerKg: '', maxPricePerKg: '',
  requiredByDate: '', deliveryLocation: '', notes: '',
}

function FormSection({ title, children }) {
  return (
    <div className="card mb-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-3 border-b border-gray-100">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

function Field({ label, required, hint, children }) {
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

export default function RequirementForm({ initialData = {}, onSubmit, onCancel, isEdit = false, loading = false }) {
  const [form, setForm]     = useState({ ...EMPTY, ...initialData })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  function validate() {
    const e = {}
    if (!form.cropName.trim())           e.cropName         = 'Crop name is required.'
    if (!form.quantity || Number(form.quantity) <= 0)
                                          e.quantity         = 'Quantity must be greater than 0.'
    if (!form.requiredByDate)             e.requiredByDate   = 'Required by date is required.'
    if (!form.deliveryLocation.trim())    e.deliveryLocation = 'Delivery location is required.'
    if (form.minPricePerKg && form.maxPricePerKg &&
        Number(form.minPricePerKg) > Number(form.maxPricePerKg)) {
      e.maxPricePerKg = 'Max price must be ≥ min price.'
    }
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      document.getElementById(`field-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    onSubmit({
      cropName:         form.cropName.trim(),
      variety:          form.variety,
      category:         form.category,
      quantity:         Number(form.quantity),
      unit:             form.unit,
      qualityGrade:     form.qualityGrade,
      minPricePerKg:    form.minPricePerKg ? Number(form.minPricePerKg) : null,
      maxPricePerKg:    form.maxPricePerKg ? Number(form.maxPricePerKg) : null,
      requiredByDate:   form.requiredByDate,
      deliveryLocation: form.deliveryLocation.trim(),
      notes:            form.notes,
    })
  }

  const cls  = (f) => `input-field ${errors[f] ? 'border-red-400 focus:ring-red-400' : ''}`
  const scls = (f) => `input-field bg-white ${errors[f] ? 'border-red-400' : ''}`
  const err  = (f) => errors[f] && <p className="text-xs text-red-500 mt-1">{errors[f]}</p>

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Crop */}
      <FormSection title="Crop Details">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Crop Name" required>
            <input id="field-cropName" type="text" className={cls('cropName')} placeholder="e.g. Tomato"
              value={form.cropName} onChange={set('cropName')} />
            {err('cropName')}
          </Field>
          <Field label="Variety">
            <input type="text" className="input-field" placeholder="e.g. Hybrid Roma"
              value={form.variety} onChange={set('variety')} />
          </Field>
        </div>
        <Field label="Category">
          <select className={scls('category')} value={form.category} onChange={set('category')}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || 'Select category'}</option>)}
          </select>
        </Field>
      </FormSection>

      {/* Quantity */}
      <FormSection title="Quantity">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Required Quantity" required>
            <input id="field-quantity" type="number" min="0" className={cls('quantity')}
              placeholder="1000" value={form.quantity} onChange={set('quantity')} />
            {err('quantity')}
          </Field>
          <Field label="Unit" required>
            <select className="input-field bg-white" value={form.unit} onChange={set('unit')}>
              {UNITS.map((u) => <option key={u}>{u}</option>)}
            </select>
          </Field>
        </div>
      </FormSection>

      {/* Quality & Price */}
      <FormSection title="Quality & Price">
        <Field label="Quality Grade">
          <select className="input-field bg-white" value={form.qualityGrade} onChange={set('qualityGrade')}>
            {GRADES.map((g) => <option key={g} value={g}>{g || 'Any grade'}</option>)}
          </select>
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Min Price / unit (₹)" hint="Leave blank if flexible">
            <input type="number" min="0" className="input-field" placeholder="20"
              value={form.minPricePerKg} onChange={set('minPricePerKg')} />
          </Field>
          <Field label="Max Price / unit (₹)" hint="Maximum you're willing to pay">
            <input id="field-maxPricePerKg" type="number" min="0" className={cls('maxPricePerKg')}
              placeholder="35" value={form.maxPricePerKg} onChange={set('maxPricePerKg')} />
            {err('maxPricePerKg')}
          </Field>
        </div>
      </FormSection>

      {/* Timeline & Delivery */}
      <FormSection title="Timeline & Delivery">
        <Field label="Required By Date" required>
          <input id="field-requiredByDate" type="date" className={cls('requiredByDate')}
            value={form.requiredByDate} onChange={set('requiredByDate')} />
          {err('requiredByDate')}
        </Field>
        <Field label="Delivery Location" required>
          <input id="field-deliveryLocation" type="text" className={cls('deliveryLocation')}
            placeholder="e.g. Pune, Maharashtra" value={form.deliveryLocation} onChange={set('deliveryLocation')} />
          {err('deliveryLocation')}
        </Field>
      </FormSection>

      {/* Notes */}
      <FormSection title="Additional Information">
        <Field label="Notes / Special Requirements">
          <textarea rows={3} className="input-field resize-none"
            placeholder="Any specific requirements about ripeness, packaging, variety preference…"
            value={form.notes} onChange={set('notes')} />
        </Field>
      </FormSection>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <button type="button" onClick={onCancel} className="btn-outline px-6">Cancel</button>
        <button type="submit" disabled={loading}
          className="btn-primary px-8 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Saving…
            </>
          ) : (isEdit ? 'Save Changes' : 'Create Requirement')}
        </button>
      </div>
    </form>
  )
}
