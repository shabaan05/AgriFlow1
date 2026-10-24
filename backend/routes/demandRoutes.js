const express = require('express')
const {
  getAllDemand,
  getDemandById,
  getOpportunities,
  getBuyerRequirements,
} = require('../controllers/demandController')

const router = express.Router()

// Demand data is read-only market information — no JWT guard needed for reads.
// Write endpoints (admin seeding/updates) can be added with protect middleware later.

// GET /api/demand/opportunities      — high-demand signals (specific sub-route first)
router.get('/opportunities',       getOpportunities)

// GET /api/demand/buyer-requirements — flattened buyer requirement list
router.get('/buyer-requirements',  getBuyerRequirements)

// GET /api/demand                    — all active demand signals
router.get('/',                    getAllDemand)

// GET /api/demand/:id                — single demand record
router.get('/:id',                 getDemandById)

module.exports = router
