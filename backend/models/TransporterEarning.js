const mongoose = require('mongoose')

/**
 * TransporterEarning — one earning record per completed trip (PickupRequest).
 * Created automatically when a transporter marks a trip as Delivered.
 * Unique index on pickupRequestId prevents duplicate earnings.
 *
 * Payment status: PENDING → PAID (future payment gateway integration).
 */

const EARNING_STATUSES = ['PENDING', 'PAID']

const transporterEarningSchema = new mongoose.Schema(
  {
    pickupRequestId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'PickupRequest',
      required: true,
      unique:   true,     // one earning per trip
    },
    orderId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
    },
    transporterId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // ── Snapshot for fast display (no joins needed) ──────────────────────────
    cropName:         { type: String, required: true },
    quantity:         { type: Number, default: 0 },
    unit:             { type: String, default: 'kg' },
    pickupLocation:   { type: String, default: '' },
    deliveryLocation: { type: String, default: '' },

    // ── Earning details ──────────────────────────────────────────────────────
    amount: {
      type:     Number,
      required: true,
      min:      0,
    },
    // Breakdown of how the amount was calculated
    calculation: {
      baseAmount:        { type: Number, default: 0 },
      distanceComponent:  { type: Number, default: 0 },
      quantityComponent:  { type: Number, default: 0 },
      distanceKm:         { type: Number, default: 0 },
    },

    status: {
      type:    String,
      enum:    EARNING_STATUSES,
      default: 'PENDING',
    },
    paidAt: { type: Date, default: null },

    completedAt: { type: Date, default: Date.now },   // when trip was delivered
  },
  { timestamps: true, versionKey: false }
)

transporterEarningSchema.index({ transporterId: 1, status: 1 })
transporterEarningSchema.index({ transporterId: 1, completedAt: -1 })

module.exports = mongoose.model('TransporterEarning', transporterEarningSchema)
