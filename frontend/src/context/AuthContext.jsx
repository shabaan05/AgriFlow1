/**
 * AuthContext — real JWT-backed authentication state.
 *
 * Stores the JWT in localStorage under AUTH_TOKEN_KEY.
 * Stores the user profile under AUTH_USER_KEY.
 * On mount, re-validates the stored token against GET /api/auth/me so
 * a tampered or expired token is caught immediately on refresh.
 *
 * Public interface (identical to the old useAuth hook so no other file changes):
 *   user            — { id, name, email, phone, role } | null
 *   isAuthenticated — boolean
 *   authLoading     — true while the initial /me check is running
 *   login(creds)    — async, throws on failure
 *   register(data)  — async, throws on failure
 *   logout()        — clears storage + state
 */
import React, {
  createContext, useContext, useState, useEffect, useCallback,
} from 'react'
import { apiLogin, apiRegister, apiGetMe } from '../services/authApi.js'

const AUTH_TOKEN_KEY = 'agriflow_token'
const AUTH_USER_KEY  = 'agriflow_user'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null)
  const [authLoading, setAuthLoading] = useState(true)  // true during initial token check

  // ── On mount: restore session from localStorage ──────────────────────────
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) {
      setAuthLoading(false)
      return
    }

    // Re-validate token against the server
    apiGetMe(token)
      .then(({ user: serverUser }) => {
        setUser(serverUser)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(serverUser))
      })
      .catch(() => {
        // Token expired / invalid — clear storage
        localStorage.removeItem(AUTH_TOKEN_KEY)
        localStorage.removeItem(AUTH_USER_KEY)
        setUser(null)
      })
      .finally(() => setAuthLoading(false))
  }, [])

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) throw new Error('Email and password are required.')
    const { token, user: serverUser } = await apiLogin({ email, password })
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY,  JSON.stringify(serverUser))
    setUser(serverUser)
  }, [])

  // ── Register ─────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password, confirmPassword, mobile, location, role }) => {
    if (!name || !email || !password) throw new Error('Please fill all required fields.')
    if (password !== confirmPassword)  throw new Error('Passwords do not match.')

    // Pass through the role from the registration form.
    // Default to 'farmer' only if no role is supplied (matches existing architecture).
    const assignedRole = ['farmer', 'buyer', 'transporter', 'admin'].includes(role) ? role : 'farmer'

    const { token, user: serverUser } = await apiRegister({
      name,
      email,
      password,
      phone: mobile || '',
      role:  assignedRole,
    })
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_USER_KEY,  JSON.stringify(serverUser))
    setUser(serverUser)
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
    setUser(null)
  }, [])

  // ── Update user in context (called after profile edits) ──────────────────
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedUser))
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      authLoading,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

/** Returns the stored JWT token (used by cropApi.js request helper). */
export function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}
