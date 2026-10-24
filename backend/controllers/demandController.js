const Demand = require('../models/Demand')

// ── Seed data — inserted once if the collection is empty ────────────────────
const SEED_DATA = [
  {
    cropName: 'Tomato', variety: 'Hybrid Roma', category: 'Vegetables',
    demandQuantity: 5000, unit: 'kg',
    expectedPriceMin: 26, expectedPriceMax: 32,
    location: 'Pune, Maharashtra', demandLevel: 'High', demandTrend: 'Rising',
    requiredBy: new Date('2026-11-05'), source: 'buyer', isActive: true,
    buyerRequirements: [
      { buyerName: 'Vikram Nair', companyName: 'FreshMart Pvt Ltd', requiredQuantity: 2000, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 30, deliveryLocation: 'Pune, Maharashtra', deadline: new Date('2026-11-05'), notes: 'Prefer chemical-free produce.' },
      { buyerName: 'Priya Shah', companyName: 'GreenBasket Co.', requiredQuantity: 1500, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 28, deliveryLocation: 'Nashik, Maharashtra', deadline: new Date('2026-11-03'), notes: '' },
    ],
  },
  {
    cropName: 'Onion', variety: 'Nasik Red', category: 'Vegetables',
    demandQuantity: 8000, unit: 'kg',
    expectedPriceMin: 20, expectedPriceMax: 26,
    location: 'Mumbai, Maharashtra', demandLevel: 'High', demandTrend: 'Stable',
    requiredBy: new Date('2026-11-10'), source: 'buyer', isActive: true,
    buyerRequirements: [
      { buyerName: 'Anand Joshi', companyName: 'Metro Wholesale', requiredQuantity: 5000, unit: 'kg', qualityGrade: 'Grade B', expectedPrice: 22, deliveryLocation: 'Mumbai, Maharashtra', deadline: new Date('2026-11-10'), notes: 'Bulk delivery preferred.' },
    ],
  },
  {
    cropName: 'Tomato', variety: 'Cherry', category: 'Vegetables',
    demandQuantity: 2000, unit: 'kg',
    expectedPriceMin: 28, expectedPriceMax: 34,
    location: 'Kolhapur, Maharashtra', demandLevel: 'High', demandTrend: 'Rising',
    requiredBy: new Date('2026-11-08'), source: 'buyer', isActive: true,
    buyerRequirements: [
      { buyerName: 'Sneha Patil', companyName: 'NatureFresh Ltd', requiredQuantity: 2000, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 32, deliveryLocation: 'Kolhapur, Maharashtra', deadline: new Date('2026-11-08'), notes: 'Export-quality required.' },
    ],
  },
  {
    cropName: 'Wheat', variety: 'GW-496', category: 'Grains & Cereals',
    demandQuantity: 15000, unit: 'kg',
    expectedPriceMin: 17, expectedPriceMax: 21,
    location: 'Aurangabad, Maharashtra', demandLevel: 'Medium', demandTrend: 'Stable',
    requiredBy: new Date('2026-11-20'), source: 'manual', isActive: true,
    buyerRequirements: [
      { buyerName: 'Ramesh Kulkarni', companyName: 'Sunrise Flour Mills', requiredQuantity: 10000, unit: 'kg', qualityGrade: 'Grade B', expectedPrice: 19, deliveryLocation: 'Aurangabad, Maharashtra', deadline: new Date('2026-11-20'), notes: 'Milling-grade wheat required.' },
    ],
  },
  {
    cropName: 'Mango', variety: 'Alphonso', category: 'Fruits',
    demandQuantity: 3000, unit: 'kg',
    expectedPriceMin: 110, expectedPriceMax: 130,
    location: 'Ratnagiri, Maharashtra', demandLevel: 'High', demandTrend: 'Rising',
    requiredBy: new Date('2026-11-25'), source: 'buyer', isActive: true,
    buyerRequirements: [
      { buyerName: 'Kiran Mehta', companyName: 'ExportFresh India', requiredQuantity: 1500, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 125, deliveryLocation: 'Mumbai Port, Maharashtra', deadline: new Date('2026-11-22'), notes: 'GI-tagged Alphonso for export.' },
      { buyerName: 'Deepa Rao', companyName: 'FruitZone Retail', requiredQuantity: 500, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 118, deliveryLocation: 'Ratnagiri, Maharashtra', deadline: new Date('2026-11-25'), notes: '' },
    ],
  },
  {
    cropName: 'Soybean', variety: 'JS-335', category: 'Oilseeds',
    demandQuantity: 6000, unit: 'kg',
    expectedPriceMin: 38, expectedPriceMax: 44,
    location: 'Amravati, Maharashtra', demandLevel: 'Medium', demandTrend: 'Falling',
    requiredBy: new Date('2026-12-01'), source: 'manual', isActive: true,
    buyerRequirements: [],
  },
  {
    cropName: 'Turmeric', variety: 'Erode Local', category: 'Spices & Herbs',
    demandQuantity: 1000, unit: 'kg',
    expectedPriceMin: 72, expectedPriceMax: 88,
    location: 'Sangli, Maharashtra', demandLevel: 'Medium', demandTrend: 'Stable',
    requiredBy: new Date('2026-12-05'), source: 'buyer', isActive: true,
    buyerRequirements: [
      { buyerName: 'Harish Iyer', companyName: 'SpiceWorld Exports', requiredQuantity: 800, unit: 'kg', qualityGrade: 'Grade A', expectedPrice: 82, deliveryLocation: 'Sangli, Maharashtra', deadline: new Date('2026-12-05'), notes: 'Curcumin content minimum 3%.' },
    ],
  },
  {
    cropName: 'Rice', variety: 'Basmati', category: 'Grains & Cereals',
    demandQuantity: 4000, unit: 'kg',
    expectedPriceMin: 55, expectedPriceMax: 70,
    location: 'Nagpur, Maharashtra', demandLevel: 'Low', demandTrend: 'Stable',
    requiredBy: new Date('2026-12-10'), source: 'manual', isActive: true,
    buyerRequirements: [],
  },
]

