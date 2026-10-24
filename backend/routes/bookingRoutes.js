const express = require('express')
const { protect } = require('../middleware/auth')
const {
  createBooking,
  getFarmerBookings,
  getBookingById,
  updateBookingStatus,
  getBuyerBookings,
  cancelBookingByBuyer,
} = require('../controllers/bookingController')

const router = express.Router()
router.use(protect)

// POST /api/bookings         — create (farmer OR buyer, role detected in controller)
router.route('/').post(createBooking)

// GET /api/bookings/farmer   — farmer's incoming bookings
router.route('/farmer').get(getFarmerBookings)

// GET /api/bookings/buyer    — buyer's own sent bookings
router.route('/buyer').get(getBuyerBookings)

// GET /api/bookings/:id      — single booking (accessible by owning farmer OR buyer)
router.route('/:id').get(getBookingById)

// PUT /api/bookings/:id/status    — farmer accepts/rejects
router.route('/:id/status').put(updateBookingStatus)

// PUT /api/bookings/:id/cancel    — buyer cancels their own pending booking
router.route('/:id/cancel').put(cancelBookingByBuyer)

module.exports = router
