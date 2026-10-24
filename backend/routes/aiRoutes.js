const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getAISummary,
  getBuyerMatches,
  getHarvestPlan,
  getShelfLife,
  getWastagePrevention,
} = require('../controllers/aiController')

const router = express.Router()

// All AI routes require a valid JWT (farmer must be logged in)
router.use(protect)

// GET /api/ai/summary            — dashboard overview for all 4 agents
router.get('/summary',            getAISummary)

// GET /api/ai/buyer-matches       — Buyer Match Agent results
router.get('/buyer-matches',      getBuyerMatches)

// GET /api/ai/harvest-planner     — Harvest Planner Agent results
router.get('/harvest-planner',    getHarvestPlan)

// GET /api/ai/shelf-life          — Shelf-Life Monitor Agent results
router.get('/shelf-life',         getShelfLife)

// GET /api/ai/wastage-prevention  — Wastage Prevention Agent results
router.get('/wastage-prevention', getWastagePrevention)

module.exports = router
