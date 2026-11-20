/**
 * wastagePreventionService.js
 *
 * Rule-based Wastage Prevention Agent.
 *
 * Reuses shelf-life logic from shelfLifeService (imported directly —
 * no duplicate DB queries by sharing the monitorShelfLife() result).
 *
 * Risk is calculated per crop combining:
 *   - Remaining shelf life (from shelfLifeService)
 *   - Unsold available quantity (availableQuantityKg minus committed booking qty)
 *   - Whether the crop has confirmed bookings covering the full quantity
 *   - Crop status (Pre-Harvest / Harvested etc.)
 *
 * Risk levels:
 *   CRITICAL — Harvested + ≤ CRITICAL_DAYS remaining + unsold qty > 0
 *   HIGH     — Short shelf life (≤ HIGH_DAYS) + unsold qty > 0
 *   MEDIUM   — Moderate shelf life (≤ MEDIUM_DAYS) + unsold qty > 0
 *   LOW      — Ample shelf life OR fully booked
 *   (Crops without shelf-life data or not yet harvested get a planning note only)
 *
 * Potential wastage quantity = max(0, availableQty − committed booking qty)
 * Potential revenue loss     = potentialWastageKg × expectedPricePerKg (est.)
 *
 * No automatic actions are taken. All outputs are recommendations only.
 */

'use strict'

const Crop             = require('../models/Crop')
const Booking          = require('../models/Booking')
const shelfLifeService = require('./shelfLifeService')

// ── Thresholds (days remaining on shelf life) ─────────────────────────────────
const THRESHOLDS = {
  CRITICAL: 3,    // ≤ 3 days → CRITICAL risk
  HIGH:     7,    // ≤ 7 days → HIGH risk
  MEDIUM:   21,   // ≤ 21 days → MEDIUM risk
  // > 21 days → LOW risk
}

// Statuses where the crop has been harvested and risk is real
const HARVESTED_STATUSES = new Set(['Harvested', 'Pickup Scheduled'])

// Booking statuses that count as committed demand
const COMMITTED_STATUSES = new Set(['Pending', 'Accepted'])

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return '—'
  return `₹${Math.round(amount).toLocaleString('en-IN')}`
}

function buildActions(riskLevel, hasBookings, remainingDays) {
  const actions = []
  if (riskLevel === 'Critical' || riskLevel === 'High') {
    actions.push({ action: 'Find Buyer',        label: 'Find Buyer',        priority: 1 })
    actions.push({ action: 'Prioritize Pickup', label: 'Prioritize Pickup', priority: 2 })
    if (riskLevel === 'Critical') {
      actions.push({ action: 'Offer Discount',  label: 'Offer Discount',    priority: 3 })
    }
  } else if (riskLevel === 'Medium') {
    actions.push({ action: 'Find Buyer',        label: 'Find Buyer',        priority: 1 })
    actions.push({ action: 'Sell Locally',      label: 'Sell Locally',      priority: 2 })
    if (!hasBookings) {
      actions.push({ action: 'Offer Discount',  label: 'Offer Discount',    priority: 3 })
    }
  } else {
    // Low
    actions.push({ action: 'Find Buyer',        label: 'Find Buyer',        priority: 1 })
    actions.push({ action: 'Sell Locally',      label: 'Sell Locally',      priority: 2 })
  }
  return actions
}

function buildUrgency(riskLevel, remainingDays) {
  if (riskLevel === 'Critical') {
    if (remainingDays <= 0) return 'Act immediately — estimated shelf life has expired'
    return `Act within ${remainingDays} day${remainingDays !== 1 ? 's' : ''} — critical risk`
  }
  if (riskLevel === 'High')   return `Act within ${Math.max(1, remainingDays - 1)} days`
  if (riskLevel === 'Medium') return `Plan sale within ${remainingDays} days`
  return 'Monitor regularly and list on marketplace'
}

