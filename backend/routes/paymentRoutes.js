const express = require('express')
const { protect } = require('../middleware/auth')
const { getFarmerEarnings, updatePaymentStatus, getBuyerPayments, buyerConfirmPayment } = require('../controllers/paymentController')

const router = express.Router()
router.use(protect)

// Specific sub-paths BEFORE /:id
router.get('/farmer/earnings', getFarmerEarnings)
router.get('/buyer',           getBuyerPayments)
router.put('/:id/status',      updatePaymentStatus)   // farmer marks paid (manual/admin)
router.put('/:id/pay',         buyerConfirmPayment)   // buyer confirms payment (demo)

module.exports = router
