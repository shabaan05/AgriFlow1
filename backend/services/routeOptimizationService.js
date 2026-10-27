/**
 * routeOptimizationService.js
 *
 * Deterministic Route Optimization Service — no ML, no LLM, no external APIs.
 *
 * Approach:
 *   1. Hard-filter invalid / ineligible pickup requests.
 *   2. Compute a composite priority score for each request (urgency + load fit).
 *   3. Build a greedy "nearest-neighbor" pickup sequence based on location
 *      token similarity (no lat/lng available — text-based proximity).
 *   4. Calculate aggregated route metrics (total distance, duration, load).
 *   5. Return a sequenced route with per-stop detail and an explanation.
 *
 * Location distance proxy:
 *   Because no GPS coordinates exist in the data (confirmed — only plain-text
 *   location strings on PickupRequest), "distance" between two locations is
 *   estimated as follows:
 *     - Same city token overlap → 0 (adjacent)
 *     - Same state token overlap → medium
 *     - No overlap → far
 *   The existing `estimatedDistanceKm` on each PickupRequest (set when the
 *   request was created) is used as the per-leg distance for route totals.
 *   Within-route ordering uses the token-similarity proxy.
 *
 * Urgency:
 *   Derived from pickupDate proximity (days until scheduled pickup).
 *   A shorter window → higher urgency. No shelf-life cross-reference is
 *   attempted here (would require joining Booking → Crop, adding latency).
 */

'use strict'

const PickupRequest = require('../models/PickupRequest')

// ── Constants ─────────────────────────────────────────────────────────────────
// Statuses that can be included in a route plan
const PLANNABLE_STATUSES = new Set(['PENDING'])

// Speed assumption (km/h) for duration estimates
const ASSUMED_SPEED_KMH = 45

// Days until scheduled pickup → urgency tier
const URGENCY_DAYS = { HIGH: 1, MEDIUM: 3 }   // ≤1 day = HIGH, ≤3 days = MEDIUM