function buildRiskReasons(crop, remainingDays, shelfDays, unsoldQty, commitedQty, hasBookings, source) {
  const reasons = []

  if (shelfDays > 0 && remainingDays !== null) {
    if (remainingDays <= 0) {
      reasons.push(`Estimated shelf life has expired (${shelfDays} days from harvest date)`)
    } else {
      reasons.push(`Only ${remainingDays} day${remainingDays !== 1 ? 's' : ''} estimated shelf life remaining of ${shelfDays} total`)
    }
    if (source === 'crop-name-reference' || source === 'category-reference') {
      reasons.push(`Shelf life estimated from ${source === 'crop-name-reference' ? 'industry reference' : 'crop category'} — set your own value on the crop record for precision`)
    }
  }

  if (unsoldQty > 0) {
    reasons.push(`${unsoldQty} kg has no confirmed buyer yet`)
  }
  if (commitedQty > 0 && unsoldQty > 0) {
    reasons.push(`${commitedQty} kg covered by bookings, ${unsoldQty} kg still unbooked`)
  }
  if (!hasBookings) {
    reasons.push('No active bookings for this crop')
  }
  if (HARVESTED_STATUSES.has(crop.status)) {
    reasons.push(`Crop has been harvested (status: ${crop.status}) — shelf life is now ticking`)
  }

  return reasons
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * detectWastageRisks(farmerId) → { success, summary, alerts[], meta }
 */
async function detectWastageRisks(farmerId) {
  if (!farmerId) {
    return { success: false, message: 'farmerId is required', alerts: [] }
  }

  // ── 1. Get shelf-life data for all monitored crops ─────────────────────────
  // monitorShelfLife already does the Crop DB fetch with the right status filter.
  // We pass farmerId so it's scoped correctly — no extra Crop query needed.
  const slResult = await shelfLifeService.monitorShelfLife(farmerId)

  if (!slResult.success) {
    return { success: false, message: slResult.message || 'Failed to load crop data', alerts: [] }
  }

  if (slResult.items.length === 0) {
    return {
      success: true,
      alerts:  [],
      summary: { atRiskCrops: 0, potentialWastageKg: 0, potentialRevenueLoss: '₹0' },
      meta:    { message: 'No monitored crops found.' },
    }
  }

  // ── 2. Fetch committed booking quantities for all these crops ──────────────
  const cropIds       = slResult.items.map(i => i.id)
  const allBookings   = await Booking.find({
    farmer: farmerId,
    crop:   { $in: cropIds },
    status: { $in: [...COMMITTED_STATUSES] },
  }).lean()

  // Map: cropId → total committed kg
  const committedMap = {}
  for (const b of allBookings) {
    const key = b.crop?.toString()
    if (key) committedMap[key] = (committedMap[key] || 0) + (b.quantity || 0)
  }

  // ── 3. Cross-reference crops from the DB for price info ────────────────────
  // slResult.items have no price field — we need expectedPricePerKg.
  const cropDocs = await Crop.find({
    farmerId,
    _id: { $in: cropIds },
  }).select('_id expectedPricePerKg availableQuantityKg status').lean()
  const cropMap = Object.fromEntries(cropDocs.map(c => [c._id.toString(), c]))

  // ── 4. Evaluate each shelf-life item for wastage risk ─────────────────────
  const alerts = []

  for (const item of slResult.items) {
    const cropDoc      = cropMap[item.id] || {}
    const availableQty = item.quantity    || 0
    const expectedPrice = cropDoc.expectedPricePerKg || 0
    const committedQty  = committedMap[item.id]      || 0
    const unsoldQty     = Math.max(0, availableQty - committedQty)
    const hasBookings   = committedQty > 0

    // Skip crops with no available quantity (already sold out / 0 stock)
    if (availableQty <= 0) continue

    // ── Determine risk ──────────────────────────────────────────────────────
    let riskLevel    = null
    const remaining  = item.remainingDays  // 0 if not yet harvested (pre-harvest items)
    const shelfDays  = item.shelfLifeDays
    const isHarvested = HARVESTED_STATUSES.has(item.currentStatus || cropDoc.status)

    if (item.freshnessStatus === 'Insufficient Data') {
      // Can't assess — skip from alerts (no shelf life reference)
      continue
    }

    if (isHarvested && unsoldQty > 0) {
      // Harvested + unsold → real wastage risk based on shelf life left
      if (remaining <= THRESHOLDS.CRITICAL) {
        riskLevel = 'Critical'
      } else if (remaining <= THRESHOLDS.HIGH) {
        riskLevel = 'High'
      } else if (remaining <= THRESHOLDS.MEDIUM) {
        riskLevel = 'Medium'
      } else {
        riskLevel = 'Low'
      }
    } else if (!isHarvested && unsoldQty > 0 && shelfDays > 0 && shelfDays <= THRESHOLDS.HIGH) {
      // Not yet harvested, but short shelf life crop with no buyer = planning risk
      riskLevel = 'Medium'
    } else if (!isHarvested && unsoldQty > 0) {
      riskLevel = 'Low'
    } else {
      // Fully booked or no unsold qty
      riskLevel = 'Low'
    }

    // Only surface Medium, High, Critical in alerts (Low filtered below summary level)
    if (riskLevel === 'Low') continue

    // ── Potential wastage ───────────────────────────────────────────────────
    // Conservative: at-risk quantity = unsold quantity (what hasn't been booked)
    const potentialWastageKg    = unsoldQty
    const potentialRevenueLoss  = expectedPrice > 0
      ? formatCurrency(potentialWastageKg * expectedPrice)
      : '—'

    const riskReasons = buildRiskReasons(
      { status: cropDoc.status || item.currentStatus || '' },
      remaining, shelfDays,
      unsoldQty, committedQty, hasBookings, item.source
    )

    alerts.push({
      id:               item.id,
      cropName:         item.cropName,
      variety:          item.variety || '',
      availableQty,
      unit:             item.unit,
      riskLevel,
      riskReasons,
      potentialWastageKg,
      potentialRevenueLoss,
      expectedPrice,
      remainingShelfLifeDays: remaining,
      shelfLifeDays:          shelfDays,
      harvestDate:            item.harvestDate,
      storageLocation:        item.storageLocation || '',
      committedQty,
      hasBookings,
      recommendedActions: buildActions(riskLevel, hasBookings, remaining),
      urgency:            buildUrgency(riskLevel, remaining),
    })
  }

  // ── 5. Sort: Critical first, then High, then Medium ───────────────────────
  const riskOrder = { Critical: 0, High: 1, Medium: 2 }
  alerts.sort((a, b) => {
    const rd = (riskOrder[a.riskLevel] ?? 3) - (riskOrder[b.riskLevel] ?? 3)
    if (rd !== 0) return rd
    return (a.remainingShelfLifeDays ?? 999) - (b.remainingShelfLifeDays ?? 999)
  })

  // ── 6. Summary ─────────────────────────────────────────────────────────────
  const totalWastageKg    = alerts.reduce((s, a) => s + (a.potentialWastageKg || 0), 0)

  // Revenue loss sum only where price is available
  const lossSum = alerts.reduce((s, a) => {
    const v = a.expectedPrice > 0 ? a.potentialWastageKg * a.expectedPrice : 0
    return s + v
  }, 0)

  return {
    success:   true,
    isDemo:    false,
    agentId:   'wastage-prevention',
    agentName: 'Wastage Prevention Agent',
    runAt:     new Date().toISOString(),
    alerts,
    summary: {
      atRiskCrops:          alerts.length,
      potentialWastageKg:   totalWastageKg,
      potentialRevenueLoss: lossSum > 0 ? formatCurrency(lossSum) : (alerts.length > 0 ? '—' : '₹0'),
    },
    meta: {
      totalCropsChecked: slResult.items.length,
      disclaimer:        'Potential loss is an estimate based on expected price × unsold quantity. Actual outcomes depend on market conditions.',
    },
  }
}

module.exports = { detectWastageRisks }
