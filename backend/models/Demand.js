const mongoose = require('mongoose')

/**
 * Demand model — represents a market demand signal for a specific crop/location.
 *
 * Designed as the foundation for the future Demand Forecast AI Agent.
 * The agent will add fields like: forecastScore, aiConfidence, demandDrivers, etc.
 *
 * Sources:
 *   'manual'   — entered by admin/platform team
 *   'buyer'    — derived from buyer requirement postings
 *   'market'   — future: scraped/API market data
 *   'ai'       — future: AI Demand Forecast Agent output
 */

const DEMAND_LEVELS  = ['High', 'Medium', 'Low']
const DEMAND_TRENDS  = ['Rising', 'Stable', 'Falling']
const CATEGORIES     = ['Vegetables', 'Fruits', 'Grains & Cereals', 'Pulses & Legumes', 'Spices & Herbs', 'Oilseeds', 'Other']
const SOURCES        = ['manual', 'buyer', 'market', 'ai']

const buyerRequirementSchema = new mongoose.Schema({
  buyerName:        { type: String, required: true, trim: true },
  companyName:      { type: String, trim: true, default: '' },
  requiredQuantity: { type: Number, required: true, min: 1 },
  unit:             { type: String, default: 'kg' },
  qualityGrade:     { type: String, default: 'Grade A' },
  expectedPrice:    { type: Number, default: 0 },
  deliveryLocation: { type: String, trim: true, default: '' },
  deadline:         { type: Date },
  notes:            { type: String, default: '' },
}, { _id: false })

const demandSchema = new mongoose.Schema(
  {
    cropName:   { type: String, required: [true, 'Crop name is required'], trim: true },
    variety:    { type: String, trim: true, default: '' },
    category:   { type: String, enum: CATEGORIES, required: true },

    demandQuantity:    { type: Number, required: true, min: 0 },
    unit:              { type: String, default: 'kg' },
    expectedPriceMin:  { type: Number, default: 0 },
    expectedPriceMax:  { type: Number, default: 0 },

    location:    { type: String, required: true, trim: true },
    demandLevel: { type: String, enum: DEMAND_LEVELS, required: true },
    demandTrend: { type: String, enum: DEMAND_TRENDS, default: 'Stable' },
    requiredBy:  { type: Date },

    source:      { type: String, enum: SOURCES, default: 'manual' },
    isActive:    { type: Boolean, default: true },

    // Embedded buyer requirements (0–many per demand signal)
    buyerRequirements: [buyerRequirementSchema],

    // ── AI extension slots (reserved for Demand Forecast Agent) ─────────────
    // forecastScore:  Number,
    // aiConfidence:   Number,
    // demandDrivers:  [String],
    // forecastPeriod: { start: Date, end: Date },
  },
  { timestamps: true, versionKey: false }
)

demandSchema.index({ demandLevel: 1 })
demandSchema.index({ category: 1 })
demandSchema.index({ location: 1 })
demandSchema.index({ cropName: 'text', location: 'text' })

module.exports = mongoose.model('Demand', demandSchema)
