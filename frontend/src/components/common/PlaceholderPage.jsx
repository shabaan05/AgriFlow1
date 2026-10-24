import React from 'react'

export default function PlaceholderPage({ title, subtitle, icon = '🔧', comingNext }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-agri-light rounded-3xl flex items-center justify-center text-4xl mb-6">
        {icon}
      </div>
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-500 mt-2 max-w-sm text-sm leading-relaxed">
        {subtitle || 'This module is being built. Check back soon.'}
      </p>
      {comingNext && (
        <div className="mt-6 bg-agri-light border border-green-200 text-agri-green text-xs font-semibold
                        px-5 py-2.5 rounded-full">
          Module coming next →
        </div>
      )}
    </div>
  )
}
