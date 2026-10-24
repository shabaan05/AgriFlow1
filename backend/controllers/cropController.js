const Crop = require('../models/Crop')
const traceabilityService = require('../services/traceabilityService')

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format a Mongoose crop document into the shape the frontend expects.
 * Frontend uses short field names; backend uses canonical names.
 */
function formatCrop(doc) {
  const c = doc.toObject ? doc.toObject() : doc
  return {
    id:                  c._id.toString(),
    farmerId:            c.farmerId?.toString() || null,
    name:                c.cropName,
    variety:             c.variety,
    category:            c.category,
    totalQty:            c.totalQuantityKg,
    availableQty:        c.availableQuantityKg,
    unit:                c.unit,
    expectedHarvestDate: c.expectedHarvestDate
      ? c.expectedHarvestDate.toISOString().split('T')[0]  // 'YYYY-MM-DD'
      : null,
    shelfLifeDays:       c.expectedShelfLife,
    expectedPrice:       c.expectedPricePerKg,
    minPrice:            c.minimumAcceptablePrice,
    farmLocation:        c.farmLocation,
    grade:               c.qualityGrade,
    images:              c.images,
    notes:               c.notes,
    status:              c.status,
    createdAt:           c.createdAt,
    updatedAt:           c.updatedAt,
  }
}

/**
 * Map incoming frontend field names → Mongoose field names.
 */
function toDbFields(body) {
  return {
    cropName:               body.name,
    variety:                body.variety             || '',
    category:               body.category,
    totalQuantityKg:        Number(body.totalQty),
    availableQuantityKg:    Number(body.availableQty),
    unit:                   body.unit                || 'kg',
    expectedHarvestDate:    body.expectedHarvestDate,
    expectedShelfLife:      body.shelfLifeDays        ? Number(body.shelfLifeDays)  : 0,
    expectedPricePerKg:     Number(body.expectedPrice),
    minimumAcceptablePrice: body.minPrice             ? Number(body.minPrice)       : 0,
    farmLocation:           body.farmLocation,
    qualityGrade:           body.grade               || 'Grade A',
    status:                 body.status              || 'Pre-Harvest',
    images:                 body.images              || [],
    notes:                  body.notes               || '',
  }
}

// ── GET /api/crops ────────────────────────────────────────────────────────────
async function getAllCrops(req, res) {
  try {
    const crops = await Crop.find().sort({ createdAt: -1 })
    res.json(crops.map(formatCrop))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch crops', error: err.message })
  }
}

// ── GET /api/crops/:id ────────────────────────────────────────────────────────
async function getCropById(req, res) {
  try {
    const crop = await Crop.findById(req.params.id)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })
    res.json(formatCrop(crop))
  } catch (err) {
    // Malformed ObjectId → 404
    if (err.name === 'CastError') return res.status(404).json({ message: 'Crop not found' })
    res.status(500).json({ message: 'Failed to fetch crop', error: err.message })
  }
}

// ── POST /api/crops ───────────────────────────────────────────────────────────
async function createCrop(req, res) {
  try {
    const crop = new Crop(toDbFields(req.body))
    // Link crop to the authenticated farmer
    crop.farmerId = req.user._id
    await crop.save()
    res.status(201).json(formatCrop(crop))
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join('; ') })
    }
    res.status(500).json({ message: 'Failed to create crop', error: err.message })
  }
}

// ── PUT /api/crops/:id ────────────────────────────────────────────────────────
async function updateCrop(req, res) {
  try {
    const crop = await Crop.findById(req.params.id)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })

    const prevStatus = crop.status
    const prevGrade  = crop.qualityGrade

    Object.assign(crop, toDbFields(req.body))
    await crop.save()

    // ── Traceability events ──────────────────────────────────────────────────
    // HARVESTED — when crop status transitions to Harvested (or Harvest Ready for the first time)
    if (crop.status === 'Harvested' && prevStatus !== 'Harvested') {
      await traceabilityService.createEvent({
        farmerId:   req.user._id,
        cropId:     crop._id,
        eventType:  'HARVESTED',
        description:`${crop.cropName} harvested`,
        location:   crop.farmLocation,
        metadata:   { quantity: crop.totalQuantityKg, unit: crop.unit, grade: crop.qualityGrade },
      })
    }

    // QUALITY_CHECKED — when a grade is explicitly set/changed
    if (crop.qualityGrade && crop.qualityGrade !== prevGrade) {
      await traceabilityService.createEvent({
        farmerId:   req.user._id,
        cropId:     crop._id,
        eventType:  'QUALITY_CHECKED',
        description:`Quality grade recorded: ${crop.qualityGrade}`,
        metadata:   { grade: crop.qualityGrade },
      })
    }

    res.json(formatCrop(crop))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Crop not found' })
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join('; ') })
    }
    res.status(500).json({ message: 'Failed to update crop', error: err.message })
  }
}

// ── DELETE /api/crops/:id ─────────────────────────────────────────────────────
async function deleteCrop(req, res) {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })
    res.json({ message: 'Crop deleted successfully', id: req.params.id })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Crop not found' })
    res.status(500).json({ message: 'Failed to delete crop', error: err.message })
  }
}

module.exports = { getAllCrops, getCropById, createCrop, updateCrop, deleteCrop }
