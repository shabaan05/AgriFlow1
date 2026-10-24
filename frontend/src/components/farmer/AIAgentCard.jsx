import React from 'react'

const agentIcons = {
  match: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
    </svg>
  ),
  harvest: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  shelf: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  wastage: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
}

export default function AIAgentCard({ name, description, icon, status }) {
  return (
    <div className="card hover:shadow-md transition-all duration-200 border border-gray-100 group
                    hover:border-agri-green/30 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="bg-agri-light text-agri-green p-3 rounded-2xl">
          {agentIcons[icon]}
        </div>
        <span className="status-badge bg-gray-100 text-gray-500 text-xs">Coming Soon</span>
      </div>

      {/* Body */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{description}</p>
      </div>

      {/* Footer */}
      <button
        disabled
        className="mt-auto w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200
                   text-sm font-medium text-gray-400 cursor-not-allowed
                   group-hover:border-agri-green/30 group-hover:text-agri-muted
                   transition-colors duration-200"
      >
        View Agent
      </button>
    </div>
  )
}
