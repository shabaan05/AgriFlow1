const mongoose = require('mongoose')

/**
 * BuyerRequirement — a buyer's clearly defined procurement need.
 *
 * Future AI integration:
 *   The Buyer Match Agent will consume { cropName, quantity, qualityGrade,
 *   minPricePerKg, maxPricePerKg, requiredByDate, deliveryLocation }
 *   to score and rank available Farmer crops.
 *
 *   Reserved extension fields (commented out):
 *   - aiMatchScore:   Number   — AI confidence score for top match
 *   - matchedCropIds: [ObjectId] — crops surfaced by Buyer Match Agent
 *   - matchedAt:      Date
 */

const STATUSES   = ['ACTIVE', 'FULFILLED', 'EXPIRED', 'CANCELLED']
const CATEGORIES = ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const GRADES     = ['Grade A', 'Grade B', 'Grade C', 'Any']
const UNITS      = ['kg', 'quintal', 'ton', 'bag', 'piece']

const requirementSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────────────────────────────────────
    buyerId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Buyer ID is required'],
    },

    // ── Crop ─────────────────────────────────────────────────────────────────
    cropName: {
      type:     String,
      required: [true, 'Crop name is required'],
      trim:     true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },
    variety:  { type: String, trim: true, default: '' },
    category: {
      type: String,
      enum: { values: [...CATEGORIES, ''], message: '{VALUE} is not a valid category' },
      default: '',
    },

    // ── Quantity ──────────────────────────────────────────────────────────────
    quantity: {
      type:     Number,
      required: [true, 'Quantity is required'],
      min:      [0.01, 'Quantity must be greater than 0'],
    },
    unit: {
      type:    String,
      enum:    UNITS,
      default: 'kg',
    },

    // ── Quality & Price ───────────────────────────────────────────────────────
    qualityGrade: {
      type:    String,
      enum:    { values: [...GRADES, ''], message: '{VALUE} is not a valid grade' },
      default: '',
    },
    minPricePerKg: {
      type:    Number,
      min:     [0, 'Price cannot be negative'],
      default: null,
    },
    maxPricePerKg: {
      type:    Number,
      min:     [0, 'Price cannot be negative'],
      default: null,
    },

    // ── Timeline ──────────────────────────────────────────────────────────────
    requiredByDate: {
      type:     Date,
      required: [true, 'Required by date is required'],
    },

    // ── Logistics ─────────────────────────────────────────────────────────────
    deliveryLocation: {
      type:     String,
      required: [true, 'Delivery location is required'],
      trim:     true,
    },

    // ── Misc ──────────────────────────────────────────────────────────────────
    notes: {
      type:    String,
      trim:    true,
      default: '',
    },
    status: {
      type:    String,
      enum:    STATUSES,
      default: 'ACTIVE',
    },

    // ── AI extension slots (reserved) ─────────────────────────────────────────
    // aiMatchScore:   { type: Number, default: null },
    // matchedCropIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Crop' }],
    // matchedAt:      { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
)

// ── Validation: minPrice ≤ maxPrice ──────────────────────────────────────────
requirementSchema.pre('save', function (next) {
  if (this.minPricePerKg !== null && this.maxPricePerKg !== null) {
    if (this.minPricePerKg > this.maxPricePerKg) {
      return next(new Error('Minimum price cannot exceed maximum price'))
    }
  }
  next()
})

// ── Indexes ───────────────────────────────────────────────────────────────────
requirementSchema.index({ buyerId: 1, status: 1 })
requirementSchema.index({ buyerId: 1, createdAt: -1 })
requirementSchema.index({ cropName: 'text' })
requirementSchema.index({ requiredByDate: 1 })

module.exports = mongoose.model('BuyerRequirement', requirementSchema)
