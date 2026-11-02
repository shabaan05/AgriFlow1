import { useState, useEffect, useMemo } from 'react'
import { fetchMandiPrices, fetchFilterOptions } from '../../services/mandiApi'

export default function MandiMarketModal({ isOpen, onClose, farmerCrops = [] }) {
  const [commodity, setCommodity] = useState('Tomato')
  const [state, setState] = useState('Maharashtra')
  const [district, setDistrict] = useState('')
  const [search, setSearch] = useState('')
  const [prices, setPrices] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allCommodities, setAllCommodities] = useState([])

  // Extract unique crop names from farmer's crops for quick filter chips
  const myCropNames = useMemo(() => {
    const names = farmerCrops.map(c => c.name).filter(Boolean)
    return Array.from(new Set(names))
  }, [farmerCrops])

  // Load commodity list for dropdown
  useEffect(() => {
    if (!isOpen) return
    fetchFilterOptions('commodity')
      .then((list) => {
        if (Array.isArray(list) && list.length > 0) {
          setAllCommodities(list)
        }
      })
      .catch((e) => console.warn('Could not load commodities list:', e))
  }, [isOpen])

  // Fetch prices whenever commodity or state changes
  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoading(true)
    setError(null)

    fetchMandiPrices({ commodity, state, district })
      .then((data) => {
        if (active) {
          setPrices(data)
        }
      })
      .catch((err) => {
        if (active) {
          setError(err.message || 'Failed to load Mandi rates')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [isOpen, commodity, state, district])

  // Local text search
  const filteredPrices = useMemo(() => {
    if (!search.trim()) return prices
    const q = search.toLowerCase()
    return prices.filter(
      p =>
        (p.market && p.market.toLowerCase().includes(q)) ||
        (p.district && p.district.toLowerCase().includes(q)) ||
        (p.commodity && p.commodity.toLowerCase().includes(q)) ||
        (p.grade && p.grade.toLowerCase().includes(q))
    )
  }, [prices, search])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">
              🌾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight">Live APMC Mandi Rates</h3>
                <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  data.gov.in (Agmarknet)
                </span>
              </div>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Official daily commodity market prices across Indian Mandis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Quick Filter Chips for Farmer's Crops */}
        {myCropNames.length > 0 && (
          <div className="bg-emerald-50/60 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-emerald-800 font-medium whitespace-nowrap">Your Crops:</span>
            {myCropNames.map((name) => (
              <button
                key={name}
                onClick={() => setCommodity(name)}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  commodity.toLowerCase() === name.toLowerCase()
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70 grid sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Commodity</label>
            <input
              type="text"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="e.g. Tomato, Potato, Onion"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">State</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All States</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Rajasthan">Rajasthan</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">District / Market (Optional)</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Nashik, Pune"
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Quick Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter table..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Content Table Area */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm font-medium">Fetching real-time Mandi rates from data.gov.in...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl my-4">
              <p className="font-semibold">{error}</p>
              <button
                onClick={() => setCommodity(commodity)}
                className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded-md"
              >
                Retry
              </button>
            </div>
          ) : filteredPrices.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <span className="text-3xl block mb-2">🔍</span>
              <p className="text-sm font-medium text-slate-600">No mandi records found for "{commodity}"</p>
              <p className="text-xs text-slate-400 mt-1">Try selecting another commodity or clearing the district filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                    <th className="py-2.5 px-3">Commodity & Grade</th>
                    <th className="py-2.5 px-3">APMC Mandi</th>
                    <th className="py-2.5 px-3">District & State</th>
                    <th className="py-2.5 px-3 text-right">Modal Price (Avg)</th>
                    <th className="py-2.5 px-3 text-right">Price Range (Min - Max)</th>
                    <th className="py-2.5 px-3 text-center">Arrival Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPrices.map((row, idx) => (
                    <tr key={idx} className="hover:bg-emerald-50/30 transition-colors">
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800">{row.commodity}</span>
                        <span className="block text-[11px] text-slate-400 font-normal">{row.grade}</span>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {row.market}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {row.district ? `${row.district}, ` : ''}{row.state}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="font-bold text-sm text-emerald-700">
                          ₹{row.modalPricePerKg}/kg
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          (₹{row.modalPricePerQtl}/Qtl)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600">
                        <span className="font-medium text-slate-700">
                          ₹{row.minPricePerKg} - ₹{row.maxPricePerKg}/kg
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          (₹{row.minPricePerQtl} - ₹{row.maxPricePerQtl}/Qtl)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500">
                        {row.arrivalDate ? new Date(row.arrivalDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-700">{filteredPrices.length}</strong> mandi market records
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
