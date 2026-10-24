const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getProfile, updateProfile,
  getFarmInfo, updateFarmInfo,
  getVerification, submitVerification,
  getPaymentDetails, updatePaymentDetails,
  updateNotificationPrefs,
} = require('../controllers/farmerController')

const router = express.Router()
router.use(protect)

// Profile
router.route('/profile').get(getProfile).put(updateProfile)

// Farm info
router.route('/farm').get(getFarmInfo).put(updateFarmInfo)

// Verification
router.get('/verification', getVerification)
router.post('/verification/submit', submitVerification)

// Payment details
router.route('/payment-details').get(getPaymentDetails).put(updatePaymentDetails)

// Notification preferences
router.put('/notification-prefs', updateNotificationPrefs)

module.exports = router
