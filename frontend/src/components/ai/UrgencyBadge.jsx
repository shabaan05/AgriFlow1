import React from 'react'

const styles = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-gray-100 text-gray-600',
}

export default function UrgencyBadge({ level }) {
  return (
    <span className={`status-badge text-xs ${styles[level] || styles.Low}`}>
      {level} Urgency
    </span>
  )
}
