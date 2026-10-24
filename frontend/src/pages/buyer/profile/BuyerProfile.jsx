import React, { useState } from 'react'
import { BuyerProfileProvider, useBuyerProfile } from '../../../context/BuyerProfileContext.jsx'
import { useAuth }             from '../../../hooks/useAuth.jsx'
import { changePassword as apiChangePassword } from '../../../services/profileApi.js'
import PageHeader              from '../../../components/ui/PageHeader.jsx'

const TABS = [
  { key: 'personal',  label: 'Personal / Business' },
  { key: 'business',  label: 'Business Details' },
  { key: 'verify',    label: 'Verification' },
  { key: 'payment',   label: 'Payment' },
  { key: 'notif',     label: 'Notifications' },
  { key: 'settings',  label: 'Settings' },
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
  const cls = type === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-green-50 border-green-200 text-green-800'
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

// ── 1. Personal Info ──────────────────────────────────────────────────────────
function PersonalTab() {
  const { profile, saveProfile }  = useBuyerProfile()
  const { updateUser }            = useAuth()
  const [form, setForm]           = useState({ name: profile?.name || '', phone: profile?.phone || '' })
  const [loading, setLoading]     = useState(false)
  const [feedback, setFeedback]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      const updated = await saveProfile(form)
      updateUser(updated)
      setFeedback('Profile updated successfully.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  if (!profile) return <div className="card h-48 animate-pulse" />

  const initials = profile.name ? profile.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'BK'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Feedback type={feedback.includes('success') ? 'success' : 'error'} message={feedback} />

      {/* Avatar strip */}
      <div className="card mb-5 flex items-center gap-5">
        <div className="w-16 h-16 bg-agri-green rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile.name}</p>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <span className="status-badge bg-blue-100 text-blue-800 mt-1 text-xs">Buyer</span>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name / Contact Person *</label>
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
        <div className="pt-2"><SaveButton loading={loading} /></div>
      </div>
    </form>
  )
}

// ── 2. Business Info ──────────────────────────────────────────────────────────
function BusinessTab() {
  const { buyerInfo, saveBuyerInfo } = useBuyerProfile()
  const [form, setForm] = useState({
    companyName:  buyerInfo?.companyName  || '',
    businessType: buyerInfo?.businessType || '',
    address:      buyerInfo?.address      || '',
    city:         buyerInfo?.city         || '',
    state:        buyerInfo?.state        || '',
    pincode:      buyerInfo?.pincode      || '',
    gstNumber:    buyerInfo?.gstNumber    || '',
    description:  buyerInfo?.description  || '',
  })
  const [loading, setLoading]   = useState(false)
  const [feedback, setFeedback] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await saveBuyerInfo(form)
      setFeedback('Business information updated successfully.')
      setTimeout(() => setFeedback(''), 4000)
    } catch (err) {
      setFeedback(err.message)
    } finally { setLoading(false) }
  }

  if (!buyerInfo) return <div className="card h-48 animate-pulse" />

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Feedback type={feedback.includes('success') ? 'success' : 'error'} message={feedback} />
      <div className="card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company / Business Name</label>
            <input type="text" className="input-field" placeholder="FreshMart Pvt Ltd" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
            <select className="input-field bg-white" value={form.businessType} onChange={(e) => setForm({ ...form, businessType: e.target.value })}>
              <option value="">Select type</option>
              <option>Wholesale</option>
              <option>Retail</option>
              <option>Export</option>
              <option>Restaurant / Hotel</option>
              <option>Processing Unit</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <input type="text" className="input-field" placeholder="Building / Street" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
            <input type="text" className="input-field" placeholder="Pune" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
            <input type="text" className="input-field" placeholder="Maharashtra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode</label>
            <input type="text" className="input-field" placeholder="411001" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label>
          <input type="text" className="input-field" placeholder="27AAAAA0000A1Z5" value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description</label>
          <textarea rows={3} className="input-field resize-none" placeholder="Brief description of your business and procurement needs…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="pt-2"><SaveButton loading={loading} /></div>
      </div>
    </form>
  )
}

