import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * TransporterProtectedRoute — guards /transporter/* routes.
 * - Loading splash while auth verifies
 * - Redirects to /transporter/login if unauthenticated
 * - Redirects authenticated non-transporters to their own portal
 */
export default function TransporterProtectedRoute({ children }) {
  const { isAuthenticated, authLoading, user } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-agri-green rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-sm">AF</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-agri-green rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/transporter/login" replace />
  }

  if (user?.role && user.role !== 'transporter') {
    // Redirect to their correct portal
    const portals = { farmer: '/farmer/dashboard', buyer: '/buyer/dashboard' }
    return <Navigate to={portals[user.role] || '/farmer/dashboard'} replace />
  }

  return children
}
