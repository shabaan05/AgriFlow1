/**
 * traceabilityService.js — internal helper for creating traceability events.
 *
 * createEvent() is idempotent: it checks for an existing event with the same
 * (cropId, orderId, eventType) combination before creating a new one.
 * This prevents duplicate events when the same status update is triggered
 * multiple times.
 *
 * This service is called by existing controllers (crop, booking, order, payment)
 * — it does NOT expose any routes of its own.
 */

const TraceabilityEvent = require('../models/TraceabilityEvent')

/**
 * Create a traceability event if one doesn't already exist.
 *
 * @param {Object} params
 * @param {ObjectId} params.farmerId   — required
 * @param {ObjectId} params.cropId      — required
 * @param {ObjectId} [params.orderId]   — optional (null for crop-only events)
 * @param {ObjectId} [params.bookingId]  — optional
 * @param {String}   params.eventType   — required, one of EVENT_TYPES
 * @param {String}   [params.description]
 * @param {String}   [params.location]
 * @param {Date}     [params.timestamp]
 * @param {Object}   [params.metadata]
 * @returns {Promise<Object|null>} the created event doc, or null if it already existed
 */
async function createEvent(params) {
  try {
    const { farmerId, cropId, orderId = null, bookingId = null,
            eventType, description = '', location = '',
            timestamp, metadata = {} } = params

    if (!farmerId || !cropId || !eventType) {
      console.warn('[traceability] Missing required fields, skipping event:', { farmerId, cropId, eventType })
      return null
    }

    // ── Dedup check: look for an existing event with same crop+order+type ──
    const query = { cropId, eventType }
    if (orderId) query.orderId = orderId
    else query.orderId = null

    const existing = await TraceabilityEvent.findOne(query)
    if (existing) {
      // Event already recorded — return it without creating a duplicate
      return existing
    }

    // ── Create new event ──────────────────────────────────────────────────
    const event = await TraceabilityEvent.create({
      farmerId,
      cropId,
      orderId,
      bookingId,
      eventType,
      description,
      location,
      timestamp: timestamp || new Date(),
      metadata,
    })

    return event
  } catch (err) {
    // Log but never throw — traceability should not break the main workflow
    console.error('[traceability] Failed to create event:', err.message)
    return null
  }
}

/**
 * Fetch all events for a specific crop, ordered chronologically.
 */
async function getEventsByCrop(cropId, farmerId) {
  return TraceabilityEvent.find({ cropId, farmerId }).sort({ timestamp: 1 })
}

/**
 * Fetch all events for a specific order, ordered chronologically.
 */
async function getEventsByOrder(orderId, farmerId) {
  return TraceabilityEvent.find({ orderId, farmerId }).sort({ timestamp: 1 })
}

/**
 * Fetch all events for a farmer (used for the overview page).
 */
async function getEventsByFarmer(farmerId) {
  return TraceabilityEvent.find({ farmerId })
    .sort({ timestamp: -1 })
    .limit(100)
}

module.exports = { createEvent, getEventsByCrop, getEventsByOrder, getEventsByFarmer }
