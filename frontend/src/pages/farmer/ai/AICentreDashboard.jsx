import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAI } from '../../../context/AIContext.jsx'

const iconSvg = {
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

const statusConfig = {
  active: { dot: 'bg-green-400', label: 'Active',     badge: 'bg-green-100 text-green-700' },
  alert:  { dot: 'bg-red-500 animate-pulse', label: 'Alert',  badge: 'bg-red-100 text-red-700' },
  demo:   { dot: 'bg-amber-400', label: 'Demo',       badge: 'bg-amber-100 text-amber-700' },
}

function AgentCard({ agent }) {
  const navigate = useNavigate()
  const s = statusConfig[agent.status] || statusConfig.demo

  return (
    <div
      className="card hover:shadow-md transition-all duration-200 border border-gray-100
                 hover:border-agri-green/30 flex flex-col gap-4 cursor-pointer group"
      onClick={() => navigate(agent.route)}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="bg-agri-light text-agri-green p-3 rounded-2xl group-hover:bg-green-100 transition-colors">
          {iconSvg[agent.icon]}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${s.dot}`} />
          <span className={`status-badge text-xs ${s.badge}`}>{s.label}</span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base">{agent.name}</h3>
        <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{agent.insight}</p>
      </div>

      {/* Metric */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div>
          <span className="text-2xl font-bold text-agri-green">{agent.metric}</span>
          <span className="text-xs text-gray-400 ml-1.5">{agent.metricLabel}</span>
        </div>
        <span className="text-sm font-semibold text-agri-green group-hover:underline">
          Open Agent →
        </span>
      </div>
    </div>
  )
}

function SkeletonAgentCard() {
  return (
    <div className="card animate-pulse flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="w-13 h-13 bg-gray-200 rounded-2xl w-12 h-12" />
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-5/6" />
      </div>
      <div className="h-6 bg-gray-100 rounded-full w-1/3 mt-2" />
    </div>
  )
}

export default function AICentreDashboard() {
  const { summary, loading, error } = useAI()

  return (
    <div>
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-agri-dark via-agri-green to-green-500 rounded-2xl p-7 mb-8 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 right-24 w-32 h-32 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-green-300 rounded-full animate-pulse" />
            <span className="text-green-200 text-xs font-semibold uppercase tracking-widest">
              Agentic AI Platform
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Four AI Agents. One Intelligent Farm.</h2>
          <p className="text-green-100 text-sm max-w-xl leading-relaxed">
            AgriFlow AI deploys specialised agents that work in the background — matching buyers,
            optimising harvest timing, monitoring shelf life, and preventing wastage.
            Each agent uses your live crop and demand data to generate recommendations.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full">
            🤖 Demo recommendations — real ML models coming in next phase
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 text-sm text-red-700 mb-6">
          Failed to load AI summary: {error}
        </div>
      )}

      {/* Agent cards */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        {loading || !summary
          ? [1, 2, 3, 4].map((i) => <SkeletonAgentCard key={i} />)
          : summary.agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        }
      </div>

      {/* Pipeline diagram */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gray-700 mb-3">How the agents work together</p>
        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500">
          {[
            { label: 'Farm Data',          cls: 'bg-white border border-gray-200' },
            null,
            { label: 'Buyer Match Agent',  cls: 'bg-white border border-gray-200' },
            null,
            { label: 'Harvest Planner',    cls: 'bg-white border border-gray-200' },
            null,
            { label: 'Shelf-Life Monitor', cls: 'bg-white border border-gray-200' },
            null,
            { label: 'Wastage Prevention', cls: 'bg-white border border-gray-200' },
            null,
            { label: 'Farmer Action',      cls: 'bg-agri-light border border-green-200 text-agri-green font-medium' },
          ].map((item, i) =>
            item === null
              ? <span key={i} className="text-gray-300">→</span>
              : <span key={i} className={`px-3 py-1.5 rounded-full ${item.cls}`}>{item.label}</span>
          )}
        </div>
      </div>
    </div>
  )
}
