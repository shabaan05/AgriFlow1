/**
 * harvestPlannerService.js
 *
 * Rule-based Harvest Planner Service.
 *
 * For each of the farmer's non-delivered crops, decides:
 *   HARVEST_NOW  — crop is at or past harvest date, or a booking deadline is imminent
 *   HARVEST_SOON — crop is within a 14-day window, or has confirmed bookings
 *   WAIT         — ample time before harvest, no booking pressure
 *   ALREADY_HARVESTED — crop already past harvest stage (Harvested / Pickup Scheduled / Delivered)
 *   INSUFFICIENT_DATA  — missing harvest date and no other timing signal
 *
 * Data sources (all existing models):
 *   Crop         — expectedHarvestDate, availableQuantityKg, status, expectedShelfLife
 *   Booking      — cropId→crop, requestedDeliveryDate, status (Pending/Accepted), quantity
 *   Order        — booking→crop, scheduledPickupDate, status
 *   BuyerRequirement — cropName, requiredByDate (demand signal, no direct link to crop)
 *   Demand       — cropName, demandLevel, demandTrend (platform market signals)
 *
 * No ML, no LLM, no external APIs. Pure deterministic rules.
 */

'use strict'

const Crop             = require('../models/Crop')
const Booking          = require('../models/Booking')
const Order            = require('../models/Order')
const BuyerRequirement = require('../models/BuyerRequirement')
const Demand           = require('../models/Demand')

// ── Config ────────────────────────────────────────────────────────────────────
// Statuses to include (exclude Delivered — no action needed)
const ACTIVE_CROP_STATUSES = new Set([
  'Pre-Harvest',
  'Harvest Ready',
  'Harvested',
  'Booked',
  'Pickup Scheduled',
])

// Booking statuses that count as "confirmed demand"
const CONFIRMED_BOOKING_STATUSES = new Set(['Pending', 'Accepted'])

// Days constants
const HARVEST_NOW_DAYS  = 3    // ≤ 3 days from now → HARVEST_NOW
const HARVEST_SOON_DAYS = 14   // ≤ 14 days → HARVEST_SOON
const BOOKING_URGENT_DAYS = 7  // booking delivery within 7 days → urgent

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysFrom(date) {
  if (!date) return null
  return Math.round((new Date(date) - Date.now()) / (1000 * 60 * 60 * 24))
}

