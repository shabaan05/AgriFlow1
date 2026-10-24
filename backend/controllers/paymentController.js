const Payment = require('../models/Payment')
const Order   = require('../models/Order')
const Booking = require('../models/Booking')
const TransporterEarning = require('../models/TransporterEarning')
const PickupRequest = require('../models/PickupRequest')
const traceabilityService = require('../services/traceabilityService')

function fmt(p) {
  const d = p.toObject ? p.toObject() : p
  return {
    id:        d._id.toString(),
    orderId:   d.order?.toString(),
    buyerName: d.buyerName,
    cropName:  d.cropName,
    amount:    d.amount,
    status:    d.status,
    paidAt:    d.paidAt,
    notes:     d.notes,
    createdAt: d.createdAt,
  }
}

// ── GET /api/payments/farmer/earnings ─────────────────────────────────────────
async function getFarmerEarnings(req, res) {
  try {
    const payments = await Payment.find({ farmer: req.user._id }).sort({ createdAt: -1 })

    const totalEarnings   = payments.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0)
    const pendingPayments = payments.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)
    const completedSales  = payments.filter((p) => p.status === 'Paid').length

    res.json({
      summary: {
        totalEarnings,
        pendingPayments,
        completedSales,
        totalTransactions: payments.length,
      },
      transactions: payments.map(fmt),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch earnings', error: err.message })
  }
}

// ── PUT /api/payments/:id/status — mark Paid (admin/demo use) ─────────────────
async function updatePaymentStatus(req, res) {
  try {
    const { status } = req.body
    if (!['Paid', 'Failed'].includes(status)) {
      return res.status(400).json({ message: 'Status must be Paid or Failed' })
    }
    const payment = await Payment.findOne({ _id: req.params.id, farmer: req.user._id })
    if (!payment) return res.status(404).json({ message: 'Payment not found' })

    payment.status = status
    if (status === 'Paid') payment.paidAt = new Date()
    await payment.save()

    // ── Traceability: PAYMENT_RECEIVED ───────────────────────────────────────
    if (status === 'Paid') {
      let cropId = null
      const order = await Order.findById(payment.order)
      if (order) {
        const booking = await Booking.findById(order.booking)
        if (booking) cropId = booking.crop
      }

      await traceabilityService.createEvent({
        farmerId:   req.user._id,
        cropId,
        orderId:    payment.order,
        eventType:  'PAYMENT_RECEIVED',
        description:`Payment of ₹${payment.amount.toLocaleString()} received from ${payment.buyerName}`,
        metadata:   { amount: payment.amount, buyerName: payment.buyerName, paidAt: payment.paidAt },
      })
    }

    res.json(fmt(payment))
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment', error: err.message })
  }
}

