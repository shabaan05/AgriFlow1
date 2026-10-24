const express  = require('express')
const { protect } = require('../middleware/auth')
const {
  getAllCrops,
  getCropById,
  createCrop,
  updateCrop,
  deleteCrop,
} = require('../controllers/cropController')

const router = express.Router()

// All crop routes require a valid JWT
router.use(protect)

// POST   /api/crops        — create a new crop
// GET    /api/crops        — list all crops
router.route('/').get(getAllCrops).post(createCrop)

// GET    /api/crops/:id    — get single crop
// PUT    /api/crops/:id    — update crop
// DELETE /api/crops/:id    — delete crop
router.route('/:id').get(getCropById).put(updateCrop).delete(deleteCrop)

module.exports = router
