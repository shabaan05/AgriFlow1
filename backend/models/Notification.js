const mongoose = require('mongoose')

const TYPES = ['booking', 'order', 'payment', 'pickup', 'system']

const notificationSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:    { type: String, enum: TYPES, default: 'system' },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    link:    { type: String, default: '' },   // e.g. '/farmer/orders/abc'
    meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false }
)

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
