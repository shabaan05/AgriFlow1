const express  = require('express')
const { protect } = require('../middleware/auth')
const {
  getMarketplaceCrops,
  getMarketplaceCropById,
  getFarmerPublicProfile,
  addToShortlist,
  getShortlist,
  removeFromShortlist,
  getShortlistIds,
} = require('../controllers/marketplaceController')

const router = express.Router()

// Marketplace requires authentication (any role — farmer can browse too)
router.use(protect)

// ── Marketplace browse ────────────────────────────────────────────────────────
router.get('/crops',              getMarketplaceCrops)
router.get('/crops/:id',          getMarketplaceCropById)
router.get('/farmer/:id',         getFarmerPublicProfile)

// ── Shortlist (buyer only in practice, enforced at context level) ─────────────
router.post('/shortlist',         addToShortlist)
router.get('/shortlist',          getShortlist)
router.get('/shortlist/ids',      getShortlistIds)
router.delete('/shortlist/:cropId', removeFromShortlist)

module.exports = router
