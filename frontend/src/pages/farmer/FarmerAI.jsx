import React from 'react'
import { Outlet } from 'react-router-dom'
import { AIProvider } from '../../context/AIContext.jsx'

/**
 * FarmerAI — shell wrapper for the AI Centre module.
 * Provides AIContext to all sub-pages via AIProvider.
 * Tab navigation is handled per-page (back button on each agent page).
 */
export default function FarmerAI() {
  return (
    <AIProvider>
      <Outlet />
    </AIProvider>
  )
}
