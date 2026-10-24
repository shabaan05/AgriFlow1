/**
 * AIContext — fetches the AI summary on mount.
 * Individual agent pages fetch their own data lazily.
 */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { fetchAISummary } from '../services/aiApi.js'

const AIContext = createContext(null)

export function AIProvider({ children }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    setLoading(true)
    fetchAISummary()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AIContext.Provider value={{ summary, loading, error }}>
      {children}
    </AIContext.Provider>
  )
}

export function useAI() {
  const ctx = useContext(AIContext)
  if (!ctx) throw new Error('useAI must be used inside <AIProvider>')
  return ctx
}
