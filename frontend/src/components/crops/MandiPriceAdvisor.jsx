import { useState, useEffect } from 'react'
import { fetchMandiBenchmark } from '../../services/mandiApi'

export default function MandiPriceAdvisor({ cropName, farmLocation, onApplyPrice }) {
  const [benchmark, setBenchmark] = useState(null)
  const [loading, setLoading] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (!cropName || cropName.trim().length < 2) {
      setBenchmark(null)
      return
    }

    let active = true
    setLoading(true)
    setApplied(false)

    // Debounce lookup by 400ms
    const timer = setTimeout(() => {
      fetchMandiBenchmark(cropName.trim(), farmLocation)
        .then((data) => {
          if (active && data) {
            setBenchmark(data)
          }
        })
        .catch((err) => {
          console.warn('Mandi benchmark fetch error:', err)
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [cropName, farmLocation])

  if (!cropName || cropName.trim().length < 2) {
    return null
  }

  function handleApply() {
    if (!benchmark) return
    const exp = benchmark.recommendedExpectedPrice || benchmark.modalPricePerKg || 0
    const min = benchmark.recommendedMinPrice || benchmark.minPricePerKg || 0
    onApplyPrice(exp, min)
    setApplied(true)
    setTimeout(() => setApplied(false), 3000)
  }

  return (
    <div className="my-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-green-50/50 p-4 shadow-sm transition-all animate-fadeIn">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-sm shadow-sm">
            🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Live Mandi Price Intelligence
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Official APMC Rate
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Benchmark rates from data.gov.in (Agmarknet) for {benchmark?.commodity || cropName}
            </p>
          </div>
        </div>

        {benchmark && !loading && (
          <button
            type="button"
            onClick={handleApply}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
              applied
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow'
            }`}
          >
            {applied ? (
              <>
                <span>✓</span>
                <span>Price Applied!</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                <span>Apply Mandi Rate (₹{benchmark.recommendedExpectedPrice}/kg)</span>
              </>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Checking real-time Mandi market rates for {cropName}...</span>
        </div>
      ) : benchmark ? (
        <div className="mt-3 pt-3 border-t border-emerald-100/70 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
            <span className="block text-[10px] font-medium text-slate-400">Modal Market Rate</span>
            <span className="text-base font-extrabold text-emerald-700">
              ₹{benchmark.modalPricePerKg}
              <span className="text-xs font-normal text-slate-500"> /kg</span>
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
            <span className="block text-[10px] font-medium text-slate-400">Price Range (Min - Max)</span>
            <span className="text-sm font-bold text-slate-700">
              ₹{benchmark.minPricePerKg} - ₹{benchmark.maxPricePerKg}
              <span className="text-xs font-normal text-slate-500"> /kg</span>
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
            <span className="block text-[10px] font-medium text-slate-400">Suggested Minimum</span>
            <span className="text-sm font-bold text-slate-700">
              ₹{benchmark.recommendedMinPrice}
              <span className="text-xs font-normal text-slate-500"> /kg</span>
            </span>
          </div>

          <div className="bg-white/80 p-2 rounded-lg border border-emerald-100">
            <span className="block text-[10px] font-medium text-slate-400">Sampled Markets</span>
            <span className="text-xs font-medium text-slate-600 truncate block" title={benchmark.sampleMarkets?.join(', ')}>
              {benchmark.sampleMarkets?.[0] || 'Regional APMC'}
              {benchmark.totalMarketsFound > 1 ? ` (+${benchmark.totalMarketsFound - 1})` : ''}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
