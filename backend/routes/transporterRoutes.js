const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getPickupRequests,
  getPickupRequestById,
  acceptPickupRequest,
  rejectPickupRequest,
  getTrips,
  getTripById,
  markPickedUp,
  markInTransit,
  markDelivered,
  getEarnings,
  getEarningById,
  getTransporterProfile,
  updateTransporterProfile,
  getTransporterInfo,
  updateTransporterInfo,
  getVehicleInfo,
  updateVehicleInfo,
  getTransporterVerification,
  submitTransporterVerification,
  getTransporterPaymentDetails,
  updateTransporterPaymentDetails,
  updateTransporterNotifPrefs,
} = require('../controllers/transporterController')

const router = express.Router()

// All transporter routes require JWT
router.use(protect)

// ── Pickup Requests ───────────────────────────────────────────────────────────
router.get('/pickups',                getPickupRequests)
router.get('/pickups/:id',            getPickupRequestById)
router.put('/pickups/:id/accept',     acceptPickupRequest)
router.put('/pickups/:id/reject',     rejectPickupRequest)

// ── Trips (accepted pickup requests with delivery workflow) ──────────────────
router.get('/trips',                  getTrips)
router.get('/trips/:id',              getTripById)
router.put('/trips/:id/pickup',       markPickedUp)
router.put('/trips/:id/in-transit',  markInTransit)
router.put('/trips/:id/delivered',    markDelivered)

// ── Earnings ──────────────────────────────────────────────────────────────────
router.get('/earnings',               getEarnings)
router.get('/earnings/:id',           getEarningById)

// ── Profile ──────────────────────────────────────────────────────────────────
router.route('/profile').get(getTransporterProfile).put(updateTransporterProfile)
router.route('/transporter-info').get(getTransporterInfo).put(updateTransporterInfo)
router.route('/vehicle').get(getVehicleInfo).put(updateVehicleInfo)
router.get('/verification',           getTransporterVerification)
router.post('/verification/submit',  submitTransporterVerification)
router.route('/payment-details').get(getTransporterPaymentDetails).put(updateTransporterPaymentDetails)
router.put('/notification-prefs',     updateTransporterNotifPrefs)

module.exports = router
