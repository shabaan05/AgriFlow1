import React from 'react'
import StatusBadge from '../ui/StatusBadge.jsx'

const cropColors = {
  red:    'bg-red-100 text-red-700',
  purple: 'bg-purple-100 text-purple-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green:  'bg-green-100 text-green-700',
  orange: 'bg-orange-100 text-orange-700',
}

const cropEmojis = {
  Tomato: '🍅',
  Onion:  '🧅',
  Wheat:  '🌾',
  Rice:   '🌾',
  Potato: '🥔',
}

export default function CropCard({ name, qty, grade, price, status, color = 'green' }) {
  const cls = cropColors[color] || cropColors.green
  const emoji = cropEmojis[name] || '🌱'

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${cls} flex items-center justify-center text-2xl`}>
          {emoji}
        </div>
        <StatusBadge label={status} />
      </div>
      <h3 className="font-semibold text-gray-900 text-base">{name}</h3>
      <div className="mt-3 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Quantity</span>
          <span className="font-medium text-gray-800">{qty}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Grade</span>
          <span className="font-medium text-gray-800">{grade}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Price</span>
          <span className="font-semibold text-agri-green">{price}</span>
        </div>
      </div>
    </div>
  )
}
