const mongoose = require('mongoose')

/**
 * TraceabilityEvent — records a single step in a crop's journey from harvest
 * to delivery and payment.
 *
 * Designed for future blockchain integration:
 *   - txHash / blockNumber fields are reserved but null until blockchain is connected
 *   - Each event has a stable _id that a smart contract can reference
 *   - metadata is flexible for storing additional on-chain data later
 */

const EVENT_TYPES = [
  'HARVESTED',
  'QUALITY_CHECKED',
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'PAYMENT_RECEIVED',
]

const EVENT_STATUSES = ['completed', 'current', 'pending']

const traceabilityEventSchema = new mongoose.Schema(
  {
    farmerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Crop',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Order',
      default: null,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Booking',
      default: null,
    },

    eventType: {
      type:     String,
      required: true,
      enum:     EVENT_TYPES,
    },

    // Human-readable description shown in the timeline
    description: { type: String, default: '' },

    // Location where the event occurred (farm, pickup point, delivery point, etc.)
    location: { type: String, default: '' },

    // ISO timestamp when the event actually happened (may differ from createdAt)
    timestamp: { type: Date, default: Date.now },

    // Flexible metadata for additional context (grade, amount, transporter, etc.)
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // ── Blockchain compatibility (reserved for future) ──────────────────────
    txHash:      { type: String, default: null },
    blockNumber: { type: Number, default: null },
    onChain:     { type: Boolean, default: false },
  },
  {
    timestamps: true,    // createdAt + updatedAt
    versionKey: false,
  }
)

// ── Indexes ──────────────────────────────────────────────────────────────────
traceabilityEventSchema.index({ farmerId: 1, cropId: 1, timestamp: 1 })
traceabilityEventSchema.index({ farmerId: 1, orderId: 1, timestamp: 1 })
traceabilityEventSchema.index({ eventType: 1 })

// ── Compound unique index to prevent duplicate events ───────────────────────
// One event of each type per crop+order combination
traceabilityEventSchema.index(
  { cropId: 1, orderId: 1, eventType: 1 },
  { unique: true, partialFilterExpression: { orderId: { $type: 'objectId' } } }
)
traceabilityEventSchema.index(
  { cropId: 1, eventType: 1 },
  { unique: true, partialFilterExpression: { orderId: null } }
)

module.exports = mongoose.model('TraceabilityEvent', traceabilityEventSchema)
