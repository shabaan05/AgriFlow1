const mongoose = require('mongoose')

/**
 * Order — created automatically when a Booking is accepted.
 * Tracks the full fulfilment lifecycle from confirmation to delivery.
 */

const ORDER_STATUSES = [
  'Confirmed',
  'Preparing',
  'Ready for Pickup',
  'Picked Up',
  'In Transit',
  'Delivered',
  'Cancelled',
]

const timelineEventSchema = new mongoose.Schema({
  status:    { type: String, required: true },
  timestamp: { type: Date,   default: Date.now },
  note:      { type: String, default: '' },
}, { _id: false })

const orderSchema = new mongoose.Schema(
  {
    // ── Reference ──────────────────────────────────────────────────────────
    booking: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Booking',
      required: true,
    },
    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // ── Denormalised display fields ─────────────────────────────────────────
    buyerName:    { type: String, required: true },
    buyerCompany: { type: String, default: '' },
    cropName:     { type: String, required: true },
    variety:      { type: String, default: '' },

    // ── Terms ──────────────────────────────────────────────────────────────
    quantity:     { type: Number, required: true },
    unit:         { type: String, default: 'kg' },
    pricePerUnit: { type: Number, required: true },
    totalAmount:  { type: Number, required: true },

    // ── Logistics ──────────────────────────────────────────────────────────
    pickupLocation:   { type: String, default: '' },
    deliveryLocation: { type: String, default: '' },
    scheduledPickupDate: { type: Date },
    actualDeliveryDate:  { type: Date },

    // ── Status ─────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ORDER_STATUSES,
      default: 'Confirmed',
    },

    // Full status history for the timeline UI
    timeline: [timelineEventSchema],

    notes: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
)

orderSchema.index({ farmer: 1, status: 1 })
orderSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)
