const mongoose = require('mongoose')

/**
 * Shortlist — a buyer's saved/shortlisted crops.
 * One document per (buyer, crop) pair.
 * Crops are never duplicated — compound unique index prevents it.
 */
const shortlistSchema = new mongoose.Schema(
  {
    buyerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    cropId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Crop',
      required: true,
    },
    // Denormalised for fast display without a join
    cropName:  { type: String, default: '' },
    farmLocation: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
)

// Prevent duplicate (buyer, crop) pairs
shortlistSchema.index({ buyerId: 1, cropId: 1 }, { unique: true })

module.exports = mongoose.model('Shortlist', shortlistSchema)
