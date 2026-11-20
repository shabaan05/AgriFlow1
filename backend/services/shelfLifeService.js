/**
 * shelfLifeService.js
 *
 * Rule-based Shelf-Life Monitor Service.
 *
 * Purpose:
 *   For each of the farmer's crops, estimate remaining shelf life,
 *   assign a freshness status and risk level, and produce an informational
 *   recommendation. No automatic actions are taken.
 *
 * Data sources (existing models only):
 *   Crop.expectedShelfLife    — farmer-entered shelf-life estimate (days). Used when > 0.
 *   Crop.expectedHarvestDate  — used as the shelf-life start date for harvested crops.
 *   Crop.status               — determines whether shelf-life is ticking.
 *   Crop.category             — fallback shelf-life lookup when expectedShelfLife is 0.
 *   Crop.cropName             — additional fallback for well-known crop names.
 *   Crop.farmLocation         — displayed as storage location (best available proxy).
 *
 * Shelf-life source priority:
 *   1. crop.expectedShelfLife > 0  → use farmer's own estimate
 *   2. CROP_NAME_SHELF_LIFE[name]  → common crop name lookup (title-case)
 *   3. CATEGORY_SHELF_LIFE[cat]    → crop category fallback
 *   4. null                        → INSUFFICIENT_DATA
 *
 * Shelf-life starts ticking from:
 *   - expectedHarvestDate when status is Harvested / Pickup Scheduled / Delivered
 *   - For Pre-Harvest / Booked / Harvest Ready: shelf-life clock has NOT started yet.
 *     These are shown as informational (planning view) only.
 *
 * Risk thresholds (% of estimated total shelf life remaining):
 *   > 50 % remaining  → Fresh      / LOW risk
 *   25–50 %           → Attention  / MEDIUM risk
 *   10–25 %           → High risk  / HIGH
 *   ≤ 10 % or ≤ 0    → Critical   / CRITICAL
 *
 * DISCLAIMER: These are planning estimates based on typical industry figures.
 * Actual shelf life depends on storage conditions, temperature, handling and variety.
 * The values must NOT be used for food safety or regulatory decisions.
 */

'use strict'

const Crop = require('../models/Crop')

// ── Shelf-life reference tables ───────────────────────────────────────────────
// Source: widely-used agricultural guidance for Indian market crops.
// All values in days under typical farm/ambient storage (not refrigerated).

/**
 * Common crop name → typical ambient shelf life (days).
 * Keys are lowercase. Only well-known crops with reliable estimates are listed.
 */
const CROP_NAME_SHELF_LIFE = {
  // Vegetables (short)
  'tomato':          7,
  'spinach':         3,
  'lettuce':         4,
  'cucumber':        5,
  'capsicum':        10,
  'green chilli':    7,
  'coriander':       5,
  'methi':           4,
  'palak':           4,
  'beans':           7,
  'peas':            5,
  'brinjal':         7,
  'bitter gourd':    7,
  'bottle gourd':    7,
  'ladies finger':   5,
  'okra':            5,
  'cauliflower':     7,
  'cabbage':         14,
  'carrot':          21,
  'beetroot':        21,
  'radish':          10,
  'potato':          60,
  'sweet potato':    30,
  'garlic':          180,
  'ginger':          90,
  'onion':           90,
  // Fruits
  'mango':           7,
  'banana':          5,
  'papaya':          7,
  'guava':           5,
  'grapes':          10,
  'pomegranate':     21,
  'watermelon':      14,
  'orange':          21,
  'lemon':           14,
  'pineapple':       7,
  // Grains & Cereals (dry storage)
  'wheat':           365,
  'rice':            365,
  'maize':           180,
  'sorghum':         180,
  'corn':            180,
  'bajra':           180,
  'jowar':           180,
  // Pulses & Legumes
  'soybean':         120,
  'chickpea':        180,
  'toor dal':        180,
  'moong':           120,
  'urad':            120,
  'groundnut':       90,
  // Spices & Herbs
  'turmeric':        365,
  'coriander seeds': 365,
  'cumin':           365,
  'chilli':          180,
  'pepper':          365,
  // Oilseeds
  'mustard':         180,
  'sunflower':       120,
  'sesame':          120,
  'cotton':          365,   // cotton seed
}

/**
 * Crop category → typical ambient shelf life (days).
 * Fallback when crop name is not in the lookup.
 */
