/**
 * demandForecastService.js
 *
 * Explainable, rule-based Demand Forecast Service.
 *
 * Data sources (all existing models — no invented data):
 *   1. Order       — completed/delivered orders: quantity sold, price, date
 *   2. Booking     — all bookings (accepted/completed): quantity demanded, price, date
 *   3. BuyerRequirement — posted procurement needs: quantity, date
 *   4. Demand      — market demand signals: quantity, level, trend, price range
 *
 * Forecast method:
 *   - Aggregate the above into monthly "demand points" (quantity + avg price).
 *   - Apply a Weighted Moving Average (recent months weight higher).
 *   - Detect linear trend (OLS slope over monthly quantities).
 *   - Project forward for the requested number of months.
 *   - Derive a confidence level from the number of historical data points.
 *
 * No ML, no LLM, no external APIs.
 */

'use strict'

const Order            = require('../models/Order')
const Booking          = require('../models/Booking')
const BuyerRequirement = require('../models/BuyerRequirement')
const Demand           = require('../models/Demand')

// ── Config ────────────────────────────────────────────────────────────────────
const LOOKBACK_MONTHS = 12   // how many past months to gather data from
const WMA_WEIGHTS     = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7]  // oldest→newest

// Minimum historical points needed to produce medium/high confidence
const CONFIDENCE_THRESHOLDS = { HIGH: 6, MEDIUM: 3 }

// ── Helpers ───────────────────────────────────────────────────────────────────
function monthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function addMonths(date, n) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

