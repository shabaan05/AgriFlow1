const mongoose = require('mongoose')

/**
 * Booking — a buyer's request to purchase a farmer's crop.
 * A Booking becomes an Order when the farmer accepts it.
 *
 * References User (farmer + buyer) and Crop.
 * farmer/buyer are stored as plain strings for now (no User model dependency
 * in Phase 1 — farmer creates bookings against their own crops via the API).
 */

const STATUSES = ['Pending', 'Accepted', 'Rejected', 'Cancelled', 'Completed']

const bookingSchema = new mongoose.Schema(
  {
    // ── Parties ──────────────────────────────────────────────────────────────
    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    // buyerId — set when a real Buyer account creates the booking.
    // Null for legacy/farmer-created seed bookings.
    buyerId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    // Buyer display fields (denormalised — always populated from user record)
    buyerName:    { type: String, required: true, trim: true },
    buyerCompany: { type: String, trim: true, default: '' },
    buyerContact: { type: String, trim: true, default: '' },

    // ── Crop ─────────────────────────────────────────────────────────────────
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Crop',
      required: true,
    },
    cropName:  { type: String, required: true },   // denormalised for display speed
    variety:   { type: String, default: '' },

    // ── Terms ─────────────────────────────────────────────────────────────────
    quantity:       { type: Number, required: true, min: 1 },
    unit:           { type: String, default: 'kg' },
    pricePerUnit:   { type: Number, required: true, min: 0 },
    totalAmount:    { type: Number, required: true, min: 0 },

    // ── Logistics ────────────────────────────────────────────────────────────
    deliveryLocation:     { type: String, trim: true, default: '' },
    requestedDeliveryDate: { type: Date },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    STATUSES,
      default: 'Pending',
    },
    rejectionReason: { type: String, default: '' },
    notes:           { type: String, default: '' },

    // Set when booking is accepted → becomes an Order
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Order',
      default: null,
    },
  },
  { timestamps: true, versionKey: false }
)

bookingSchema.index({ farmer: 1, status: 1 })
bookingSchema.index({ buyerId: 1, status: 1 })
bookingSchema.index({ createdAt: -1 })

module.exports = mongoose.model('Booking', bookingSchema)
