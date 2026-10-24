/**
 * CropsContext — API-backed state store for the Crops module.
 *
 * Exposes:
 *   crops        — array of crop objects (frontend shape)
 *   loading      — true while a fetch/mutation is in progress
 *   error        — string | null — last API error message
 *   clearError() — reset error state
 *   fetchCrops() — reload list from backend
 *   addCrop(data)         → Promise<newCrop>
 *   updateCrop(id, data)  → Promise<updatedCrop>
 *   deleteCrop(id)        → Promise<void>
 *   getCropById(id)       → crop object from local state (synchronous)
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as api from '../services/cropApi.js'

const CropsContext = createContext(null)

export function CropsProvider({ children }) {
  const [crops,   setCrops]   = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Load all crops on mount ──────────────────────────────────────────────
  const loadCrops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.fetchCrops()
      setCrops(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadCrops() }, [loadCrops])

  // ── Add ──────────────────────────────────────────────────────────────────
  async function addCrop(data) {
    setLoading(true)
    setError(null)
    try {
      const newCrop = await api.createCrop(data)
      setCrops((prev) => [newCrop, ...prev])
      return newCrop
    } catch (err) {
      setError(err.message)
      throw err               // re-throw so the page can catch it
    } finally {
      setLoading(false)
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────
  async function updateCrop(id, data) {
    setLoading(true)
    setError(null)
    try {
      const updated = await api.updateCrop(id, data)
      setCrops((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return updated
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function deleteCrop(id) {
    setLoading(true)
    setError(null)
    try {
      await api.deleteCropById(id)
      setCrops((prev) => prev.filter((c) => c.id !== id))
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ── Synchronous local lookup (used by Detail / Edit before they re-fetch) ─
  function getCropById(id) {
    return crops.find((c) => c.id === id)
  }

  function clearError() { setError(null) }

  return (
    <CropsContext.Provider
      value={{
        crops,
        loading,
        error,
        clearError,
        fetchCrops: loadCrops,
        addCrop,
        updateCrop,
        deleteCrop,
        getCropById,
      }}
    >
      {children}
    </CropsContext.Provider>
  )
}

export function useCrops() {
  const ctx = useContext(CropsContext)
  if (!ctx) throw new Error('useCrops must be used inside <CropsProvider>')
  return ctx
}
