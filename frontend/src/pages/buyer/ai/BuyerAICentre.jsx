/**
 * BuyerAICentre.jsx
 *
 * Buyer AI Centre dashboard — landing page at /buyer/ai.
 * Shows available AI agents and lets the buyer navigate to each one.
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'

const AGENTS = [
  {
    id:       'buyer-match',
    title:    'Buyer–Farmer Match',
    subtitle: 'Find and rank the best available crops and farmers for your procurement criteria.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
      </svg>
    ),
    badge:    'Live',
    badgeCls: 'bg-green-100 text-green-700',
    route:    '/buyer/ai/buyer-match',
    features: [
      'Rule-based explainable ranking',
      'Price, quality, quantity & location scoring',
      'Farmer reliability signal',
      'Book directly from results',
    ],
    cta: 'Find Matches →',
    ctaCls: 'btn-primary',
  },
  {
    id:       'demand-forecast',
    title:    'Demand Forecast',
    subtitle: 'Weighted-average trend forecast using real order, booking, and market demand data.',
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    badge:    'Live',
    badgeCls: 'bg-green-100 text-green-700',
    route:    '/buyer/ai/demand-forecast',
    features: [
      'Weighted moving average projection',
      'Trend detection (increasing / stable / decreasing)',
      'Price range from historical transactions',
      'Confidence level from data depth',
    ],
    cta: 'Forecast Demand →',
    ctaCls: 'btn-primary',
  },
]

export default function BuyerAICentre() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 bg-agri-light text-agri-green rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Centre</h1>
            <p className="text-sm text-gray-500">Buyer Intelligence Agents</p>
          </div>
        </div>
        <p className="text-sm text-gray-400 max-w-xl mt-1">
          Powered by AgriFlow's rule-based intelligence engine. No hallucinations — every recommendation
          is explainable and grounded in live crop and farmer data.
        </p>
      </div>

      {/* Agent cards */}
      <div className="grid sm:grid-cols-2 gap-5">
        {AGENTS.map((agent) => (
          <div
            key={agent.id}
            className={`card flex flex-col transition-shadow ${agent.disabled ? 'opacity-80' : 'hover:shadow-lg cursor-pointer'}`}
            onClick={() => !agent.disabled && navigate(agent.route)}
            role={agent.disabled ? undefined : 'button'}
            tabIndex={agent.disabled ? -1 : 0}
            onKeyDown={(e) => !agent.disabled && e.key === 'Enter' && navigate(agent.route)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-agri-light text-agri-green rounded-2xl flex items-center justify-center flex-shrink-0">
                {agent.icon}
              </div>
              <span className={`status-badge text-xs ${agent.badgeCls}`}>{agent.badge}</span>
            </div>

            <h3 className="text-base font-bold text-gray-900 mb-1">{agent.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">{agent.subtitle}</p>

            <ul className="space-y-1.5 mb-5 flex-1">
              {agent.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-500">
                  <svg className="w-3.5 h-3.5 text-agri-green flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <button
              className={`${agent.ctaCls} text-sm w-full`}
              disabled={agent.disabled}
              onClick={(e) => { e.stopPropagation(); !agent.disabled && navigate(agent.route) }}
            >
              {agent.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
