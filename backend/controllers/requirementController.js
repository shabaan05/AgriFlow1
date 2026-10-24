const BuyerRequirement = require('../models/BuyerRequirement')

// ── Format helper ─────────────────────────────────────────────────────────────
function fmt(doc) {
  const d = doc.toObject ? doc.toObject() : doc
  return {
    id:               d._id.toString(),
    buyerId:          d.buyerId?.toString(),
    cropName:         d.cropName,
    variety:          d.variety,
    category:         d.category,
    quantity:         d.quantity,
    unit:             d.unit,
    qualityGrade:     d.qualityGrade,
    minPricePerKg:    d.minPricePerKg,
    maxPricePerKg:    d.maxPricePerKg,
    requiredByDate:   d.requiredByDate ? d.requiredByDate.toISOString().split('T')[0] : null,
    deliveryLocation: d.deliveryLocation,
    notes:            d.notes,
    status:           d.status,
    createdAt:        d.createdAt,
    updatedAt:        d.updatedAt,
  }
}

// ── POST /api/requirements ────────────────────────────────────────────────────
async function createRequirement(req, res) {
  try {
    const {
      cropName, variety, category,
      quantity, unit, qualityGrade,
      minPricePerKg, maxPricePerKg,
      requiredByDate, deliveryLocation, notes,
    } = req.body

    if (!cropName || !quantity || !requiredByDate || !deliveryLocation) {
      return res.status(400).json({
        message: 'cropName, quantity, requiredByDate and deliveryLocation are required',
      })
    }
    if (quantity <= 0) {
      return res.status(400).json({ message: 'Quantity must be greater than 0' })
    }
    if (minPricePerKg !== undefined && maxPricePerKg !== undefined
        && minPricePerKg !== null && maxPricePerKg !== null
        && Number(minPricePerKg) > Number(maxPricePerKg)) {
      return res.status(400).json({ message: 'Minimum price cannot exceed maximum price' })
    }

    const req_ = await BuyerRequirement.create({
      buyerId:          req.user._id,   // ALWAYS from JWT — never from body
      cropName:         cropName.trim(),
      variety:          variety          || '',
      category:         category         || '',
      quantity:         Number(quantity),
      unit:             unit             || 'kg',
      qualityGrade:     qualityGrade     || '',
      minPricePerKg:    minPricePerKg    !== undefined ? Number(minPricePerKg) : null,
      maxPricePerKg:    maxPricePerKg    !== undefined ? Number(maxPricePerKg) : null,
      requiredByDate,
      deliveryLocation: deliveryLocation.trim(),
      notes:            notes            || '',
      status:           'ACTIVE',
    })
    res.status(201).json(fmt(req_))
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join('; ') })
    }
    res.status(500).json({ message: 'Failed to create requirement', error: err.message })
  }
}

// ── GET /api/requirements ─────────────────────────────────────────────────────
async function getMyRequirements(req, res) {
  try {
    const filter = { buyerId: req.user._id }

    // Optional query params
    if (req.query.status)   filter.status   = req.query.status
    if (req.query.cropName) filter.cropName = { $regex: req.query.cropName, $options: 'i' }

    const reqs = await BuyerRequirement.find(filter).sort({ createdAt: -1 })
    res.json(reqs.map(fmt))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch requirements', error: err.message })
  }
}

// ── GET /api/requirements/:id ─────────────────────────────────────────────────
async function getRequirementById(req, res) {
  try {
    const req_ = await BuyerRequirement.findOne({
      _id:     req.params.id,
      buyerId: req.user._id,          // ensures buyer owns it
    })
    if (!req_) return res.status(404).json({ message: 'Requirement not found' })
    res.json(fmt(req_))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Requirement not found' })
    res.status(500).json({ message: 'Failed to fetch requirement', error: err.message })
  }
}

// ── PUT /api/requirements/:id ─────────────────────────────────────────────────
async function updateRequirement(req, res) {
  try {
    const req_ = await BuyerRequirement.findOne({
      _id:     req.params.id,
      buyerId: req.user._id,
    })
    if (!req_) return res.status(404).json({ message: 'Requirement not found' })

    if (req_.status !== 'ACTIVE') {
      return res.status(400).json({
        message: `Cannot edit a requirement with status: ${req_.status}`,
      })
    }

    const allowed = [
      'cropName', 'variety', 'category',
      'quantity', 'unit', 'qualityGrade',
      'minPricePerKg', 'maxPricePerKg',
      'requiredByDate', 'deliveryLocation', 'notes',
    ]
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        req_[field] = ['quantity', 'minPricePerKg', 'maxPricePerKg'].includes(field)
          ? req.body[field] !== null ? Number(req.body[field]) : null
          : req.body[field]
      }
    })

    // Server-side price validation
    if (req_.minPricePerKg !== null && req_.maxPricePerKg !== null
        && req_.minPricePerKg > req_.maxPricePerKg) {
      return res.status(400).json({ message: 'Minimum price cannot exceed maximum price' })
    }

    await req_.save()
    res.json(fmt(req_))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Requirement not found' })
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join('; ') })
    }
    res.status(500).json({ message: 'Failed to update requirement', error: err.message })
  }
}

// ── PUT /api/requirements/:id/cancel ─────────────────────────────────────────
async function cancelRequirement(req, res) {
  try {
    const req_ = await BuyerRequirement.findOne({
      _id:     req.params.id,
      buyerId: req.user._id,
    })
    if (!req_) return res.status(404).json({ message: 'Requirement not found' })

    if (req_.status !== 'ACTIVE') {
      return res.status(400).json({
        message: `Only ACTIVE requirements can be cancelled (current: ${req_.status})`,
      })
    }

    req_.status = 'CANCELLED'
    await req_.save()
    res.json(fmt(req_))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Requirement not found' })
    res.status(500).json({ message: 'Failed to cancel requirement', error: err.message })
  }
}

module.exports = {
  createRequirement,
  getMyRequirements,
  getRequirementById,
  updateRequirement,
  cancelRequirement,
}
