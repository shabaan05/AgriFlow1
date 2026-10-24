const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getBuyerProfile,       updateBuyerProfile,
  getBuyerInfo,          updateBuyerInfo,
  getBuyerVerification,  submitBuyerVerification,
  getBuyerPaymentDetails,updateBuyerPaymentDetails,
  updateBuyerNotifPrefs,
} = require('../controllers/buyerController')

const router = express.Router()
router.use(protect)

// Profile
router.route('/profile').get(getBuyerProfile).put(updateBuyerProfile)

// Business info
router.route('/business-info').get(getBuyerInfo).put(updateBuyerInfo)

// Verification
router.get('/verification', getBuyerVerification)
router.post('/verification/submit', submitBuyerVerification)

// Payment details
router.route('/payment-details').get(getBuyerPaymentDetails).put(updateBuyerPaymentDetails)

// Notification preferences
router.put('/notification-prefs', updateBuyerNotifPrefs)

module.exports = router
