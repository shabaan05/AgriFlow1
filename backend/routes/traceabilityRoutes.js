const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getCropTraceability,
  getOrderTraceability,
  getFarmerTraceability,
  getBuyerTraceability,
  getBuyerOrderTraceability,
} = require('../controllers/traceabilityController')

const router = express.Router()

// All routes require JWT authentication
router.use(protect)

// ── Farmer routes ─────────────────────────────────────────────────────────────
// GET /api/traceability            — farmer overview (all traceable crops)
router.get('/', getFarmerTraceability)

// GET /api/traceability/crop/:cropId
router.get('/crop/:cropId', getCropTraceability)

// GET /api/traceability/order/:orderId
router.get('/order/:orderId', getOrderTraceability)

// ── Buyer routes (specific sub-paths BEFORE /:id style patterns) ─────────────
// GET /api/traceability/buyer               — buyer overview (all their orders with events)
router.get('/buyer', getBuyerTraceability)

// GET /api/traceability/buyer/order/:orderId — buyer order timeline (ownership verified)
router.get('/buyer/order/:orderId', getBuyerOrderTraceability)

module.exports = router
