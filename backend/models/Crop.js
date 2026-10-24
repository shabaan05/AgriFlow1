const mongoose = require('mongoose')

/**
 * Crop model — matches the frontend schema documented in AGENTS.md.
 * Field names use the canonical backend naming convention (camelCase, descriptive).
 * The frontend service layer (cropApi.js) maps between short UI names and these names.
 *
 * Designed to be extended for:
 *   - Booking references (bookings: [{ type: ObjectId, ref: 'Booking' }])
 *   - Order references  (orders:   [{ type: ObjectId, ref: 'Order' }])
 *   - AI agent metadata (aiTags, demandScore, spoilageRisk, etc.)
 *   - Farmer user ref  (farmer:   { type: ObjectId, ref: 'User' }) — add when auth is ready
 */

const STATUSES    = ['Pre-Harvest', 'Booked', 'Harvest Ready', 'Harvested', 'Pickup Scheduled', 'Delivered']
const CATEGORIES  = ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const GRADES      = ['Grade A', 'Grade B', 'Grade C']
const UNITS       = ['kg', 'quintal', 'ton', 'bag', 'piece']

const cropSchema = new mongoose.Schema(
  {
    // ── Owner ────────────────────────────────────────────────────────────────
    farmerId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // ── Core ────────────────────────────────────────────────────────────────
    cropName: {
      type:     String,
      required: [true, 'Crop name is required'],
      trim:     true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },
    variety: {
      type:  String,
      trim:  true,
      default: '',
    },
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     { values: CATEGORIES, message: '{VALUE} is not a valid category' },
    },

    // ── Quantity ─────────────────────────────────────────────────────────────
    totalQuantityKg: {
      type:     Number,
      required: [true, 'Total quantity is required'],
      min:      [0.01, 'Total quantity must be greater than 0'],
    },
    availableQuantityKg: {
      type:     Number,
      required: [true, 'Available quantity is required'],
      min:      [0, 'Available quantity cannot be negative'],
    },
    unit: {
      type:    String,
      enum:    { values: UNITS, message: '{VALUE} is not a valid unit' },
      default: 'kg',
    },

    // ── Harvest & Freshness ──────────────────────────────────────────────────
    expectedHarvestDate: {
      type:     Date,
      required: [true, 'Expected harvest date is required'],
    },
    expectedShelfLife: {
      type:    Number,          // days
      min:     [0, 'Shelf life cannot be negative'],
      default: 0,
    },

    // ── Pricing ──────────────────────────────────────────────────────────────
    expectedPricePerKg: {
      type:     Number,
      required: [true, 'Expected price is required'],
      min:      [0, 'Price cannot be negative'],
    },
    minimumAcceptablePrice: {
      type:    Number,
      min:     [0, 'Minimum price cannot be negative'],
      default: 0,
    },

    // ── Location & Quality ───────────────────────────────────────────────────
    farmLocation: {
      type:     String,
      required: [true, 'Farm location is required'],
      trim:     true,
    },
    qualityGrade: {
      type:    String,
      enum:    { values: GRADES, message: '{VALUE} is not a valid grade' },
      default: 'Grade A',
    },

    // ── Status ───────────────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    { values: STATUSES, message: '{VALUE} is not a valid status' },
      default: 'Pre-Harvest',
    },

    // ── Media & Notes ─────────────────────────────────────────────────────────
    images: {
      type:    [String],   // URLs — placeholder until image upload is built
      default: [],
    },
    notes: {
      type:    String,
      trim:    true,
      default: '',
    },

    // ── Future extension slots (commented out until modules are built) ────────
    // farmer:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
    // orders:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
  },
  {
    timestamps: true,   // adds createdAt + updatedAt automatically
    versionKey: false,
  }
)

// ── Indexes ──────────────────────────────────────────────────────────────────
cropSchema.index({ status:   1 })
cropSchema.index({ category: 1 })
cropSchema.index({ cropName: 'text', variety: 'text', farmLocation: 'text' })

// ── Validation: availableQty <= totalQty ─────────────────────────────────────
cropSchema.pre('save', function (next) {
  if (this.availableQuantityKg > this.totalQuantityKg) {
    return next(new Error('Available quantity cannot exceed total quantity'))
  }
  next()
})

module.exports = mongoose.model('Crop', cropSchema)
