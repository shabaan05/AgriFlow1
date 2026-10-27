const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getAISummary,
  getBuyerMatches,
  getHarvestPlan,
  getShelfLife,
  getWastagePrevention,
  postBuyerMatch,
  postDemandForecast,
} = require('../controllers/aiController')

const router = express.Router()

// All AI routes require a valid JWT
router.use(protect)

// GET /api/ai/summary            — dashboard overview for all 4 agents
router.get('/summary',            getAISummary)

// GET /api/ai/buyer-matches       — Buyer Match Agent results (farmer demo)
router.get('/buyer-matches',      getBuyerMatches)

// GET /api/ai/harvest-planner     — Harvest Planner Agent results
router.get('/harvest-planner',    getHarvestPlan)

// GET /api/ai/shelf-life          — Shelf-Life Monitor Agent results
router.get('/shelf-life',         getShelfLife)

// GET /api/ai/wastage-prevention  — Wastage Prevention Agent results
router.get('/wastage-prevention', getWastagePrevention)

// POST /api/ai/buyer-match        — Buyer-facing: rule-based crop ranking
//   Requires authenticated buyer. Returns ranked crops with score breakdown.
router.post('/buyer-match',       postBuyerMatch)

// POST /api/ai/demand-forecast    — Buyer-facing: explainable demand forecast
//   Requires authenticated buyer. Returns WMA + trend forecast from real data.
router.post('/demand-forecast',   postDemandForecast)

module.exports = router