// ── Helpers ───────────────────────────────────────────────────────────────────
function tokenize(location) {
  return (location || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

/**
 * Location similarity score 0–1 (1 = identical, 0 = no shared tokens).
 * Used as a "nearness" heuristic for greedy ordering.
 */
function locationSimilarity(locA, locB) {
  const ta = new Set(tokenize(locA))
  const tb = new Set(tokenize(locB))
  if (ta.size === 0 || tb.size === 0) return 0
  let shared = 0
  ta.forEach(t => { if (tb.has(t)) shared++ })
  return shared / Math.max(ta.size, tb.size)
}

/**
 * Urgency label for a pickup request based on pickupDate proximity.
 */
function calcUrgency(pickupDate) {
  if (!pickupDate) return 'NORMAL'
  const daysUntil = (new Date(pickupDate) - Date.now()) / (1000 * 60 * 60 * 24)
  if (daysUntil <= URGENCY_DAYS.HIGH)   return 'HIGH'
  if (daysUntil <= URGENCY_DAYS.MEDIUM) return 'MEDIUM'
  return 'NORMAL'
}

/**
 * Composite priority score (higher → earlier in route).
 * Factors:
 *   - Urgency: HIGH=60, MEDIUM=30, NORMAL=10
 *   - Quantity: proportional to vehicle capacity (higher load first)
 *   - Earnings: higher earnings prioritised (reward efficiency)
 */
function priorityScore(req, vehicleCapacity) {
  const urgencyScore = req.urgency === 'HIGH' ? 60 : req.urgency === 'MEDIUM' ? 30 : 10
  const loadRatio    = vehicleCapacity > 0 ? Math.min(req.quantity / vehicleCapacity, 1) : 0
  const earningsNorm = req.estimatedEarnings > 0 ? Math.min(req.estimatedEarnings / 5000, 1) : 0
  return urgencyScore + loadRatio * 25 + earningsNorm * 15
}

/**
 * Greedy nearest-neighbor sort.
 * Starts from the highest-priority request (pre-sorted), then at each step
 * picks the next unvisited stop with the highest location similarity to
 * the last stop's delivery location.
 */
function greedySequence(requests) {
  if (requests.length <= 1) return [...requests]

  const remaining = [...requests]
  const result    = []

  // Start with highest-priority stop
  remaining.sort((a, b) => b._score - a._score)
  result.push(remaining.shift())

  while (remaining.length > 0) {
    const lastDelivery = result[result.length - 1].deliveryLocation
    // Find remaining stop whose pickup location is closest to last delivery
    let bestIdx  = 0
    let bestSim  = -1
    remaining.forEach((r, i) => {
      const sim = locationSimilarity(lastDelivery, r.pickupLocation)
      if (sim > bestSim) { bestSim = sim; bestIdx = i }
    })
    result.push(remaining.splice(bestIdx, 1)[0])
  }

  return result
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * optimize({ pickupRequestIds, vehicleCapacity }) → route plan
 *
 * vehicleCapacity: number in kg  (caller parses string from vehicleInfo.capacity)
 */
async function optimize({ pickupRequestIds, vehicleCapacity = 1000 }) {
  if (!Array.isArray(pickupRequestIds) || pickupRequestIds.length === 0) {
    return { success: false, message: 'At least one pickup request ID is required' }
  }

  const capKg = Math.max(1, Number(vehicleCapacity) || 1000)

  // ── 1. Fetch requested pickups ────────────────────────────────────────────
  const docs = await PickupRequest.find({
    _id: { $in: pickupRequestIds },
  }).lean()

  if (docs.length === 0) {
    return { success: false, message: 'No matching pickup requests found' }
  }

  // ── 2. Hard filter ────────────────────────────────────────────────────────
  const filtered = []
  const rejected = []

  for (const doc of docs) {
    if (!PLANNABLE_STATUSES.has(doc.status)) {
      rejected.push({ id: doc._id.toString(), reason: `Status is ${doc.status} — only PENDING requests can be planned` })
      continue
    }
    filtered.push(doc)
  }

  if (filtered.length === 0) {
    return {
      success: false,
      message: 'None of the selected requests are plannable (must be PENDING)',
      rejected,
    }
  }

  // ── 3. Capacity check ─────────────────────────────────────────────────────
  const totalQty = filtered.reduce((s, r) => s + (r.quantity || 0), 0)
  const overCapacity = totalQty > capKg

  // ── 4. Enrich with urgency + score ────────────────────────────────────────
  const enriched = filtered.map(r => ({
    id:                   r._id.toString(),
    orderId:              r.orderId?.toString(),
    cropName:             r.cropName,
    variety:              r.variety || '',
    quantity:             r.quantity,
    unit:                 r.unit || 'kg',
    farmerName:           r.farmerName || '',
    buyerName:            r.buyerName  || '',
    pickupLocation:       r.pickupLocation  || '',
    deliveryLocation:     r.deliveryLocation || '',
    pickupDate:           r.pickupDate  || null,
    estimatedDistanceKm:  r.estimatedDistanceKm  || 0,
    estimatedDurationHrs: r.estimatedDurationHrs || 0,
    estimatedEarnings:    r.estimatedEarnings    || 0,
    totalAmount:          r.totalAmount  || 0,
    urgency:              calcUrgency(r.pickupDate),
    _score:               0,
  }))

  // Assign priority scores
  enriched.forEach(r => { r._score = priorityScore(r, capKg) })

  // ── 5. Build optimized sequence ───────────────────────────────────────────
  const sequence = greedySequence(enriched)

  // ── 6. Build stop list ────────────────────────────────────────────────────
  const stops = []
  let cumDistKm = 0
  let cumLoadKg = 0

  sequence.forEach((req, i) => {
    cumLoadKg += req.quantity

    // Pickup stop
    stops.push({
      stopNumber:   stops.length + 1,
      type:         'PICKUP',
      requestId:    req.id,
      orderId:      req.orderId,
      cropName:     req.cropName,
      variety:      req.variety,
      quantity:     req.quantity,
      unit:         req.unit,
      farmerName:   req.farmerName,
      location:     req.pickupLocation || 'Pickup location not specified',
      pickupDate:   req.pickupDate,
      urgency:      req.urgency,
      cumulativeLoadKg: cumLoadKg,
    })

    // Delivery stop
    cumDistKm += req.estimatedDistanceKm
    stops.push({
      stopNumber:   stops.length + 1,
      type:         'DELIVERY',
      requestId:    req.id,
      orderId:      req.orderId,
      cropName:     req.cropName,
      buyerName:    req.buyerName,
      location:     req.deliveryLocation || 'Delivery location not specified',
      distanceFromPrev: req.estimatedDistanceKm,
      cumulativeDistanceKm: cumDistKm,
      estimatedEarnings: req.estimatedEarnings,
    })
  })

  const totalDistanceKm         = cumDistKm
  const estimatedDurationMins   = Math.round((totalDistanceKm / ASSUMED_SPEED_KMH) * 60)
  const totalLoadKg             = totalQty
  const totalEarnings           = sequence.reduce((s, r) => s + r.estimatedEarnings, 0)

  // ── 7. Priority reason ────────────────────────────────────────────────────
  const highUrgent = sequence.filter(r => r.urgency === 'HIGH').length
  const medUrgent  = sequence.filter(r => r.urgency === 'MEDIUM').length
  let priorityReason = ''
  if (highUrgent > 0) {
    priorityReason = `${highUrgent} high-urgency pickup${highUrgent > 1 ? 's' : ''} scheduled today — placed first in sequence.`
  } else if (medUrgent > 0) {
    priorityReason = `${medUrgent} pickup${medUrgent > 1 ? 's' : ''} due within 3 days — prioritised early in sequence.`
  } else {
    priorityReason = 'No urgent pickups — sequence optimised by delivery proximity to minimise backtracking.'
  }

  // ── 8. Summary ────────────────────────────────────────────────────────────
  const optimizationSummary =
    `${sequence.length} pickup${sequence.length > 1 ? 's' : ''} sequenced across ${stops.length} stops. ` +
    `Total load: ${totalLoadKg} kg${overCapacity ? ` ⚠ exceeds vehicle capacity of ${capKg} kg` : ` (within ${capKg} kg capacity)`}. ` +
    `Estimated distance: ${totalDistanceKm} km · ~${Math.round(estimatedDurationMins / 60 * 10) / 10} hrs. ` +
    `Estimated earnings: ₹${totalEarnings.toLocaleString('en-IN')}.`

  return {
    success:                  true,
    route:                    sequence.map(r => ({
      requestId:              r.id,
      orderId:                r.orderId,
      cropName:               r.cropName,
      variety:                r.variety,
      quantity:               r.quantity,
      unit:                   r.unit,
      farmerName:             r.farmerName,
      buyerName:              r.buyerName,
      pickupLocation:         r.pickupLocation,
      deliveryLocation:       r.deliveryLocation,
      pickupDate:             r.pickupDate,
      estimatedDistanceKm:    r.estimatedDistanceKm,
      estimatedEarnings:      r.estimatedEarnings,
      urgency:                r.urgency,
      priorityScore:          Math.round(r._score),
    })),
    stops,
    totalDistanceKm,
    estimatedDurationMinutes: estimatedDurationMins,
    totalLoadKg,
    totalEarnings,
    overCapacity,
    vehicleCapacity:          capKg,
    stopCount:                stops.length,
    pickupCount:              sequence.length,
    rejected,
    priorityReason,
    optimizationSummary,
  }
}

module.exports = { optimize }
