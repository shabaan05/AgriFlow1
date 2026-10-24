const Crop      = require('../models/Crop')
const User      = require('../models/User')
const Shortlist = require('../models/Shortlist')

// ── Format helpers ────────────────────────────────────────────────────────────
function formatCropForMarket(crop, farmer) {
  const c = crop.toObject ? crop.toObject() : crop
  return {
    id:                  c._id.toString(),
    name:                c.cropName,
    variety:             c.variety,
    category:            c.category,
    totalQty:            c.totalQuantityKg,
    availableQty:        c.availableQuantityKg,
    unit:                c.unit,
    expectedHarvestDate: c.expectedHarvestDate
      ? c.expectedHarvestDate.toISOString().split('T')[0]
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
    // Farmer info (safe — no password, no payment, no private fields)
    farmer: farmer ? {
      id:           farmer._id.toString(),
      name:         farmer.name,
      farmName:     farmer.farmInfo?.farmName     || '',
      farmLocation: farmer.farmInfo?.farmLocation || c.farmLocation,
      farmSize:     farmer.farmInfo?.farmSize     || '',
      farmingType:  farmer.farmInfo?.farmingType  || '',
      mainCrops:    farmer.farmInfo?.mainCrops    || [],
      verification: farmer.verification?.status   || 'Not Verified',
    } : null,
  }
}

// ── GET /api/marketplace/crops ────────────────────────────────────────────────
// Returns crops that are in a "sellable" status, with farmer info attached.
// Buyers can browse without owning the crops.
async function getMarketplaceCrops(req, res) {
  try {
    // Only show crops that are available for sale
    const sellableStatuses = ['Pre-Harvest', 'Harvest Ready', 'Harvested', 'Booked']
    const crops = await Crop.find({
      status: { $in: sellableStatuses },
      availableQuantityKg: { $gt: 0 },
    }).sort({ createdAt: -1 })

    // Use crop.farmerId as primary lookup; fallback to location match for legacy crops
    const farmerIds = [...new Set(crops.map((c) => c.farmerId?.toString()).filter(Boolean))]
    const farmers   = farmerIds.length > 0
      ? await User.find({ _id: { $in: farmerIds } }).select('name farmInfo verification')
      : await User.find({ role: 'farmer' }).select('name farmInfo verification')

    const farmerById = {}
    const farmerByLocation = {}
    farmers.forEach((f) => {
      farmerById[f._id.toString()] = f
      const loc = (f.farmInfo?.farmLocation || '').toLowerCase().trim()
      if (loc && !farmerByLocation[loc]) farmerByLocation[loc] = f
    })

    const result = crops.map((crop) => {
      const farmer = (crop.farmerId && farmerById[crop.farmerId.toString()])
        || farmerByLocation[(crop.farmLocation || '').toLowerCase().trim()]
        || null
      return formatCropForMarket(crop, farmer)
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch marketplace crops', error: err.message })
  }
}

// ── GET /api/marketplace/crops/:id ───────────────────────────────────────────
async function getMarketplaceCropById(req, res) {
  try {
    const crop = await Crop.findById(req.params.id)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })

    // Primary: use crop.farmerId. Fallback: location match for legacy crops.
    let farmer = null
    if (crop.farmerId) {
      farmer = await User.findById(crop.farmerId).select('name farmInfo verification')
    }
    if (!farmer && crop.farmLocation) {
      farmer = await User.findOne({
        role: 'farmer',
        'farmInfo.farmLocation': { $regex: new RegExp(crop.farmLocation, 'i') },
      }).select('name farmInfo verification')
    }

    res.json(formatCropForMarket(crop, farmer))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Crop not found' })
    res.status(500).json({ message: 'Failed to fetch crop', error: err.message })
  }
}

