import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { getDashboardForRole } from '../../utils/roleRedirect.js'

export default function FarmerRegister() {
  const navigate      = useNavigate()
  const { register }  = useAuth()

  const [form, setForm] = useState({
    name: '', email: '', mobile: '', password: '', confirmPassword: '', location: '',
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Explicitly pass role: 'farmer' so AuthContext stores the correct role
      await register({ ...form, role: 'farmer' })
      const stored = JSON.parse(localStorage.getItem('agriflow_user') || '{}')
      navigate(getDashboardForRole(stored.role))
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back */}
      <div className="p-5">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-agri-green transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to homepage
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-agri-green rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">AF</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Farmer Account</h1>
                <p className="text-xs text-gray-400">AgriFlow AI · Farmer Portal</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Rajan Kumar"
                  value={form.name}
                  onChange={update('name')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="rajan@example.com"
                  value={form.email}
                  onChange={update('email')}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 98765 43210"
                  value={form.mobile}
                  onChange={update('mobile')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm Location</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Nashik, Maharashtra"
                  value={form.location}
                  onChange={update('location')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={update('password')}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-2 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account…
                  </>
                ) : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/farmer/login" className="text-agri-green font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
