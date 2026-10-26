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
const { recordOnChain } = require('./blockchainService')

/**
 * Create a traceability event if one doesn't already exist.
 * Automatically anchors the event to Polygon Amoy Testnet.
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
      // If existing event lacks blockchain hash, backfill it
      if (!existing.txHash || !existing.onChain) {
        try {
          const chainResult = await recordOnChain({
            batchId: orderId || cropId,
            eventType,
            location,
            metadata,
          })
          if (chainResult) {
            existing.txHash = chainResult.txHash
            existing.blockNumber = chainResult.blockNumber
            existing.onChain = true
            await existing.save()
          }
        } catch (_) {}
      }
      return existing
    }

    // ── Record on Polygon Amoy Blockchain ─────────────────────────────────
    let chainRecord = { txHash: null, blockNumber: null, onChain: false }
    try {
      chainRecord = await recordOnChain({
        batchId: orderId || cropId,
        eventType,
        location,
        metadata,
      })
    } catch (chainErr) {
      console.warn('[traceability] Blockchain recording warning:', chainErr.message)
    }

    // ── Create new event in MongoDB ────────────────────────────────────────
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
      txHash: chainRecord.txHash,
      blockNumber: chainRecord.blockNumber,
      onChain: Boolean(chainRecord.onChain),
    })

    return event
  } catch (err) {
    // Log but never throw — traceability should not break the main workflow
    console.error('[traceability] Failed to create event:', err.message)
    return null
  }
}

async function backfillEvents(events) {
  for (const e of events) {
    if (!e.txHash || !e.onChain) {
      try {
        const chainResult = await recordOnChain({
          batchId: e.orderId || e.cropId,
          eventType: e.eventType,
          location: e.location,
          metadata: e.metadata,
        })
        if (chainResult) {
          e.txHash = chainResult.txHash
          e.blockNumber = chainResult.blockNumber
          e.onChain = true
          await e.save()
        }
      } catch (_) {}
    }
  }
}

/**
 * Fetch all events for a specific crop, ordered chronologically.
 */
async function getEventsByCrop(cropId, farmerId) {
  const events = await TraceabilityEvent.find({ cropId, farmerId }).sort({ timestamp: 1 })
  await backfillEvents(events)
  return events
}

/**
 * Fetch all events for a specific order, ordered chronologically.
 */
async function getEventsByOrder(orderId, farmerId) {
  const events = await TraceabilityEvent.find({ orderId, farmerId }).sort({ timestamp: 1 })
  await backfillEvents(events)
  return events
}

/**
 * Fetch all events for a farmer (used for the overview page).
 */
async function getEventsByFarmer(farmerId) {
  const events = await TraceabilityEvent.find({ farmerId })
    .sort({ timestamp: -1 })
    .limit(100)
  await backfillEvents(events)
  return events
}

module.exports = { createEvent, getEventsByCrop, getEventsByOrder, getEventsByFarmer }

