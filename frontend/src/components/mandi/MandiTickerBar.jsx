import { useState, useEffect } from 'react'
import { fetchLiveTicker } from '../../services/mandiApi'

export default function MandiTickerBar({ onOpenMarketModal }) {
  const [tickerItems, setTickerItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    fetchLiveTicker()
      .then((items) => {
        if (mounted && Array.isArray(items) && items.length > 0) {
          setTickerItems(items)
        }
      })
      .catch((err) => console.warn('Ticker load error:', err))
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => { mounted = false }
  }, [])

  if (loading && tickerItems.length === 0) {
    return null
  }

  const displayItems = tickerItems.length > 0 ? tickerItems : [
    { commodity: 'Tomato', market: 'APMC Nashik', state: 'Maharashtra', modalPricePerKg: 19 },
    { commodity: 'Onion', market: 'APMC Lasalgaon', state: 'Maharashtra', modalPricePerKg: 25 },
    { commodity: 'Potato', market: 'APMC Pune', state: 'Maharashtra', modalPricePerKg: 22 },
    { commodity: 'Brinjal', market: 'APMC Vashi', state: 'Maharashtra', modalPricePerKg: 24 }
  ]

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white rounded-xl shadow-md border border-emerald-800/40 px-3 py-2 flex items-center justify-between gap-3 overflow-hidden text-xs">
      {/* Badge */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-emerald-300 uppercase tracking-wider text-[11px] whitespace-nowrap">
          Live Mandi Rates
        </span>
      </div>

      {/* Marquee Ticker */}
      <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
        <div className="flex items-center gap-6 whitespace-nowrap">
          {displayItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-slate-300">
              <span className="font-semibold text-white">{item.commodity}</span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">
                ₹{item.modalPricePerKg}/kg
              </span>
              <span className="text-[10px] text-slate-400">
                ({item.market || item.state})
              </span>
              {idx < displayItems.length - 1 && (
                <span className="text-slate-600 font-bold ml-2">•</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      {onOpenMarketModal && (
        <button
          onClick={onOpenMarketModal}
          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded-lg text-[11px] transition-colors shadow-sm flex items-center gap-1"
        >
          <span>Market Explorer</span>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  )
}
