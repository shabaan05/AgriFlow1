import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth.jsx'
import * as api  from '../../../services/transporterApi.js'
import { changePassword as apiChangePassword } from '../../../services/profileApi.js'
import PageHeader from '../../../components/ui/PageHeader.jsx'

const TABS = [
  { key: 'personal',  label: 'Personal' },
  { key: 'vehicle',  label: 'Vehicle' },
  { key: 'verify',   label: 'Verification' },
  { key: 'payment',  label: 'Payment' },
  { key: 'notif',    label: 'Notifications' },
  { key: 'settings', label: 'Settings' },
]

// ── Shared helpers ────────────────────────────────────────────────────────────
function Row({ label, value }) {
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right">{value || '—'}</span>
    </div>
  )
}

function Feedback({ type, message }) {
  if (!message) return null
  const cls = type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-800'
  return (
    <div className={`border text-sm font-medium px-4 py-3 rounded-xl mb-5 flex items-center gap-2 ${cls}`}>
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {type === 'error'
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />}
      </svg>
      {message}
    </div>
  )
}

function SaveButton({ loading, label }) {
  return (
    <button type="submit" disabled={loading}
      className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
          Saving…
        </>
      ) : (label || 'Save Changes')}
    </button>
  )
}

// ── 1. Personal ──────────────────────────────────────────────────────────────
function PersonalTab({ profile, transporterInfo, saveProfile, saveInfo, updateUser }) {
  const [form, setForm] = useState({ name: profile?.name || '', phone: profile?.phone || '' })
  const [infoForm, setInfoForm] = useState({
    address: transporterInfo?.address || '', city: transporterInfo?.city || '',
    state: transporterInfo?.state || '', pincode: transporterInfo?.pincode || '',
  })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      const updated = await saveProfile(form)
      updateUser(updated)
      await saveInfo(infoForm)
      setFeedback('Profile updated successfully.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  if (!profile) return <div className="card h-48 animate-pulse" />
  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'TR'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Feedback type={feedback.includes('success') ? 'success' : 'error'} message={feedback} />
      <div className="card mb-5 flex items-center gap-5">
        <div className="w-16 h-16 bg-agri-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile.name}</p>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <span className="status-badge bg-teal-100 text-teal-700 mt-1 text-xs">Transporter</span>
        </div>
      </div>
      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <input type="text" className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input type="email" className="input-field bg-gray-50" value={profile.email} disabled />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
          <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <input type="text" className="input-field" placeholder="Building / Street" value={infoForm.address} onChange={(e) => setInfoForm({ ...infoForm, address: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input type="text" className="input-field" placeholder="Pune" value={infoForm.city} onChange={(e) => setInfoForm({ ...infoForm, city: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input type="text" className="input-field" placeholder="Maharashtra" value={infoForm.state} onChange={(e) => setInfoForm({ ...infoForm, state: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
            <input type="text" className="input-field" placeholder="411001" value={infoForm.pincode} onChange={(e) => setInfoForm({ ...infoForm, pincode: e.target.value })} />
          </div>
        </div>
        <div className="pt-2"><SaveButton loading={loading} /></div>
      </div>
    </form>
  )
}

// ── 2. Vehicle ───────────────────────────────────────────────────────────────
function VehicleTab({ vehicleInfo, saveVehicle }) {
  const [form, setForm] = useState({
    vehicleType: vehicleInfo?.vehicleType || '', vehicleNumber: vehicleInfo?.vehicleNumber || '',
    capacity: vehicleInfo?.capacity || '', availability: vehicleInfo?.availability || '',
    description: vehicleInfo?.description || '',
  })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await saveVehicle(form)
      setFeedback('Vehicle details updated successfully.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  if (!vehicleInfo) return <div className="card h-48 animate-pulse" />

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Feedback type={feedback.includes('success') ? 'success' : 'error'} message={feedback} />
      <div className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Type</label>
            <input type="text" className="input-field" placeholder="Tata Ace" value={form.vehicleType} onChange={(e) => setForm({ ...form, vehicleType: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Number</label>
            <input type="text" className="input-field" placeholder="MH-09-AB-1234" value={form.vehicleNumber} onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Capacity</label>
            <input type="text" className="input-field" placeholder="750 kg" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
            <select className="input-field bg-white" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
              <option value="">Select status</option>
              <option>Available</option>
              <option>Unavailable</option>
              <option>On Trip</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle Description</label>
          <textarea rows={2} className="input-field resize-none" placeholder="Any additional details about your vehicle…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="pt-2"><SaveButton loading={loading} /></div>
      </div>
    </form>
  )
}

// ── 3. Verification ──────────────────────────────────────────────────────────
function VerifyTab({ verification, vehicleVerification, requestVerification }) {
  const [docType, setDocType] = useState('Driving License')
  const [vehicleCheck, setVehicleCheck] = useState(false)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  if (!verification) return <div className="card h-48 animate-pulse" />

  const status = verification.status || 'Not Verified'
  const cfg = {
    'Not Verified': { cls: 'bg-gray-100 text-gray-600', icon: '⏳', label: 'Not Verified' },
    Pending:        { cls: 'bg-amber-100 text-amber-700', icon: '🔄', label: 'Pending Review' },
    Verified:       { cls: 'bg-green-100 text-green-800', icon: '✓', label: 'Verified' },
  }[status] || { cls: 'bg-gray-100 text-gray-600', icon: '⏳', label: 'Not Verified' }

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await requestVerification({ documentType: docType, vehicleVerification: vehicleCheck })
      setFeedback('Verification request submitted.')
      setTimeout(() => setFeedback(''), 5000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <Feedback type={feedback.includes('submitted') ? 'success' : 'error'} message={feedback} />
      <div className="card mb-5 flex items-center gap-5">
        <div className="w-14 h-14 bg-agri-light rounded-2xl flex items-center justify-center text-3xl">{cfg.icon}</div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Account Verification</p>
          <span className={`status-badge text-xs mt-1 ${cfg.cls}`}>{cfg.label}</span>
        </div>
      </div>
      <div className="card mb-5">
        <Row label="Document Type" value={verification.documentType || '—'} />
        {verification.submittedAt && <Row label="Submitted On" value={new Date(verification.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {verification.verifiedAt && <Row label="Verified On" value={new Date(verification.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {verification.notes && <div className="pt-3"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-700">{verification.notes}</p></div>}
      </div>
      {/* Vehicle verification */}
      <div className="card mb-5">
        <Row label="Vehicle Verification" value={vehicleVerification || 'Not Verified'} />
      </div>
      {status !== 'Verified' && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
            <select className="input-field bg-white" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option>Driving License</option>
              <option>Aadhaar</option>
              <option>PAN Card</option>
              <option>Vehicle RC</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={vehicleCheck} onChange={(e) => setVehicleCheck(e.target.checked)}
              className="w-5 h-5 rounded-lg border-gray-300 text-agri-green focus:ring-agri-green/30" />
            Also request vehicle verification
          </label>
          <p className="text-xs text-gray-400">Document upload coming soon. This submits your verification request.</p>
          <SaveButton loading={loading} label="Request Verification" />
        </form>
      )}
    </div>
  )
}

// ── 4. Payment ───────────────────────────────────────────────────────────────
function PaymentTab({ paymentDetails, savePayment }) {
  const [form, setForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '', preferredMethod: '' })
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')
  const isSet = paymentDetails?.isSet

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await savePayment(form)
      setFeedback('Payment details saved successfully.')
      setForm({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '', preferredMethod: '' })
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  if (!paymentDetails) return <div className="card h-48 animate-pulse" />

  return (
    <div className="max-w-2xl">
      <Feedback type={feedback.includes('success') ? 'success' : 'error'} message={feedback} />
      {isSet && (
        <div className="card mb-5">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 pb-3 border-b border-gray-100">Current Payment Details</h3>
          <Row label="Account Holder" value={paymentDetails.accountHolderName} />
          <Row label="Bank Name" value={paymentDetails.bankName} />
          <Row label="Account Number" value={paymentDetails.accountNumber} />
          <Row label="IFSC Code" value={paymentDetails.ifscCode} />
          <Row label="UPI ID" value={paymentDetails.upiId} />
          <Row label="Preferred Method" value={paymentDetails.preferredMethod} />
          <p className="text-xs text-gray-400 mt-3">Details are masked. Enter new values below to update.</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100">
          {isSet ? 'Update Payment Details' : 'Add Payment Details'}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Holder Name</label>
            <input type="text" className="input-field" placeholder="Suresh Patil" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
            <input type="text" className="input-field" placeholder="State Bank of India" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
            <input type="text" className="input-field" placeholder="Enter full account number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
            <input type="text" className="input-field" placeholder="SBIN0001234" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
            <input type="text" className="input-field" placeholder="suresh@oksbi" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Method</label>
            <select className="input-field bg-white" value={form.preferredMethod} onChange={(e) => setForm({ ...form, preferredMethod: e.target.value })}>
              <option value="">Select method</option>
              <option>Bank Transfer</option>
              <option>UPI</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400">Leave blank to keep existing values.</p>
        <div className="pt-2"><SaveButton loading={loading} /></div>
      </form>
    </div>
  )
}

// ── 5. Notifications ─────────────────────────────────────────────────────────
function NotifTab({ profile, saveNotifPrefs }) {
  const [prefs, setPrefs] = useState(null)
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const prefsDefaults = { pickupAlerts: true, tripUpdates: true, pickupReminders: true, deliveryUpdates: true, earningsUpdates: true, systemNotifications: true }
  const currentPrefs  = prefs || profile?.notificationPrefs || prefsDefaults

  function Toggle({ field, label }) {
    return (
      <label className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 cursor-pointer">
        <span className="text-sm text-gray-700">{label}</span>
        <input type="checkbox" checked={currentPrefs[field] ?? true}
          onChange={(e) => setPrefs({ ...currentPrefs, [field]: e.target.checked })}
          className="w-5 h-5 rounded-lg border-gray-300 text-agri-green focus:ring-agri-green/30 cursor-pointer" />
      </label>
    )
  }

  async function handleSave() {
    setLoading(true)
    setFeedback('')
    try {
      await saveNotifPrefs(prefs || currentPrefs)
      setFeedback('Preferences saved.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-2xl">
      <div className="card space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100 mb-3">Notification Preferences</h3>
        <Feedback type={feedback.includes('saved') ? 'success' : 'error'} message={feedback} />
        <Toggle field="pickupAlerts"        label="Pickup request alerts" />
        <Toggle field="tripUpdates"         label="Trip updates" />
        <Toggle field="pickupReminders"     label="Pickup reminders" />
        <Toggle field="deliveryUpdates"     label="Delivery updates" />
        <Toggle field="earningsUpdates"     label="Earnings updates" />
        <Toggle field="systemNotifications" label="System notifications" />
        <div className="pt-3">
          <button onClick={handleSave} disabled={loading} className="btn-outline text-sm disabled:opacity-60">
            {loading ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── 6. Settings ──────────────────────────────────────────────────────────────
function SettingsTab({ logout }) {
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwFeedback, setPwFeedback] = useState('')

  async function handlePasswordChange(e) {
    e.preventDefault()
    setPwFeedback('')
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwFeedback('New passwords do not match.')
      return
    }
    setPwLoading(true)
    try {
      await apiChangePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      setPwFeedback('Password changed successfully.')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwFeedback(''), 4000)
    } catch (err) {
      setPwFeedback(err.message)
    } finally { setPwLoading(false) }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form onSubmit={handlePasswordChange} className="card space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100">Change Password</h3>
        <Feedback type={pwFeedback.includes('success') ? 'success' : 'error'} message={pwFeedback} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password *</label>
          <input type="password" className="input-field" required value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password *</label>
            <input type="password" className="input-field" required minLength={6} value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password *</label>
            <input type="password" className="input-field" required value={pwForm.confirmPassword} onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} />
          </div>
        </div>
        <div className="pt-2"><SaveButton loading={pwLoading} label="Change Password" /></div>
      </form>

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pb-3 border-b border-gray-100">Account</h3>
        <button onClick={logout}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────
export default function TransporterProfile() {
  const navigate     = useNavigate()
  const { user, logout, updateUser } = useAuth()
  const [tab, setTab] = useState('personal')
  const [profile,        setProfile]        = useState(null)
  const [transporterInfo, setTransporterInfo] = useState(null)
  const [vehicleInfo,     setVehicleInfo]     = useState(null)
  const [verification,   setVerification]   = useState(null)
  const [vehicleVerification, setVehicleVerification] = useState('Not Verified')
  const [paymentDetails,  setPaymentDetails]  = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')

  useEffect(() => {
    Promise.all([
      api.fetchTransporterProfile(),
      api.fetchTransporterInfo(),
      api.fetchVehicleInfo(),
      api.fetchTransporterVerification(),
      api.fetchTransporterPaymentDetails(),
    ])
      .then(([p, t, v, ver, pd]) => {
        setProfile(p.profile)
        setTransporterInfo(t.transporterInfo)
        setVehicleInfo(v.vehicleInfo)
        setVerification(ver.verification)
        setVehicleVerification(ver.vehicleVerification)
        setPaymentDetails(pd.paymentDetails)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function saveProfile(data) {
    const res = await api.updateTransporterProfile(data)
    setProfile(res.profile)
    return res.profile
  }

  async function saveInfo(data) {
    const res = await api.updateTransporterInfo(data)
    setTransporterInfo(res.transporterInfo)
    return res.transporterInfo
  }

  async function saveVehicle(data) {
    const res = await api.updateVehicleInfo(data)
    setVehicleInfo(res.vehicleInfo)
    return res.vehicleInfo
  }

  async function requestVerification(data) {
    const res = await api.submitTransporterVerification(data)
    setVerification(res.verification)
    setVehicleVerification(res.vehicleVerification)
    return res
  }

  async function savePayment(data) {
    const res = await api.updateTransporterPaymentDetails(data)
    setPaymentDetails(res.paymentDetails)
    return res.paymentDetails
  }

  async function saveNotifPrefs(data) {
    const res = await api.updateTransporterNotifPrefs(data)
    return res.notificationPrefs
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your personal info, vehicle, verification, and settings." />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>
      )}

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap
              ${tab === t.key ? 'bg-white text-agri-green shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card h-48 animate-pulse" />
      ) : (
        <>
          {tab === 'personal' && <PersonalTab profile={profile} transporterInfo={transporterInfo} saveProfile={saveProfile} saveInfo={saveInfo} updateUser={updateUser} />}
          {tab === 'vehicle'   && <VehicleTab vehicleInfo={vehicleInfo} saveVehicle={saveVehicle} />}
          {tab === 'verify'    && <VerifyTab verification={verification} vehicleVerification={vehicleVerification} requestVerification={requestVerification} />}
          {tab === 'payment'   && <PaymentTab paymentDetails={paymentDetails} savePayment={savePayment} />}
          {tab === 'notif'     && <NotifTab profile={profile} saveNotifPrefs={saveNotifPrefs} />}
          {tab === 'settings'  && <SettingsTab logout={logout} />}
        </>
      )}
    </div>
  )
}