// ── GET /api/marketplace/farmer/:id ──────────────────────────────────────────
async function getFarmerPublicProfile(req, res) {
  try {
    const farmer = await User.findOne({ _id: req.params.id, role: 'farmer' })
      .select('name farmInfo verification createdAt')
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' })

    // Get this farmer's available crops (by location match — same logic as above)
    const crops = await Crop.find({
      farmLocation: { $regex: new RegExp(farmer.farmInfo?.farmLocation || '', 'i') },
      status: { $in: ['Pre-Harvest', 'Harvest Ready', 'Harvested', 'Booked'] },
      availableQuantityKg: { $gt: 0 },
    }).sort({ createdAt: -1 })

    res.json({
      farmer: {
        id:           farmer._id.toString(),
        name:         farmer.name,
        farmName:     farmer.farmInfo?.farmName     || '',
        farmLocation: farmer.farmInfo?.farmLocation || '',
        farmSize:     farmer.farmInfo?.farmSize     || '',
        farmingType:  farmer.farmInfo?.farmingType  || '',
        mainCrops:    farmer.farmInfo?.mainCrops    || [],
        description:  farmer.farmInfo?.description  || '',
        verification: farmer.verification?.status   || 'Not Verified',
        memberSince:  farmer.createdAt,
      },
      crops: crops.map((c) => formatCropForMarket(c, farmer)),
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Farmer not found' })
    res.status(500).json({ message: 'Failed to fetch farmer profile', error: err.message })
  }
}

// ── Shortlist ─────────────────────────────────────────────────────────────────

// POST /api/shortlist
async function addToShortlist(req, res) {
  try {
    const { cropId } = req.body
    if (!cropId) return res.status(400).json({ message: 'cropId is required' })

    const crop = await Crop.findById(cropId)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })

    // upsert — safe if already shortlisted (no duplicate)
    const item = await Shortlist.findOneAndUpdate(
      { buyerId: req.user._id, cropId },
      { buyerId: req.user._id, cropId, cropName: crop.cropName, farmLocation: crop.farmLocation },
      { upsert: true, new: true }
    )
    res.status(201).json({ id: item._id.toString(), cropId, cropName: crop.cropName })
  } catch (err) {
    res.status(500).json({ message: 'Failed to add to shortlist', error: err.message })
  }
}

// GET /api/shortlist
async function getShortlist(req, res) {
  try {
    const items = await Shortlist.find({ buyerId: req.user._id })
      .sort({ createdAt: -1 })

    // Populate full crop data
    const cropIds = items.map((i) => i.cropId)
    const crops   = await Crop.find({ _id: { $in: cropIds } })
    const allFarmers = await User.find({ role: 'farmer' }).select('name farmInfo verification')

    const farmerByLocation = {}
    allFarmers.forEach((f) => {
      const loc = (f.farmInfo?.farmLocation || '').toLowerCase().trim()
      if (loc && !farmerByLocation[loc]) farmerByLocation[loc] = f
    })

    const result = crops.map((crop) => {
      const loc    = (crop.farmLocation || '').toLowerCase().trim()
      const farmer = farmerByLocation[loc] || null
      return { ...formatCropForMarket(crop, farmer), shortlisted: true }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shortlist', error: err.message })
  }
}

// DELETE /api/shortlist/:cropId
async function removeFromShortlist(req, res) {
  try {
    const deleted = await Shortlist.findOneAndDelete({
      buyerId: req.user._id,
      cropId:  req.params.cropId,
    })
    if (!deleted) return res.status(404).json({ message: 'Item not in shortlist' })
    res.json({ message: 'Removed from shortlist', cropId: req.params.cropId })
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove from shortlist', error: err.message })
  }
}

// GET /api/shortlist/ids — just the crop IDs (for fast UI badge state)
async function getShortlistIds(req, res) {
  try {
    const items = await Shortlist.find({ buyerId: req.user._id }).select('cropId')
    res.json(items.map((i) => i.cropId.toString()))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shortlist IDs', error: err.message })
  }
}

module.exports = {
  getMarketplaceCrops, getMarketplaceCropById, getFarmerPublicProfile,
  addToShortlist, getShortlist, removeFromShortlist, getShortlistIds,
}
