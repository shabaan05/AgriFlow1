import React from 'react'

/**
 * ConfirmDialog — reusable confirmation modal.
 * Props: title, message, confirmLabel, confirmCls, onConfirm, onCancel, loading
 */
export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm',
  confirmCls = 'bg-agri-green hover:bg-agri-dark text-white',
  onConfirm, onCancel, loading = false,
  children,
}) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{message}</p>
        {children}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700
                       hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
                        disabled:opacity-60 flex items-center justify-center gap-2 ${confirmCls}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Processing…
              </>
            ) : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
