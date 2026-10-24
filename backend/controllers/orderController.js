const Order   = require('../models/Order')
const Payment = require('../models/Payment')
const Booking = require('../models/Booking')
const { createPickupRequest } = require('./transporterController')

// Valid next statuses for each current status — FARMER only.
// Picked Up / In Transit / Delivered are exclusively advanced by the
// transporter via PUT /api/transporter/trips/:id/pickup|in-transit|delivered.
// Keeping them out here prevents a farmer from bypassing the transporter
// workflow and accidentally short-circuiting TransporterEarning creation.
const TRANSITIONS = {
  Confirmed:          ['Preparing', 'Cancelled'],
  Preparing:          ['Ready for Pickup', 'Cancelled'],
  'Ready for Pickup': [],   // transporter-only from here on
  'Picked Up':        [],
  'In Transit':       [],
  Delivered:          [],
  Cancelled:          [],
}

function fmt(o) {
  const d = o.toObject ? o.toObject() : o
  return {
    id:                  d._id.toString(),
    bookingId:           d.booking?.toString(),
    buyerName:           d.buyerName,
    buyerCompany:        d.buyerCompany,
    cropName:            d.cropName,
    variety:             d.variety,
    quantity:            d.quantity,
    unit:                d.unit,
    pricePerUnit:        d.pricePerUnit,
    totalAmount:         d.totalAmount,
    pickupLocation:      d.pickupLocation,
    deliveryLocation:    d.deliveryLocation,
    scheduledPickupDate: d.scheduledPickupDate,
    actualDeliveryDate:  d.actualDeliveryDate,
    status:              d.status,
    timeline:            d.timeline || [],
    notes:               d.notes,
    createdAt:           d.createdAt,
    updatedAt:           d.updatedAt,
  }
}

// ── GET /api/orders/farmer ────────────────────────────────────────────────────
async function getFarmerOrders(req, res) {
  try {
    const orders = await Order.find({ farmer: req.user._id }).sort({ createdAt: -1 })
    res.json(orders.map(fmt))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message })
  }
}

// ── GET /api/orders/farmer/pickup-delivery ────────────────────────────────────
async function getPickupDelivery(req, res) {
  try {
    const upcoming = await Order.find({
      farmer: req.user._id,
      status: { $in: ['Confirmed', 'Preparing', 'Ready for Pickup', 'Picked Up', 'In Transit'] },
    }).sort({ scheduledPickupDate: 1 })
    res.json(upcoming.map(fmt))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pickup/delivery data', error: err.message })
  }
}

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
async function getOrderById(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })
    res.json(fmt(order))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Order not found' })
    res.status(500).json({ message: 'Failed to fetch order', error: err.message })
  }
}

// ── PUT /api/orders/:id/status ────────────────────────────────────────────────
async function updateOrderStatus(req, res) {
  try {
    const { status, note } = req.body
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    if (!TRANSITIONS[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot move order from "${order.status}" to "${status}"`,
      })
    }

    order.status = status
    order.timeline.push({ status, note: note || '' })

    await order.save()

    // ── Auto-create PickupRequest when order becomes Ready for Pickup ─────────
    if (status === 'Ready for Pickup') {
      const booking = await Booking.findById(order.booking)
      await createPickupRequest(order, booking)
    }

    // Auto-create Payment record when Delivered (defensive — normally done by transporter)
    if (status === 'Delivered') {
      const existing = await Payment.findOne({ order: order._id })
      if (!existing) {
        await Payment.create({
          order:    order._id,
          farmer:   req.user._id,
          buyerName: order.buyerName,
          cropName:  order.cropName,
          amount:    order.totalAmount,
          status:    'Pending',
        })
      }
    }

    res.json(fmt(order))
  } catch (err) {
    res.status(500).json({ message: 'Failed to update order status', error: err.message })
  }
}

// ── GET /api/orders/buyer ─────────────────────────────────────────────────────
// Find all orders belonging to the authenticated buyer.
// Strategy: find bookings where buyerId = req.user._id that have an orderId,
// then fetch those orders. This avoids adding buyerId to the Order model.
async function getBuyerOrders(req, res) {
  try {
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ message: 'Access denied — requires role: buyer' })
    }

    const bookings = await Booking.find({
      buyerId: req.user._id,
      orderId: { $ne: null },
    }).select('orderId')

    const orderIds = bookings.map((b) => b.orderId).filter(Boolean)
    if (orderIds.length === 0) return res.json([])

    const orders = await Order.find({ _id: { $in: orderIds } })
      .populate('farmer', 'name farmInfo')
      .sort({ createdAt: -1 })

    const result = orders.map((o) => {
      const farmer = o.farmer
      return {
        ...fmt(o),
        buyerId: req.user._id.toString(),
        farmer: farmer ? {
          id:           farmer._id.toString(),
          name:         farmer.name,
          farmLocation: farmer.farmInfo?.farmLocation || '',
        } : null,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer orders', error: err.message })
  }
}

// ── GET /api/orders/buyer/:id ─────────────────────────────────────────────────
// Single order — verify buyer owns it via the booking link.
async function getBuyerOrderById(req, res) {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Verify this buyer owns the linked booking
    const booking = await Booking.findOne({
      _id:     order.booking,
      buyerId: req.user._id,
    })
    if (!booking) return res.status(404).json({ message: 'Order not found' })

    // Enrich with farmer info
    const User = require('../models/User')
    const farmer = await User.findById(order.farmer).select('name farmInfo verification')

    res.json({
      ...fmt(order),
      buyerId: req.user._id.toString(),
      farmer: farmer ? {
        id:           farmer._id.toString(),
        name:         farmer.name,
        farmName:     farmer.farmInfo?.farmName     || '',
        farmLocation: farmer.farmInfo?.farmLocation || '',
        verification: farmer.verification?.status   || 'Not Verified',
      } : null,
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Order not found' })
    res.status(500).json({ message: 'Failed to fetch order', error: err.message })
  }
}

// ── GET /api/orders/:id/pickup-request ───────────────────────────────────────
// Returns the PickupRequest linked to this order (farmer-scoped).
// Allows the farmer to see whether a transporter has been assigned.
async function getOrderPickupRequest(req, res) {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id })
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const PickupRequest = require('../models/PickupRequest')
    const pickup = await PickupRequest.findOne({ orderId: order._id })
    if (!pickup) return res.status(404).json({ message: 'No pickup request yet for this order' })

    const d = pickup.toObject()
    let transporter = null
    if (d.transporterId) {
      const User = require('../models/User')
      const t = await User.findById(d.transporterId).select('name phone')
      if (t) {
        transporter = { id: t._id.toString(), name: t.name, phone: t.phone || '' }
      }
    }

    res.json({
      id:                  d._id.toString(),
      orderId:             d.orderId?.toString(),
      status:              d.status,
      transporterId:       d.transporterId?.toString() || null,
      transporter,
      pickupLocation:      d.pickupLocation,
      deliveryLocation:    d.deliveryLocation,
      pickupDate:          d.pickupDate,
      estimatedDistanceKm: d.estimatedDistanceKm,
      estimatedDurationHrs:d.estimatedDurationHrs,
      estimatedEarnings:   d.estimatedEarnings,
      createdAt:           d.createdAt,
      updatedAt:           d.updatedAt,
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Order not found' })
    res.status(500).json({ message: 'Failed to fetch pickup request', error: err.message })
  }
}

module.exports = { getFarmerOrders, getOrderById, updateOrderStatus, getPickupDelivery,
                   getBuyerOrders, getBuyerOrderById, getOrderPickupRequest }
