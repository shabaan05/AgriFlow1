import React from 'react'
import StatusBadge from '../ui/StatusBadge.jsx'

export default function OrderRow({ id, buyer, crop, amount, status }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-3.5 text-sm font-mono text-gray-600">{id}</td>
      <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{buyer}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{crop}</td>
      <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{amount}</td>
      <td className="px-4 py-3.5">
        <StatusBadge label={status} />
      </td>
    </tr>
  )
}
