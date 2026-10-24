import React from 'react'

const colorMap = {
  green:   { bg: 'bg-green-50',   icon: 'bg-green-100',   text: 'text-agri-green' },
  blue:    { bg: 'bg-blue-50',    icon: 'bg-blue-100',    text: 'text-blue-700'   },
  amber:   { bg: 'bg-amber-50',   icon: 'bg-amber-100',   text: 'text-amber-700'  },
  emerald: { bg: 'bg-emerald-50', icon: 'bg-emerald-100', text: 'text-emerald-700'},
}

const icons = {
  crops: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 3C12 3 7 8 7 13a5 5 0 0010 0c0-5-5-10-5-10z
           M12 13v8M8 18h8" />
    </svg>
  ),
  bookings: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  orders: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  earnings: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function KPICard({ label, value, icon, trend, color = 'green' }) {
  const c = colorMap[color] || colorMap.green
  return (
    <div className={`card flex items-start gap-4 ${c.bg} border-0`}>
      <div className={`${c.icon} ${c.text} p-3 rounded-xl flex-shrink-0`}>
        {icons[icon]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>{value}</p>
        {trend && (
          <p className="text-xs text-gray-500 mt-1">{trend}</p>
        )}
      </div>
    </div>
  )
}
