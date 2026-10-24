import React from 'react'
import DemandLevelBadge from './DemandLevelBadge.jsx'

export default function BuyerRequirementRow({ req, onView }) {
  const deadline = req.deadline
    ? new Date(req.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <tr className="hover:bg-gray-50/60 transition-colors duration-150">
      <td className="px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{req.cropName}</p>
          <p className="text-xs text-gray-400">{req.variety || req.category}</p>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <p className="text-sm font-medium text-gray-800">{req.companyName || req.buyerName}</p>
        <p className="text-xs text-gray-400">{req.buyerName}</p>
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">
        {req.requiredQuantity.toLocaleString()} {req.unit}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">{req.qualityGrade}</td>
      <td className="px-4 py-3.5 text-sm font-semibold text-agri-green">
        ₹{req.expectedPrice}/{req.unit}
      </td>
      <td className="px-4 py-3.5 text-sm text-gray-700">{req.deliveryLocation}</td>
      <td className="px-4 py-3.5 text-sm text-gray-600">{deadline}</td>
      <td className="px-4 py-3.5">
        <DemandLevelBadge level={req.demandLevel} />
      </td>
      <td className="px-4 py-3.5">
        <button
          onClick={() => onView(req)}
          className="text-xs font-semibold text-agri-green hover:text-agri-dark transition-colors whitespace-nowrap"
        >
          View Details
        </button>
      </td>
    </tr>
  )
}
