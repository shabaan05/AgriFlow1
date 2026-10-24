import React from 'react'

const config = {
  Rising:  { cls: 'text-green-700 bg-green-50', arrow: '↑' },
  Stable:  { cls: 'text-blue-700  bg-blue-50',  arrow: '→' },
  Falling: { cls: 'text-red-600   bg-red-50',   arrow: '↓' },
}

export default function TrendBadge({ trend }) {
  const c = config[trend] || config.Stable
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${c.cls}`}>
      <span>{c.arrow}</span>
      {trend}
    </span>
  )
}