// ── 3. Verification ──────────────────────────────────────────────────────────
function VerifyTab() {
  const { verification, requestVerification } = useBuyerProfile()
  const [docType, setDocType]   = useState('GST Certificate')
  const [loading, setLoading]   = useState(false)
  const [feedback, setFeedback] = useState('')

  if (!verification) return <div className="card h-48 animate-pulse" />

  const status = verification.status || 'Not Verified'
  const statusConfig = {
    'Not Verified': { cls: 'bg-gray-100 text-gray-600',  icon: '⏳', label: 'Not Verified' },
    Pending:        { cls: 'bg-amber-100 text-amber-700', icon: '🔄', label: 'Pending Review' },
    Verified:       { cls: 'bg-green-100 text-green-800', icon: '✓',  label: 'Verified' },
  }
  const cfg = statusConfig[status] || statusConfig['Not Verified']

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await requestVerification({ documentType: docType })
      setFeedback('Verification request submitted. You will be notified when verified.')
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
          <p className="font-semibold text-gray-900">Verification Status</p>
          <span className={`status-badge text-xs mt-1 ${cfg.cls}`}>{cfg.label}</span>
        </div>
      </div>
      <div className="card mb-5">
        <Row label="Document Type"  value={verification.documentType || '—'} />
        {verification.submittedAt && <Row label="Submitted On" value={new Date(verification.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {verification.verifiedAt && <Row label="Verified On"  value={new Date(verification.verifiedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} />}
        {verification.notes && <div className="pt-3"><p className="text-xs text-gray-400 mb-1">Notes</p><p className="text-sm text-gray-700">{verification.notes}</p></div>}
      </div>
      {status !== 'Verified' && (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type for Verification</label>
            <select className="input-field bg-white" value={docType} onChange={(e) => setDocType(e.target.value)}>
              <option>GST Certificate</option>
              <option>PAN Card</option>
              <option>Trade License</option>
              <option>FSSAI License</option>
              <option>Aadhaar</option>
            </select>
            <p className="text-xs text-gray-400 mt-2">Document upload coming soon. This submits your verification request.</p>
          </div>
          <SaveButton loading={loading} label="Request Verification" />
        </form>
      )}
    </div>
  )
}

// ── 4. Payment Details ───────────────────────────────────────────────────────
function PaymentTab() {
  const { paymentDetails, savePaymentDetails } = useBuyerProfile()
  const [form, setForm] = useState({ accountHolderName: '', bankName: '', accountNumber: '', ifscCode: '', upiId: '', preferredMethod: '' })
  const [loading, setLoading]   = useState(false)
  const [feedback, setFeedback] = useState('')
  const isSet = paymentDetails?.isSet

  async function handleSubmit(e) {
    e.preventDefault()
    setFeedback('')
    setLoading(true)
    try {
      await savePaymentDetails(form)
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
          <Row label="Account Holder"    value={paymentDetails.accountHolderName} />
          <Row label="Bank Name"         value={paymentDetails.bankName} />
          <Row label="Account Number"    value={paymentDetails.accountNumber} />
          <Row label="IFSC Code"         value={paymentDetails.ifscCode} />
          <Row label="UPI ID"            value={paymentDetails.upiId} />
          <Row label="Preferred Method"  value={paymentDetails.preferredMethod} />
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
            <input type="text" className="input-field" placeholder="Rajesh Mehta" value={form.accountHolderName} onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
            <input type="text" className="input-field" placeholder="HDFC Bank" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
            <input type="text" className="input-field" placeholder="Enter full account number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
            <input type="text" className="input-field" placeholder="HDFC0001234" value={form.ifscCode} onChange={(e) => setForm({ ...form, ifscCode: e.target.value })} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
            <input type="text" className="input-field" placeholder="rajesh@hdfcbank" value={form.upiId} onChange={(e) => setForm({ ...form, upiId: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preferred Method</label>
            <select className="input-field bg-white" value={form.preferredMethod} onChange={(e) => setForm({ ...form, preferredMethod: e.target.value })}>
              <option value="">Select method</option>
              <option>Bank Transfer</option>
              <option>UPI</option>
              <option>Cash</option>
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
function NotifTab() {
  const { notifications, unreadCount, readNotification, readAllNotifications } = useBuyerProfile()
  const typeIcon = { booking: '📋', order: '📦', payment: '💰', pickup: '🚛', system: '🔔' }
  const timeAgo = (d) => {
    const mins = Math.floor((Date.now() - new Date(d)) / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{unreadCount} unread</p>
        {unreadCount > 0 && (
          <button onClick={readAllNotifications} className="text-sm font-semibold text-agri-green hover:underline">Mark all as read</button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-agri-light rounded-2xl flex items-center justify-center text-3xl mb-4">🔔</div>
          <p className="font-semibold text-gray-700">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} onClick={() => !n.isRead && readNotification(n.id)}
              className={`card cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'border-agri-green/30 bg-agri-light/20' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {typeIcon[n.type] || '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{n.title}</p>
                    {!n.isRead && <span className="w-2 h-2 bg-agri-green rounded-full flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── 6. Settings ─────────────────────────────────────────────────────────────
function SettingsTab() {
  const { profile, saveNotifPrefs } = useBuyerProfile()
  const { logout }                  = useAuth()
  const [pwForm, setPwForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [pwLoading, setPwLoading]   = useState(false)
  const [pwFeedback, setPwFeedback] = useState('')
  const [prefs, setPrefs]           = useState(null)
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [prefsFeedback, setPrefsFeedback] = useState('')

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

  const prefsDefaults = { emailBookings: true, emailOrders: true, emailPayments: true, pushBookings: true, pushOrders: true, pushPayments: true }
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

  async function handleSavePrefs() {
    setPrefsLoading(true)
    setPrefsFeedback('')
    try {
      await saveNotifPrefs(prefs || currentPrefs)
      setPrefsFeedback('Preferences saved.')
      setTimeout(() => setPrefsFeedback(''), 4000)
    } catch (err) {
      setPrefsFeedback(err.message)
    } finally { setPrefsLoading(false) }
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

      <div className="card space-y-2">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide pb-3 border-b border-gray-100 mb-3">Notification Preferences</h3>
        <Feedback type={prefsFeedback.includes('saved') ? 'success' : 'error'} message={prefsFeedback} />
        <Toggle field="emailBookings" label="Email — Booking updates" />
        <Toggle field="emailOrders"   label="Email — Order updates" />
        <Toggle field="emailPayments" label="Email — Payment notifications" />
        <Toggle field="pushBookings"  label="Push — Booking updates" />
        <Toggle field="pushOrders"    label="Push — Order updates" />
        <Toggle field="pushPayments"  label="Push — Payment notifications" />
        <div className="pt-3">
          <button onClick={handleSavePrefs} disabled={prefsLoading} className="btn-outline text-sm disabled:opacity-60">
            {prefsLoading ? 'Saving…' : 'Save Preferences'}
          </button>
        </div>
      </div>

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
function BuyerProfileShell() {
  const [tab, setTab]        = useState('personal')
  const { loading, error }   = useBuyerProfile()

  return (
    <div>
      <PageHeader title="Profile" subtitle="Manage your account, business details, verification, and settings." />

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
          {tab === 'personal' && <PersonalTab />}
          {tab === 'business' && <BusinessTab />}
          {tab === 'verify'   && <VerifyTab />}
          {tab === 'payment'  && <PaymentTab />}
          {tab === 'notif'    && <NotifTab />}
          {tab === 'settings' && <SettingsTab />}
        </>
      )}
    </div>
  )
}

export default function BuyerProfile() {
  return (
    <BuyerProfileProvider>
      <BuyerProfileShell />
    </BuyerProfileProvider>
  )
}
