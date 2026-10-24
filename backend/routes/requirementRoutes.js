const express = require('express')
const { protect } = require('../middleware/auth')
const {
  createRequirement,
  getMyRequirements,
  getRequirementById,
  updateRequirement,
  cancelRequirement,
} = require('../controllers/requirementController')

const router = express.Router()

// All requirement routes require JWT authentication
router.use(protect)

// POST   /api/requirements           — create a new requirement
// GET    /api/requirements           — list buyer's own requirements
router.route('/').post(createRequirement).get(getMyRequirements)

// GET    /api/requirements/:id       — get single requirement
// PUT    /api/requirements/:id       — update active requirement
router.route('/:id').get(getRequirementById).put(updateRequirement)

// PUT    /api/requirements/:id/cancel — cancel requirement
router.put('/:id/cancel', cancelRequirement)

module.exports = router
