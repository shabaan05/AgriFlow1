/**
 * DemandContext — shared state for all three Demand pages.
 * Fetches once; sub-pages read from context without re-fetching.
 * Replace with API calls when the AI Demand Forecast Agent is added.
 */
import React, { createContext, useContext, useState, useEffect } from 'react'
import * as api from '../services/demandApi.js'

const DemandContext = createContext(null)

export function DemandProvider({ children }) {
  const [demands,      setDemands]      = useState([])
  const [opportunities,setOpportunities]= useState([])
  const [buyerReqs,    setBuyerReqs]    = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    Promise.all([
      api.fetchDemand(),
      api.fetchOpportunities(),
      api.fetchBuyerRequirements(),
    ])
      .then(([d, o, b]) => {
        setDemands(d)
        setOpportunities(o)
        setBuyerReqs(b)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <DemandContext.Provider value={{ demands, opportunities, buyerReqs, loading, error }}>
      {children}
    </DemandContext.Provider>
  )
}

export function useDemand() {
  const ctx = useContext(DemandContext)
  if (!ctx) throw new Error('useDemand must be used inside <DemandProvider>')
  return ctx
}
