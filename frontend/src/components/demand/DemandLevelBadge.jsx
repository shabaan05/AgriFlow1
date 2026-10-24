import React from 'react'

const styles = {
  High:   { bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500'   },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Low:    { bg: 'bg-gray-100',  text: 'text-gray-600',  dot: 'bg-gray-400'  },
}

export default function DemandLevelBadge({ level }) {
  const s = styles[level] || styles.Low
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {level}
    </span>
  )
}