async function seedIfEmpty() {
  const count = await Demand.countDocuments()
  if (count === 0) {
    await Demand.insertMany(SEED_DATA)
    console.log(`✅ Demand collection seeded with ${SEED_DATA.length} records`)
  }
}

// ── Format helper ─────────────────────────────────────────────────────────────
function format(doc) {
  const d = doc.toObject ? doc.toObject() : doc
  return {
    id:               d._id.toString(),
    cropName:         d.cropName,
    variety:          d.variety,
    category:         d.category,
    demandQuantity:   d.demandQuantity,
    unit:             d.unit,
    expectedPriceMin: d.expectedPriceMin,
    expectedPriceMax: d.expectedPriceMax,
    location:         d.location,
    demandLevel:      d.demandLevel,
    demandTrend:      d.demandTrend,
    requiredBy:       d.requiredBy ? d.requiredBy.toISOString().split('T')[0] : null,
    source:           d.source,
    isActive:         d.isActive,
    buyerRequirements: (d.buyerRequirements || []).map((b) => ({
      ...b,
      deadline: b.deadline ? b.deadline.toISOString().split('T')[0] : null,
    })),
    createdAt: d.createdAt,
  }
}

// ── GET /api/demand ───────────────────────────────────────────────────────────
async function getAllDemand(req, res) {
  try {
    await seedIfEmpty()
    const demands = await Demand.find({ isActive: true }).sort({ demandLevel: 1, createdAt: -1 })
    res.json(demands.map(format))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch demand data', error: err.message })
  }
}

// ── GET /api/demand/opportunities ─────────────────────────────────────────────
async function getOpportunities(req, res) {
  try {
    await seedIfEmpty()
    // Opportunities = High demand signals with buyer requirements
    const opps = await Demand.find({
      isActive: true,
      demandLevel: 'High',
    }).sort({ expectedPriceMax: -1 })
    res.json(opps.map(format))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch opportunities', error: err.message })
  }
}

// ── GET /api/demand/buyer-requirements ────────────────────────────────────────
async function getBuyerRequirements(req, res) {
  try {
    await seedIfEmpty()
    // Return demands that have at least one buyer requirement
    const demands = await Demand.find({
      isActive: true,
      'buyerRequirements.0': { $exists: true },
    }).sort({ createdAt: -1 })

    // Flatten: one object per buyer requirement, with parent demand context
    const requirements = []
    demands.forEach((d) => {
      d.buyerRequirements.forEach((b, i) => {
        requirements.push({
          id:              `${d._id}-${i}`,
          demandId:        d._id.toString(),
          cropName:        d.cropName,
          variety:         d.variety,
          category:        d.category,
          location:        d.location,
          demandLevel:     d.demandLevel,
          buyerName:       b.buyerName,
          companyName:     b.companyName,
          requiredQuantity: b.requiredQuantity,
          unit:            b.unit,
          qualityGrade:    b.qualityGrade,
          expectedPrice:   b.expectedPrice,
          deliveryLocation: b.deliveryLocation,
          deadline:        b.deadline ? b.deadline.toISOString().split('T')[0] : null,
          notes:           b.notes,
        })
      })
    })
    res.json(requirements)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer requirements', error: err.message })
  }
}

// ── GET /api/demand/:id ───────────────────────────────────────────────────────
async function getDemandById(req, res) {
  try {
    const demand = await Demand.findById(req.params.id)
    if (!demand) return res.status(404).json({ message: 'Demand record not found' })
    res.json(format(demand))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Demand record not found' })
    res.status(500).json({ message: 'Failed to fetch demand record', error: err.message })
  }
}

module.exports = { getAllDemand, getDemandById, getOpportunities, getBuyerRequirements }
