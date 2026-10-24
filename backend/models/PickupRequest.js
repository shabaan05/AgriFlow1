const mongoose = require('mongoose')

/**
 * PickupRequest — created automatically when an Order reaches 'Ready for Pickup'.
 *
 * One PickupRequest per Order (unique index on orderId).
 * A transporter accepts the request, locking it (no two transporters can accept).
 * Accepting a request is the entry point for the Trip workflow (next task).
 */

const STATUSES = ['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']

const pickupRequestSchema = new mongoose.Schema(
  {
    // ── References ────────────────────────────────────────────────────────────
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
      unique:   true,    // one request per order
    },
    bookingId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Booking',
      default: null,
    },
    farmerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    buyerId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    // Set when a transporter accepts
    transporterId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // ── Crop / Order snapshot ─────────────────────────────────────────────────
    cropName:    { type: String, required: true },
    variety:     { type: String, default: '' },
    quantity:    { type: Number, required: true },
    unit:        { type: String, default: 'kg' },
    totalAmount: { type: Number, default: 0 },

    // ── Parties (denormalised for fast display) ───────────────────────────────
    farmerName:  { type: String, default: '' },
    buyerName:   { type: String, default: '' },
    buyerCompany:{ type: String, default: '' },

    // ── Logistics ─────────────────────────────────────────────────────────────
    pickupLocation:   { type: String, default: '' },
    deliveryLocation: { type: String, default: '' },
    pickupDate:       { type: Date, default: null },
    deliveryDate:     { type: Date, default: null },

    // ── Transport estimates (populated from simple heuristics; GPS/routing later) ──
    estimatedDistanceKm:   { type: Number, default: 0 },
    estimatedDurationHrs:  { type: Number, default: 0 },
    estimatedEarnings:     { type: Number, default: 0 },

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    STATUSES,
      default: 'PENDING',
    },

    rejectionReason: { type: String, default: '' },
    notes:           { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
)

pickupRequestSchema.index({ status: 1 })
pickupRequestSchema.index({ farmerId: 1 })
pickupRequestSchema.index({ transporterId: 1 })

module.exports = mongoose.model('PickupRequest', pickupRequestSchema)