// ── GET /api/payments/buyer ────────────────────────────────────────────────────
// Returns payments for orders belonging to the authenticated buyer.
// Strategy: find bookings where buyerId = req.user._id that have an orderId,
// then fetch payments for those orderIds.
async function getBuyerPayments(req, res) {
  try {
    // Step 1: get all buyer bookings that have a linked order
    const bookings = await Booking.find({
      buyerId: req.user._id,
      orderId: { $ne: null },
    }).select('orderId cropName')

    if (bookings.length === 0) {
      return res.json({ summary: { totalAmount: 0, paidAmount: 0, pendingAmount: 0, totalOrders: 0 }, payments: [] })
    }

    const orderIds = bookings.map((b) => b.orderId)

    // Step 2: fetch payments for those orders
    const payments = await Payment.find({
      order: { $in: orderIds },
    }).sort({ createdAt: -1 })

    // Step 3: fetch order details for enrichment (farmer name, crop, quantity)
    const orders = await Order.find({ _id: { $in: orderIds } })
    const orderMap = {}
    orders.forEach((o) => { orderMap[o._id.toString()] = o })

    // Step 4: fetch farmer names
    const User = require('../models/User')
    const farmerIds = [...new Set(orders.map((o) => o.farmer?.toString()).filter(Boolean))]
    const farmers   = await User.find({ _id: { $in: farmerIds } }).select('name')
    const farmerMap = {}
    farmers.forEach((f) => { farmerMap[f._id.toString()] = f.name })

    // Step 5: format
    const formatted = payments.map((p) => {
      const order = orderMap[p.order?.toString()] || {}
      return {
        id:          p._id.toString(),
        orderId:     p.order?.toString(),
        cropName:    p.cropName || order.cropName,
        buyerName:   p.buyerName,
        farmerName:  farmerMap[order.farmer?.toString()] || '—',
        quantity:    order.quantity,
        unit:        order.unit,
        amount:      p.amount,
        status:      p.status,
        paidAt:      p.paidAt,
        notes:       p.notes,
        orderDate:   order.createdAt,
        createdAt:   p.createdAt,
      }
    })

    // Step 6: summary
    const totalAmount   = formatted.reduce((s, p) => s + p.amount, 0)
    const paidAmount    = formatted.filter((p) => p.status === 'Paid').reduce((s, p) => s + p.amount, 0)
    const pendingAmount = formatted.filter((p) => p.status === 'Pending').reduce((s, p) => s + p.amount, 0)

    res.json({
      summary: {
        totalOrders:   formatted.length,
        totalAmount,
        paidAmount,
        pendingAmount,
      },
      payments: formatted,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer payments', error: err.message })
  }
}

// ── PUT /api/payments/:id/pay — Buyer confirms payment (demo / manual) ────────
// This is the buyer-initiated payment confirmation endpoint.
// It marks the Payment record as Paid and also marks the linked
// TransporterEarning as PAID (one atomic workflow).
// No real payment gateway — this is the project's manual/demo mechanism.
// Amount is taken from the existing Payment record (backend-calculated at
// delivery time). Frontend must never submit an amount.
async function buyerConfirmPayment(req, res) {
  try {
    // 1. Load the payment record
    const payment = await Payment.findById(req.params.id)
    if (!payment) return res.status(404).json({ message: 'Payment not found' })

    // 2. Verify this buyer owns the linked order (via Booking.buyerId)
    const order = await Order.findById(payment.order)
    if (!order) return res.status(404).json({ message: 'Linked order not found' })

    const booking = await Booking.findOne({
      _id:     order.booking,
      buyerId: req.user._id,
    })
    if (!booking) {
      return res.status(403).json({ message: 'You are not the buyer for this order' })
    }

    // 3. Idempotency — already paid
    if (payment.status === 'Paid') {
      return res.status(409).json({
        message: 'Payment already confirmed',
        payment: fmt(payment),
      })
    }

    // 4. Order must be Delivered before payment can be confirmed
    if (order.status !== 'Delivered') {
      return res.status(400).json({
        message: `Payment can only be confirmed after delivery (current order status: ${order.status})`,
      })
    }

    // 5. Mark payment as Paid
    payment.status = 'Paid'
    payment.paidAt = new Date()
    await payment.save()

    // 6. Mark linked TransporterEarning as PAID (idempotent)
    const pickupRequest = await PickupRequest.findOne({ orderId: order._id, status: 'COMPLETED' })
    if (pickupRequest) {
      await TransporterEarning.findOneAndUpdate(
        { pickupRequestId: pickupRequest._id },
        { status: 'PAID', paidAt: payment.paidAt },
      )
    }

    // 7. Traceability event: PAYMENT_RECEIVED
    const cropId = booking.crop || null
    await traceabilityService.createEvent({
      farmerId:   order.farmer,
      cropId,
      orderId:    order._id,
      bookingId:  order.booking,
      eventType:  'PAYMENT_RECEIVED',
      description:`Payment of ₹${payment.amount.toLocaleString()} confirmed by buyer ${payment.buyerName}`,
      metadata:   {
        amount:    payment.amount,
        buyerName: payment.buyerName,
        paidAt:    payment.paidAt,
        confirmedByBuyer: true,
      },
    })

    res.json({
      ...fmt(payment),
      message: 'Payment confirmed successfully (demo)',
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Payment not found' })
    res.status(500).json({ message: 'Failed to confirm payment', error: err.message })
  }
}

module.exports = { getFarmerEarnings, updatePaymentStatus, getBuyerPayments, buyerConfirmPayment }
