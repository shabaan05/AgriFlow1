import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

/**
 * BuyerProtectedRoute — guards buyer routes.
 * - Shows loading splash while auth is being verified
 * - Redirects to /buyer/login if not authenticated
 * - Redirects to /farmer/dashboard if authenticated but not a buyer
 */
export default function BuyerProtectedRoute({ children }) {
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
              <div
                key={i}
                className="w-2 h-2 bg-agri-green rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/buyer/login" replace />
  }

  // If logged in as a farmer, redirect to farmer dashboard
  if (user?.role && user.role !== 'buyer') {
    return <Navigate to="/farmer/dashboard" replace />
  }

  return children
}
