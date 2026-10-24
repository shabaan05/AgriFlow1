/**
 * ShortlistContext — tracks shortlisted crop IDs for instant UI badge state.
 * Fetches the full shortlist for the Shortlisted page separately.
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchShortlistIds, addShortlist, removeShortlist } from '../services/marketplaceApi.js'

const ShortlistContext = createContext(null)

export function ShortlistProvider({ children }) {
  const [shortlistedIds, setShortlistedIds] = useState(new Set())
  const [loading, setLoading] = useState(false)

  // Load just the IDs on mount — lightweight
  useEffect(() => {
    fetchShortlistIds()
      .then((ids) => setShortlistedIds(new Set(ids)))
      .catch(() => {})   // non-critical; user might not be a buyer
  }, [])

  const isShortlisted = useCallback((cropId) => shortlistedIds.has(cropId), [shortlistedIds])

  const toggleShortlist = useCallback(async (crop) => {
    const id = crop.id
    if (shortlistedIds.has(id)) {
      // Optimistic remove
      setShortlistedIds((prev) => { const n = new Set(prev); n.delete(id); return n })
      try { await removeShortlist(id) }
      catch { setShortlistedIds((prev) => new Set([...prev, id])) }  // rollback
    } else {
      // Optimistic add
      setShortlistedIds((prev) => new Set([...prev, id]))
      try { await addShortlist(id) }
      catch { setShortlistedIds((prev) => { const n = new Set(prev); n.delete(id); return n }) }
    }
  }, [shortlistedIds])

  return (
    <ShortlistContext.Provider value={{ shortlistedIds, isShortlisted, toggleShortlist, loading }}>
      {children}
    </ShortlistContext.Provider>
  )
}

export function useShortlist() {
  const ctx = useContext(ShortlistContext)
  if (!ctx) throw new Error('useShortlist must be used inside <ShortlistProvider>')
  return ctx
}