const CATEGORY_SHELF_LIFE = {
  'Vegetables':        7,
  'Fruits':            7,
  'Grains & Cereals':  270,
  'Pulses & Legumes':  150,
  'Spices & Herbs':    270,
  'Oilseeds':          120,
  'Other':             30,
}

// ── Risk thresholds ───────────────────────────────────────────────────────────
// Percent of total shelf life remaining → risk level
const RISK_THRESHOLDS = {
  CRITICAL:  10,   // ≤ 10 % remaining → Critical
  HIGH:      25,   // ≤ 25 % → High
  MEDIUM:    50,   // ≤ 50 % → Medium (Attention)
  // > 50 % → Fresh / Low
}

// Statuses where shelf-life clock is running
const HARVESTED_STATUSES = new Set(['Harvested', 'Pickup Scheduled', 'Delivered'])

// Statuses to include in monitoring (exclude Delivered — already done)
const MONITOR_STATUSES = new Set([
  'Pre-Harvest',
  'Harvest Ready',
  'Booked',
  'Harvested',
  'Pickup Scheduled',
])

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysElapsed(fromDate) {
  return Math.round((Date.now() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24))
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function resolveShelfLife(crop) {
  // 1. Farmer's own estimate
  if (crop.expectedShelfLife && crop.expectedShelfLife > 0) {
    return { days: crop.expectedShelfLife, source: 'farmer-estimate' }
  }

  // 2. Crop name lookup (lowercase, trimmed)
  const nameKey = (crop.cropName || '').trim().toLowerCase()
  if (CROP_NAME_SHELF_LIFE[nameKey] != null) {
    return { days: CROP_NAME_SHELF_LIFE[nameKey], source: 'crop-name-reference' }
  }

  // 3. Category fallback
  if (CATEGORY_SHELF_LIFE[crop.category] != null) {
    return { days: CATEGORY_SHELF_LIFE[crop.category], source: 'category-reference' }
  }

  return { days: null, source: null }
}

function classifyRisk(remainingPct, remainingDays) {
  if (remainingDays <= 0) {
    return { freshnessStatus: 'Critical', riskLevel: 'Critical' }
  }
  if (remainingPct <= RISK_THRESHOLDS.CRITICAL) {
    return { freshnessStatus: 'Critical', riskLevel: 'Critical' }
  }
  if (remainingPct <= RISK_THRESHOLDS.HIGH) {
    return { freshnessStatus: 'Critical', riskLevel: 'High' }
  }
  if (remainingPct <= RISK_THRESHOLDS.MEDIUM) {
    return { freshnessStatus: 'Attention', riskLevel: 'Medium' }
  }
  return { freshnessStatus: 'Fresh', riskLevel: 'Low' }
}

function buildRecommendation(crop, shelfDays, remainingDays, riskLevel, source) {
  const name   = crop.cropName

  if (riskLevel === 'Critical' && remainingDays <= 0) {
    return `⚠ Estimated shelf life for ${name} has expired. If this crop is still in storage, urgent sale or disposal is needed. Verify actual condition before selling.`
  }
  if (riskLevel === 'Critical') {
    return `⚠ ${name} has very little estimated freshness remaining (≤${RISK_THRESHOLDS.CRITICAL}%). Urgently prioritize sale and arrange buyer pickup as soon as possible.`
  }
  if (riskLevel === 'High') {
    return `${name} is approaching its freshness limit. Prioritize buyer matching and faster dispatch — ${remainingDays} estimated days remaining.`
  }
  if (riskLevel === 'Medium') {
    return `${name} is within the caution window. Plan to complete sales within the next ${remainingDays} days to avoid quality degradation.`
  }

  // Fresh / Low
  if (shelfDays >= 180) {
    return `${name} has an estimated ${remainingDays} days of shelf life remaining. Good shelf life — no immediate action needed.`
  }
  return `${name} is fresh with an estimated ${remainingDays} days remaining. Continue normal selling.`
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * monitorShelfLife(farmerId) → { success, summary, items[], meta }
 */
async function monitorShelfLife(farmerId) {
  if (!farmerId) {
    return { success: false, message: 'farmerId is required', items: [] }
  }

  const crops = await Crop.find({
    farmerId,
    status: { $in: [...MONITOR_STATUSES] },
  }).lean()

  if (crops.length === 0) {
    return {
      success: true,
      items:   [],
      summary: { totalMonitored: 0, fresh: 0, attention: 0, critical: 0 },
      meta:    { message: 'No monitored crops. Harvested crops will appear here.' },
    }
  }

  const items = crops.map(crop => {
    const id        = crop._id.toString()
    const { days: shelfDays, source } = resolveShelfLife(crop)

    // ── INSUFFICIENT_DATA cases ─────────────────────────────────────────────
    if (!shelfDays) {
      return {
        id,
        cropName:          crop.cropName,
        variety:           crop.variety || '',
        quantity:          crop.availableQuantityKg || 0,
        unit:              crop.unit || 'kg',
        harvestDate:       null,
        shelfLifeDays:     0,
        elapsedDays:       0,
        remainingDays:     0,
        expiryDate:        null,
        freshnessStatus:   'Insufficient Data',
        riskLevel:         'Unknown',
        storageLocation:   crop.farmLocation || '',
        recommendedAction: `No shelf-life reference available for "${crop.cropName}". Set an expected shelf life on the crop record to enable monitoring.`,
        source:            null,
        disclaimer:        null,
      }
    }

    const isHarvested = HARVESTED_STATUSES.has(crop.status)

    // Pre-harvest crops: clock hasn't started yet
    if (!isHarvested || !crop.expectedHarvestDate) {
      return {
        id,
        cropName:          crop.cropName,
        variety:           crop.variety || '',
        quantity:          crop.availableQuantityKg || 0,
        unit:              crop.unit || 'kg',
        harvestDate:       null,
        shelfLifeDays:     shelfDays,
        elapsedDays:       0,
        remainingDays:     shelfDays,
        expiryDate:        null,
        freshnessStatus:   'Fresh',
        riskLevel:         'Low',
        storageLocation:   crop.farmLocation || '',
        recommendedAction: `${crop.cropName} is not yet harvested. Estimated shelf life: ${shelfDays} days after harvest. Plan sales accordingly.`,
        source,
        disclaimer:        'Estimate — actual shelf life depends on storage conditions.',
      }
    }

    // Harvested crops: calculate elapsed + remaining
    const elapsedDays   = daysElapsed(crop.expectedHarvestDate)
    const remainingDays = shelfDays - elapsedDays
    const remainingPct  = Math.round((remainingDays / shelfDays) * 100)
    const { freshnessStatus, riskLevel } = classifyRisk(remainingPct, remainingDays)
    const expiryDate    = addDays(crop.expectedHarvestDate, shelfDays)

    return {
      id,
      cropName:          crop.cropName,
      variety:           crop.variety || '',
      quantity:          crop.availableQuantityKg || 0,
      unit:              crop.unit || 'kg',
      harvestDate:       new Date(crop.expectedHarvestDate).toISOString().slice(0, 10),
      shelfLifeDays:     shelfDays,
      elapsedDays,
      remainingDays:     Math.max(remainingDays, 0),
      remainingPct:      Math.max(0, Math.min(100, remainingPct)),
      expiryDate,
      freshnessStatus,
      riskLevel,
      storageLocation:   crop.farmLocation || '',
      recommendedAction: buildRecommendation(crop, shelfDays, remainingDays, riskLevel, source),
      source,
      disclaimer:        'Estimate — actual shelf life depends on storage conditions, temperature and handling.',
    }
  })

  // Sort: Critical first, then by remainingDays ascending
  const riskOrder = { Critical: 0, High: 1, Medium: 2, Low: 3, Unknown: 4 }
  items.sort((a, b) => {
    const rd = (riskOrder[a.riskLevel] ?? 4) - (riskOrder[b.riskLevel] ?? 4)
    if (rd !== 0) return rd
    return (a.remainingDays ?? 0) - (b.remainingDays ?? 0)
  })

  // Summary
  const summary = {
    totalMonitored: items.length,
    fresh:          items.filter(i => i.freshnessStatus === 'Fresh').length,
    attention:      items.filter(i => i.freshnessStatus === 'Attention').length,
    critical:       items.filter(i => i.freshnessStatus === 'Critical').length,
  }

  return {
    success:   true,
    isDemo:    false,
    agentId:   'shelf-life',
    agentName: 'Shelf-Life Monitor',
    runAt:     new Date().toISOString(),
    items,
    summary,
    meta: {
      totalCrops:        crops.length,
      harvestedCrops:    crops.filter(c => HARVESTED_STATUSES.has(c.status)).length,
      preHarvestCrops:   crops.filter(c => !HARVESTED_STATUSES.has(c.status)).length,
      disclaimer:        'Shelf-life estimates are planning aids only, not food safety assessments.',
    },
  }
}

module.exports = { monitorShelfLife }