/** Format a Date as "Mon YYYY" label */
function monthLabel(date) {
  return new Date(date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

/**
 * Escape a string for use as a MongoDB regex pattern (no external lib).
 */
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Linear trend (OLS slope) ──────────────────────────────────────────────────
/**
 * Returns the least-squares slope (units/month) over an array of values.
 * index 0 = oldest month.
 */
function olsSlope(values) {
  const n = values.length
  if (n < 2) return 0
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
  for (let i = 0; i < n; i++) {
    sumX  += i
    sumY  += values[i]
    sumXY += i * values[i]
    sumX2 += i * i
  }
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return 0
  return (n * sumXY - sumX * sumY) / denom
}

// ── Weighted Moving Average ───────────────────────────────────────────────────
/**
 * Returns the WMA of the last `weights.length` values (or fewer if not enough).
 */
function wma(values, weights) {
  const slice = values.slice(-weights.length)
  if (slice.length === 0) return 0
  const w = weights.slice(-slice.length)
  let sumVW = 0, sumW = 0
  for (let i = 0; i < slice.length; i++) {
    sumVW += slice[i] * w[i]
    sumW  += w[i]
  }
  return sumW > 0 ? sumVW / sumW : 0
}

// ── Aggregate data into a monthly map ─────────────────────────────────────────
/**
 * monthlyMap: { 'YYYY-MM': { qty: number, priceSum: number, priceCount: number } }
 */
function ensureMonth(map, key) {
  if (!map[key]) map[key] = { qty: 0, priceSum: 0, priceCount: 0 }
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * generateForecast({ cropName, forecastMonths }) → forecast object
 *
 * forecastMonths: 1 | 3 | 6 | 12   (default 3)
 */
async function generateForecast({ cropName, forecastMonths = 3 }) {
  if (!cropName || !cropName.trim()) {
    return { success: false, message: 'cropName is required' }
  }

  const name      = cropName.trim()
  const nameRegex = new RegExp(`^${escapeRegex(name)}$`, 'i')
  const cutoff    = new Date()
  cutoff.setMonth(cutoff.getMonth() - LOOKBACK_MONTHS)

  // ── 1. Fetch data from all 4 sources concurrently ────────────────────────
  const [orders, bookings, requirements, demandSignals] = await Promise.all([
    Order.find({
      cropName: nameRegex,
      status:   'Delivered',
      createdAt: { $gte: cutoff },
    }).select('cropName quantity pricePerUnit createdAt').lean(),

    Booking.find({
      cropName: nameRegex,
      status:   { $in: ['Accepted', 'Completed'] },
      createdAt: { $gte: cutoff },
    }).select('cropName quantity pricePerUnit createdAt').lean(),

    BuyerRequirement.find({
      cropName: nameRegex,
      createdAt: { $gte: cutoff },
    }).select('cropName quantity maxPricePerKg createdAt').lean(),

    Demand.find({
      cropName: nameRegex,
      isActive:  true,
    }).select('cropName demandQuantity expectedPriceMin expectedPriceMax demandLevel demandTrend createdAt').lean(),
  ])

  // ── 2. Build monthly aggregation map ─────────────────────────────────────
  const monthlyMap = {}

  // Orders (strongest signal — actual transactions)
  for (const o of orders) {
    const k = monthKey(o.createdAt)
    ensureMonth(monthlyMap, k)
    monthlyMap[k].qty += o.quantity || 0
    if (o.pricePerUnit > 0) {
      monthlyMap[k].priceSum   += o.pricePerUnit
      monthlyMap[k].priceCount += 1
    }
  }

  // Bookings (confirmed demand)
  for (const b of bookings) {
    const k = monthKey(b.createdAt)
    ensureMonth(monthlyMap, k)
    monthlyMap[k].qty += b.quantity || 0
    if (b.pricePerUnit > 0) {
      monthlyMap[k].priceSum   += b.pricePerUnit
      monthlyMap[k].priceCount += 1
    }
  }

  // BuyerRequirements (prospective demand — weighted 0.6 to avoid double counting)
  for (const r of requirements) {
    const k = monthKey(r.createdAt)
    ensureMonth(monthlyMap, k)
    monthlyMap[k].qty += (r.quantity || 0) * 0.6
    if (r.maxPricePerKg > 0) {
      monthlyMap[k].priceSum   += r.maxPricePerKg
      monthlyMap[k].priceCount += 1
    }
  }

  // ── 3. Build sorted historical series covering the lookback window ─────────
  // Generate all month keys in the window (fill gaps with 0)
  const allMonthKeys = []
  for (let i = LOOKBACK_MONTHS - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    allMonthKeys.push(monthKey(d))
  }

  const historicalPoints = allMonthKeys.map((k) => {
    const m   = monthlyMap[k] || { qty: 0, priceSum: 0, priceCount: 0 }
    const d   = new Date(k + '-01')
    return {
      period:   k,
      label:    monthLabel(d),
      quantity: Math.round(m.qty),
      avgPrice: m.priceCount > 0 ? Math.round(m.priceSum / m.priceCount) : null,
    }
  })

  // Non-zero points for confidence calc
  const nonZero = historicalPoints.filter(p => p.quantity > 0)

  // ── 4. Demand signals from Demand model (platform demand board) ────────────
  let demandLevelSignal  = null   // 'High' | 'Medium' | 'Low'
  let demandTrendSignal  = null   // 'Rising' | 'Stable' | 'Falling'
  let demandPriceMin     = null
  let demandPriceMax     = null

  if (demandSignals.length > 0) {
    // Aggregate: most common level and trend
    const lvlCount = { High: 0, Medium: 0, Low: 0 }
    const trendCount = { Rising: 0, Stable: 0, Falling: 0 }
    for (const ds of demandSignals) {
      if (ds.demandLevel)  lvlCount[ds.demandLevel]  = (lvlCount[ds.demandLevel]  || 0) + 1
      if (ds.demandTrend)  trendCount[ds.demandTrend] = (trendCount[ds.demandTrend] || 0) + 1
      if (ds.expectedPriceMin > 0) demandPriceMin = demandPriceMin === null ? ds.expectedPriceMin : (demandPriceMin + ds.expectedPriceMin) / 2
      if (ds.expectedPriceMax > 0) demandPriceMax = demandPriceMax === null ? ds.expectedPriceMax : (demandPriceMax + ds.expectedPriceMax) / 2
    }
    demandLevelSignal = Object.keys(lvlCount).reduce((a, b) => lvlCount[a] >= lvlCount[b] ? a : b, 'Medium')
    demandTrendSignal = Object.keys(trendCount).reduce((a, b) => trendCount[a] >= trendCount[b] ? a : b, 'Stable')
  }

  // ── 5. No data at all ──────────────────────────────────────────────────────
  const totalTransactions = orders.length + bookings.length + requirements.length
  if (totalTransactions === 0 && demandSignals.length === 0) {
    return {
      success:      true,
      cropName:     name,
      hasData:      false,
      message:      `No historical data found for "${name}". As more orders and requirements are created, the forecast will improve.`,
      historicalPoints: historicalPoints,
      forecast:     null,
    }
  }

  // ── 6. Forecast projection ─────────────────────────────────────────────────
  const quantities = historicalPoints.map(p => p.quantity)
  const baseWMA    = wma(quantities, WMA_WEIGHTS)
  const slope      = olsSlope(quantities)   // units per month

  // Project forward
  const forecastPoints = []
  const today = new Date()
  today.setDate(1)

  for (let i = 1; i <= forecastMonths; i++) {
    const futureDate = addMonths(today, i)
    const projected  = Math.max(0, Math.round(baseWMA + slope * i))
    forecastPoints.push({
      period:   monthKey(futureDate),
      label:    monthLabel(futureDate),
      quantity: projected,
      isForecast: true,
    })
  }

  // ── 7. Trend classification ────────────────────────────────────────────────
  // Combine OLS slope signal with Demand board signal (if present)
  let trend
  const slopeRatio = quantities.filter(q => q > 0).length > 0
    ? slope / (quantities.reduce((a, b) => a + b, 0) / quantities.filter(q => q > 0).length)
    : 0

  if (demandTrendSignal) {
    // Demand board is explicit — honour it but temper with OLS
    if      (demandTrendSignal === 'Rising'  && slopeRatio > -0.05) trend = 'INCREASING'
    else if (demandTrendSignal === 'Falling' && slopeRatio <  0.05) trend = 'DECREASING'
    else if (Math.abs(slopeRatio) < 0.05)                           trend = 'STABLE'
    else                                                             trend = slopeRatio > 0 ? 'INCREASING' : 'DECREASING'
  } else {
    if      (slopeRatio >  0.05) trend = 'INCREASING'
    else if (slopeRatio < -0.05) trend = 'DECREASING'
    else                         trend = 'STABLE'
  }

  // ── 8. Demand level ────────────────────────────────────────────────────────
  let demandLevel
  if (demandLevelSignal) {
    demandLevel = demandLevelSignal.toUpperCase()   // 'HIGH' | 'MEDIUM' | 'LOW'
  } else {
    // Derive from WMA vs average
    const avg = quantities.reduce((a, b) => a + b, 0) / (quantities.length || 1)
    const ratio = avg > 0 ? baseWMA / avg : 1
    if      (ratio > 1.2) demandLevel = 'HIGH'
    else if (ratio > 0.8) demandLevel = 'MEDIUM'
    else                  demandLevel = 'LOW'
  }

  // ── 9. Price forecast ─────────────────────────────────────────────────────
  // Weighted average of observed transaction prices
  const allPrices = historicalPoints.map(p => p.avgPrice).filter(p => p !== null && p > 0)
  let expectedPriceMin = null
  let expectedPriceMax = null

  if (allPrices.length > 0) {
    const avgTxPrice = Math.round(allPrices.reduce((a, b) => a + b, 0) / allPrices.length)
    // Small ±10 % band reflecting typical mandi price variation
    expectedPriceMin = Math.round(avgTxPrice * 0.9)
    expectedPriceMax = Math.round(avgTxPrice * 1.1)
  } else if (demandPriceMin !== null || demandPriceMax !== null) {
    expectedPriceMin = demandPriceMin ? Math.round(demandPriceMin) : null
    expectedPriceMax = demandPriceMax ? Math.round(demandPriceMax) : null
  }

  // ── 10. Confidence ──────────────────────────────────────────────────────────
  let confidence, confidenceScore
  if (nonZero.length >= CONFIDENCE_THRESHOLDS.HIGH) {
    confidence      = 'HIGH'
    confidenceScore = Math.min(95, 60 + nonZero.length * 3)
  } else if (nonZero.length >= CONFIDENCE_THRESHOLDS.MEDIUM) {
    confidence      = 'MEDIUM'
    confidenceScore = Math.min(65, 40 + nonZero.length * 5)
  } else {
    confidence      = 'LOW'
    confidenceScore = Math.max(20, nonZero.length * 10 + (demandSignals.length > 0 ? 15 : 0))
  }

  // ── 11. Recommendation ─────────────────────────────────────────────────────
  const totalForecastQty = forecastPoints.reduce((a, p) => a + p.quantity, 0)
  let recommendation

  if (trend === 'INCREASING') {
    recommendation = `Demand for ${name} is growing. Consider securing procurement contracts early — prices may rise over the forecast window.`
  } else if (trend === 'DECREASING') {
    recommendation = `Demand for ${name} is softening. You may have more supplier options and room to negotiate prices down.`
  } else {
    recommendation = `Demand for ${name} is broadly stable. Standard procurement planning is appropriate; no significant supply pressure is expected.`
  }

  if (confidence === 'LOW') {
    recommendation += ' Note: confidence is low due to limited historical data — this forecast will improve as more transactions are recorded.'
  }

  // ── 12. Data source attribution ────────────────────────────────────────────
  const sources = []
  if (orders.length > 0)       sources.push(`${orders.length} completed order${orders.length > 1 ? 's' : ''}`)
  if (bookings.length > 0)     sources.push(`${bookings.length} accepted booking${bookings.length > 1 ? 's' : ''}`)
  if (requirements.length > 0) sources.push(`${requirements.length} buyer requirement${requirements.length > 1 ? 's' : ''}`)
  if (demandSignals.length > 0) sources.push(`${demandSignals.length} market demand signal${demandSignals.length > 1 ? 's' : ''}`)

  return {
    success:          true,
    hasData:          true,
    cropName:         name,
    forecastMonths,
    forecastLabel:    `${forecastMonths} month${forecastMonths > 1 ? 's' : ''}`,
    trend,
    demandLevel,
    expectedPriceMin,
    expectedPriceMax,
    confidence,
    confidenceScore,
    recommendation,
    dataSources:      sources,
    historicalPoints,
    forecastPoints,
    totalForecastQty,
    meta: {
      historicalMonths:   LOOKBACK_MONTHS,
      nonZeroMonths:      nonZero.length,
      totalTransactions,
      demandSignalCount:  demandSignals.length,
      baseWMA:            Math.round(baseWMA),
      trendSlope:         Math.round(slope * 100) / 100,
    },
  }
}

module.exports = { generateForecast }
