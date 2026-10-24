import React from 'react'

/**
 * DemoBanner — displayed on every AI agent page to clearly indicate mock data.
 * Remove when real AI logic is wired in.
 */
export default function DemoBanner() {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6">
      <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-xs text-amber-700 font-medium">
        <span className="font-bold">Demo Mode —</span> Recommendations below are illustrative mock data.
        Real AI-powered analysis will replace this when the agent's ML model is connected.
      </p>
    </div>
  )
}
