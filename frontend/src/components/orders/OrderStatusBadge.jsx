import React from 'react'

const variants = {
  // Booking statuses
  Pending:           'bg-amber-100 text-amber-700',
  Accepted:          'bg-green-100 text-green-700',
  Rejected:          'bg-red-100 text-red-700',
  Cancelled:         'bg-gray-100 text-gray-600',
  Completed:         'bg-green-100 text-green-800',
  // Order statuses
  Confirmed:         'bg-blue-100 text-blue-700',
  Preparing:         'bg-orange-100 text-orange-700',
  'Ready for Pickup':'bg-violet-100 text-violet-700',
  'Picked Up':       'bg-teal-100 text-teal-700',
  'In Transit':      'bg-blue-100 text-blue-800',
  Delivered:         'bg-emerald-100 text-emerald-800',
  // Payment statuses
  Paid:              'bg-green-100 text-green-800',
  Failed:            'bg-red-100 text-red-700',
}

export default function OrderStatusBadge({ status }) {
  const cls = variants[status] || 'bg-gray-100 text-gray-600'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  )
}
