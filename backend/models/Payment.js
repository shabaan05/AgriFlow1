const mongoose = require('mongoose')

/**
 * Payment — one payment record per Order.
 * Created when an Order reaches 'Delivered'.
 * Payment gateway integration is intentionally deferred.
 */

const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed']

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Order',
      required: true,
      unique:   true,
    },
    farmer: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },

    // Denormalised for display
    buyerName:   { type: String, required: true },
    cropName:    { type: String, required: true },

    amount:      { type: Number, required: true, min: 0 },
    status:      { type: String, enum: PAYMENT_STATUSES, default: 'Pending' },

    // Set when status → Paid
    paidAt:      { type: Date, default: null },

    // Future: transactionId, gatewayRef, upiId, etc.
    notes:       { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
)

paymentSchema.index({ farmer: 1, status: 1 })

module.exports = mongoose.model('Payment', paymentSchema)