function formatDate(date) {
  if (!date) return null
  return new Date(date).toISOString().slice(0, 10)
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ── Rule engine ───────────────────────────────────────────────────────────────
/**
 * Applies rules to produce a single recommendation for one crop.
 *
 * @param {object} crop        — lean Crop document
 * @param {object[]} bookings  — bookings whose crop === this crop's _id
 * @param {object[]} orders    — orders linked to those bookings
 * @param {object[]} requirements — ACTIVE BuyerRequirements whose cropName matches
 * @param {object|null} demandSignal — most recent Demand doc for this crop name
 * @returns {object} recommendation record
 */
function buildRecommendation(crop, bookings, orders, requirements, demandSignal) {
  const id    = crop._id.toString()
  const now   = Date.now()

  // ── Basic metadata ──────────────────────────────────────────────────────────
  const daysToHarvest  = daysFrom(crop.expectedHarvestDate)   // null if missing
  const harvestDateStr = formatDate(crop.expectedHarvestDate)
  const availableQty   = crop.availableQuantityKg || 0
  const shelfLife      = crop.expectedShelfLife   || 0

  // ── Booking analysis ────────────────────────────────────────────────────────
  const confirmedBookings = bookings.filter(b => CONFIRMED_BOOKING_STATUSES.has(b.status))
  const confirmedQty      = confirmedBookings.reduce((s, b) => s + (b.quantity || 0), 0)

  // Find the soonest delivery date across all confirmed bookings/orders
  let soonestDeadlineDays = null
  let soonestDeadlineDate = null

  for (const b of confirmedBookings) {
    const target = b.requestedDeliveryDate
    if (target) {
      const d = daysFrom(target)
      if (soonestDeadlineDays === null || d < soonestDeadlineDays) {
        soonestDeadlineDays = d
        soonestDeadlineDate = formatDate(target)
      }
    }
  }
  // Also check scheduledPickupDate from linked orders
  for (const o of orders) {
    if (o.scheduledPickupDate) {
      const d = daysFrom(o.scheduledPickupDate)
      if (soonestDeadlineDays === null || d < soonestDeadlineDays) {
        soonestDeadlineDays = d
        soonestDeadlineDate = formatDate(o.scheduledPickupDate)
      }
    }
  }

  // Unique buyer count from confirmed bookings
  const uniqueBuyerIds = new Set(confirmedBookings.map(b => b.buyerId?.toString()).filter(Boolean))
  const linkedBuyers   = uniqueBuyerIds.size

  // ── Demand signal ───────────────────────────────────────────────────────────
  // Also count active buyer requirements as a demand proxy
  const activeReqCount  = requirements.length
  const demandLevel     = demandSignal?.demandLevel  || null   // 'High' | 'Medium' | 'Low'
  const demandTrend     = demandSignal?.demandTrend  || null   // 'Rising' | 'Stable' | 'Falling'
  const isHighDemand    = demandLevel === 'High' || activeReqCount >= 3
  const isFallingDemand = demandTrend === 'Falling'

  // ── Shortfall detection ─────────────────────────────────────────────────────
  const qtyShortfall = confirmedQty > availableQty ? (confirmedQty - availableQty) : 0

  // ── Rule application ────────────────────────────────────────────────────────
  let rule            = 'WAIT'
  let urgency         = 'Low'
  let recommendedDate = harvestDateStr
  let recommendation  = ''
  const reasons       = []
  const actions       = []

  // Already past the harvest stage
  if (crop.status === 'Harvested' || crop.status === 'Pickup Scheduled') {
    rule       = 'ALREADY_HARVESTED'
    urgency    = 'Low'
    recommendation = `${crop.cropName} has already been harvested (status: ${crop.status}). Ensure timely pickup to protect shelf life.`
    reasons.push(`Crop status is ${crop.status}`)
    if (shelfLife > 0) {
      reasons.push(`Shelf life is ${shelfLife} days — coordinate pickup promptly`)
    }
    actions.push('Confirm pickup schedule with transporter')
    if (soonestDeadlineDate) actions.push(`Delivery deadline: ${soonestDeadlineDate}`)
    return buildResult(crop, confirmedBookings.length, linkedBuyers, daysToHarvest, harvestDateStr, recommendedDate, rule, urgency, recommendation, reasons, actions, availableQty, confirmedQty, qtyShortfall)
  }

  // No harvest date and no other signal
  if (daysToHarvest === null && confirmedBookings.length === 0 && !isHighDemand) {
    rule           = 'INSUFFICIENT_DATA'
    urgency        = 'Low'
    recommendation = `Missing harvest date for ${crop.cropName}. Set an expected harvest date to enable planning.`
    reasons.push('No expected harvest date set')
    actions.push('Update crop with an expected harvest date')
    return buildResult(crop, 0, 0, null, null, null, rule, urgency, recommendation, reasons, actions, availableQty, 0, 0)
  }

  // ── Core timing rules ───────────────────────────────────────────────────────

  // Rule 1: Deadline from booking is very soon — harvest urgently regardless of harvest date
  if (soonestDeadlineDays !== null && soonestDeadlineDays <= BOOKING_URGENT_DAYS) {
    rule           = 'HARVEST_NOW'
    urgency        = 'High'
    recommendedDate = formatDate(new Date(now + Math.max(0, soonestDeadlineDays - 2) * 86400000)) || harvestDateStr
    recommendation = `Booking deadline in ${soonestDeadlineDays} day${soonestDeadlineDays !== 1 ? 's' : ''} (${soonestDeadlineDate}). Harvest immediately to meet delivery.`
    reasons.push(`Confirmed booking delivery due in ${soonestDeadlineDays} days`)
    if (daysToHarvest !== null) reasons.push(`Planned harvest date: ${harvestDateStr}`)
    actions.push('Begin harvesting within 24 hours')
    actions.push(`Notify buyer/transporter — delivery by ${soonestDeadlineDate}`)
    if (qtyShortfall > 0) actions.push(`⚠ Shortfall: ${qtyShortfall} kg more committed than available — review booking quantities`)

  // Rule 2: Harvest date is at or past — time to harvest
  } else if (daysToHarvest !== null && daysToHarvest <= HARVEST_NOW_DAYS) {
    rule       = 'HARVEST_NOW'
    urgency    = daysToHarvest <= 0 ? 'High' : 'High'
    recommendation = daysToHarvest <= 0
      ? `${crop.cropName} harvest date has passed. Harvest immediately to prevent quality loss.`
      : `${crop.cropName} is ready to harvest in ${daysToHarvest} day${daysToHarvest !== 1 ? 's' : ''}. Begin preparation now.`
    reasons.push(daysToHarvest <= 0
      ? `Harvest date ${harvestDateStr} has passed`
      : `Harvest date ${harvestDateStr} is ${daysToHarvest} day${daysToHarvest !== 1 ? 's' : ''} away`)
    if (confirmedBookings.length > 0) reasons.push(`${confirmedBookings.length} confirmed booking${confirmedBookings.length > 1 ? 's' : ''} waiting`)
    if (shelfLife > 0) reasons.push(`Shelf life is ${shelfLife} days — act promptly`)
    actions.push('Start harvest immediately')
    actions.push('Arrange transporter/pickup')
    if (soonestDeadlineDate) actions.push(`Delivery deadline: ${soonestDeadlineDate}`)
    if (qtyShortfall > 0) actions.push(`⚠ Shortfall: ${qtyShortfall} kg more committed than available`)

  // Rule 3: Harvest soon window + confirmed bookings → prioritize
  } else if (daysToHarvest !== null && daysToHarvest <= HARVEST_SOON_DAYS && confirmedBookings.length > 0) {
    rule           = 'HARVEST_SOON'
    urgency        = 'Medium'
    recommendation = `Harvest ${crop.cropName} within the next ${daysToHarvest} days. ${confirmedBookings.length} confirmed booking${confirmedBookings.length > 1 ? 's' : ''} require timely delivery.`
    reasons.push(`Harvest date ${harvestDateStr} is ${daysToHarvest} days away`)
    reasons.push(`${confirmedBookings.length} confirmed booking${confirmedBookings.length > 1 ? 's' : ''} linked`)
    if (soonestDeadlineDate) reasons.push(`Nearest delivery deadline: ${soonestDeadlineDate}`)
    actions.push(`Plan harvest on ${harvestDateStr || 'scheduled date'}`)
    actions.push('Confirm pickup with transporter in advance')
    if (qtyShortfall > 0) actions.push(`⚠ Shortfall: ${qtyShortfall} kg more committed than available`)

  // Rule 4: Harvest soon window + high demand — recommend staying on schedule
  } else if (daysToHarvest !== null && daysToHarvest <= HARVEST_SOON_DAYS && isHighDemand) {
    rule           = 'HARVEST_SOON'
    urgency        = 'Medium'
    recommendation = `${crop.cropName} is approaching harvest in ${daysToHarvest} days with ${demandLevel || 'elevated'} market demand. Stay on schedule.`
    reasons.push(`Harvest in ${daysToHarvest} days`)
    if (demandLevel) reasons.push(`Market demand level: ${demandLevel}`)
    if (activeReqCount > 0) reasons.push(`${activeReqCount} active buyer requirement${activeReqCount > 1 ? 's' : ''} posted for this crop`)
    actions.push(`Harvest on ${harvestDateStr || 'scheduled date'}`)
    actions.push('List crop on marketplace if not already listed')

  // Rule 5: Ample time, no bookings, falling/low demand
  } else if ((daysToHarvest === null || daysToHarvest > HARVEST_SOON_DAYS) && !confirmedBookings.length) {
    rule           = 'WAIT'
    urgency        = 'Low'
    const timeline = daysToHarvest !== null ? ` in ${daysToHarvest} days` : ''
    recommendation = isFallingDemand
      ? `${crop.cropName} harvest${timeline} — market demand is falling. Consider finding buyers before harvest.`
      : `No immediate pressure — ${crop.cropName} harvest${timeline}. Monitor demand and secure bookings.`
    if (daysToHarvest !== null) reasons.push(`${daysToHarvest} days until harvest`)
    reasons.push('No confirmed bookings yet')
    if (demandLevel) reasons.push(`Current demand level: ${demandLevel}`)
    if (isFallingDemand) reasons.push('Demand trend is falling — consider pre-booking')
    actions.push('Post crop on marketplace to attract buyers')
    actions.push('Monitor demand signals in AI Centre → Demand Forecast')

  // Rule 6: Ample time but has bookings
  } else {
    rule           = 'WAIT'
    urgency        = 'Low'
    const timeline = daysToHarvest !== null ? ` in ${daysToHarvest} days` : ''
    recommendation = `${crop.cropName} harvest${timeline}. Bookings are in place — no action needed immediately.`
    if (daysToHarvest !== null) reasons.push(`${daysToHarvest} days until harvest — well ahead of schedule`)
    if (confirmedBookings.length > 0) reasons.push(`${confirmedBookings.length} booking${confirmedBookings.length > 1 ? 's' : ''} already confirmed`)
    actions.push('Prepare harvest equipment and storage')
    actions.push('Confirm delivery logistics closer to harvest date')
  }

  return buildResult(crop, confirmedBookings.length, linkedBuyers, daysToHarvest, harvestDateStr, recommendedDate, rule, urgency, recommendation, reasons, actions, availableQty, confirmedQty, qtyShortfall)
}

function buildResult(crop, linkedBookings, linkedBuyers, daysUntilHarvest, expectedHarvestDate, recommendedHarvestDate, rule, urgency, recommendation, reasons, actions, availableQty, confirmedQty, qtyShortfall) {
  return {
    id:                     crop._id.toString(),
    cropName:               crop.cropName,
    variety:                crop.variety || '',
    category:               crop.category,
    currentStatus:          crop.status,
    expectedHarvestDate,
    recommendedHarvestDate,
    availableQty,
    unit:                   crop.unit || 'kg',
    urgency,
    daysUntilHarvest:       daysUntilHarvest ?? null,
    linkedBookings,
    linkedBuyers,
    confirmedQty,
    qtyShortfall,
    rule,
    recommendation,
    reasons,
    actions,
  }
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * planHarvest(farmerId) → { success, summary, recommendations[], meta }
 */
async function planHarvest(farmerId) {
  if (!farmerId) {
    return { success: false, message: 'farmerId is required', recommendations: [] }
  }

  // 1. Fetch farmer's active crops
  const crops = await Crop.find({
    farmerId,
    status: { $in: [...ACTIVE_CROP_STATUSES] },
  }).lean()

  if (crops.length === 0) {
    return {
      success: true,
      recommendations: [],
      summary: { upcomingHarvests: 0, urgentHarvests: 0, nextHarvestDate: null },
      meta: { message: 'No active crops found. Add crops to see harvest recommendations.' },
    }
  }

  // 2. Fetch confirmed bookings for this farmer's crops
  const cropIds = crops.map(c => c._id)
  const allBookings = await Booking.find({
    farmer: farmerId,
    crop:   { $in: cropIds },
    status: { $in: ['Pending', 'Accepted'] },
  }).lean()

  // 3. Fetch linked orders (for scheduledPickupDate)
  const orderIds = allBookings.map(b => b.orderId).filter(Boolean)
  const allOrders = orderIds.length > 0
    ? await Order.find({ _id: { $in: orderIds }, status: { $nin: ['Cancelled', 'Delivered'] } }).lean()
    : []
  const orderMap = Object.fromEntries(allOrders.map(o => [o._id.toString(), o]))

  // 4. Fetch demand signals for all crop names
  const cropNames = [...new Set(crops.map(c => c.cropName.toLowerCase()))]
  const demandDocs = await Demand.find({
    cropName: { $in: cropNames.map(n => new RegExp(`^${escapeRegex(n)}$`, 'i')) },
    isActive: true,
  }).sort({ updatedAt: -1 }).lean()

  // Most recent demand signal per crop name
  const demandMap = {}
  for (const d of demandDocs) {
    const key = d.cropName.toLowerCase()
    if (!demandMap[key]) demandMap[key] = d
  }

  // 5. Fetch active BuyerRequirements for proxy demand counting
  const reqDocs = await (require('../models/BuyerRequirement')).find({
    cropName: { $in: cropNames.map(n => new RegExp(`^${escapeRegex(n)}$`, 'i')) },
    status:   'ACTIVE',
  }).lean()

  const reqMap = {}
  for (const r of reqDocs) {
    const key = r.cropName.toLowerCase()
    if (!reqMap[key]) reqMap[key] = []
    reqMap[key].push(r)
  }

  // 6. Build per-crop recommendations
  const recommendations = crops.map(crop => {
    const cropId   = crop._id.toString()
    const cropKey  = crop.cropName.toLowerCase()

    const cropBookings = allBookings.filter(b => b.crop?.toString() === cropId)
    const cropOrders   = cropBookings
      .map(b => b.orderId ? orderMap[b.orderId.toString()] : null)
      .filter(Boolean)
    const demandSignal = demandMap[cropKey] || null
    const requirements = reqMap[cropKey] || []

    return buildRecommendation(crop, cropBookings, cropOrders, requirements, demandSignal)
  })

  // 7. Sort by urgency priority then daysUntilHarvest ascending
  const urgencyOrder = { High: 0, Medium: 1, Low: 2 }
  recommendations.sort((a, b) => {
    const uDiff = (urgencyOrder[a.urgency] ?? 2) - (urgencyOrder[b.urgency] ?? 2)
    if (uDiff !== 0) return uDiff
    if (a.daysUntilHarvest === null) return 1
    if (b.daysUntilHarvest === null) return -1
    return a.daysUntilHarvest - b.daysUntilHarvest
  })

  // 8. Summary
  const upcomingHarvests = recommendations.filter(r =>
    r.rule !== 'ALREADY_HARVESTED' && r.daysUntilHarvest !== null
  ).length

  const urgentHarvests = recommendations.filter(r => r.urgency === 'High').length

  // Next harvest date = soonest future expectedHarvestDate
  const futureDates = recommendations
    .filter(r => r.expectedHarvestDate && r.daysUntilHarvest !== null && r.daysUntilHarvest >= 0)
    .map(r => r.expectedHarvestDate)
    .sort()
  const nextHarvestDate = futureDates[0] || null

  return {
    success:         true,
    isDemo:          false,
    agentId:         'harvest-planner',
    agentName:       'Harvest Planner',
    runAt:           new Date().toISOString(),
    recommendations,
    summary: {
      upcomingHarvests,
      urgentHarvests,
      nextHarvestDate,
    },
    meta: {
      totalCrops:         crops.length,
      withBookings:       crops.filter(c => allBookings.some(b => b.crop?.toString() === c._id.toString())).length,
      demandSignalsFound: Object.keys(demandMap).length,
      activeRequirements: reqDocs.length,
    },
  }
}

module.exports = { planHarvest }
