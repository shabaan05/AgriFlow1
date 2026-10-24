const express = require('express')
const { protect } = require('../middleware/auth')
const {
  getFarmerOrders, getOrderById, updateOrderStatus, getPickupDelivery,
  getBuyerOrders, getBuyerOrderById, getOrderPickupRequest,
} = require('../controllers/orderController')

const router = express.Router()
router.use(protect)

// Specific sub-paths BEFORE /:id  (order matters in Express)
router.get('/farmer',                     getFarmerOrders)
router.get('/farmer/pickup-delivery',     getPickupDelivery)
router.get('/buyer',                      getBuyerOrders)
router.get('/buyer/:id',                  getBuyerOrderById)
router.get('/:id/pickup-request',         getOrderPickupRequest)
router.get('/:id',                        getOrderById)
router.put('/:id/status',                 updateOrderStatus)

module.exports = router
