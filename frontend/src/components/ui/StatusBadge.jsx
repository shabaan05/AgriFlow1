import React from 'react'

const variants = {
  // Order statuses
  'Confirmed':         'bg-green-100 text-green-800',
  'In Transit':        'bg-blue-100 text-blue-800',
  'Pending':           'bg-amber-100 text-amber-800',
  // Crop statuses
  'Pre-Harvest':       'bg-orange-100 text-orange-800',
  'Booked':            'bg-violet-100 text-violet-800',
  'Harvest Ready':     'bg-emerald-100 text-emerald-800',
  'Harvested':         'bg-teal-100 text-teal-800',
  'Pickup Scheduled':  'bg-blue-100 text-blue-800',
  'Delivered':         'bg-green-100 text-green-800',
  // Demand levels
  'High':              'bg-red-100 text-red-700',
  'Medium':            'bg-amber-100 text-amber-700',
  'Low':               'bg-gray-100 text-gray-600',
  // Demand trends
  'Rising':            'bg-green-100 text-green-700',
  'Stable':            'bg-blue-100 text-blue-700',
  'Falling':           'bg-red-100 text-red-600',
  // Legacy / misc
  'Stored':            'bg-gray-100 text-gray-700',
  'coming-soon':       'bg-gray-100 text-gray-500',
  'default':           'bg-gray-100 text-gray-700',
}

export default function StatusBadge({ label }) {
  const cls = variants[label] || variants['default']
  return (
    <span className={`status-badge ${cls}`}>
      {label === 'coming-soon' ? 'Coming Soon' : label}
    </span>
  )
}
