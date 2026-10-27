const Crop  = require('../models/Crop')
const Order  = require('../models/Order')
const Booking= require('../models/Booking')
const Payment= require('../models/Payment')
const { getEventsByCrop, getEventsByOrder, getEventsByFarmer } = require('../services/traceabilityService')

const { getBlockchainStatus } = require('../services/blockchainService')

// ── The canonical event flow order ─────────────────────────────────────────────
const EVENT_FLOW = [
  'HARVESTED',
  'QUALITY_CHECKED',
  'BOOKED',
  'PICKUP_SCHEDULED',
  'PICKED_UP',
  'IN_TRANSIT',
  'DELIVERED',
  'PAYMENT_RECEIVED',
]

// ── Format an event for the API response ─────────────────────────────────────
function fmtEvent(e) {
  const d = e.toObject ? e.toObject() : e
  const txHash = d.txHash || null
  return {
    id:          d._id.toString(),
    eventType:   d.eventType,
    description: d.description,
    location:    d.location,
    timestamp:   d.timestamp,
    metadata:    d.metadata || {},
    cropId:      d.cropId?.toString(),
    orderId:     d.orderId?.toString() || null,
    bookingId:   d.bookingId?.toString() || null,
    onChain:     Boolean(d.onChain || txHash),
    txHash:      txHash,
    blockNumber: d.blockNumber || null,
    network:     'Polygon Amoy',
    explorerUrl: txHash ? `https://amoy.polygonscan.com/tx/${txHash}` : null,
  }
}

/**
 * Derive the current position in the flow based on which events exist.
 * Events that exist → "completed". The next one after the last existing → "current".
 * The rest → "pending".
 */
function annotateStatus(events) {
  const existingTypes = new Set(events.map((e) => e.eventType))
  const lastCompletedIdx = Math.max(
    ...EVENT_FLOW.filter((t) => existingTypes.has(t)).map((t) => EVENT_FLOW.indexOf(t)),
    -1
  )

  const annotated = EVENT_FLOW.map((type, idx) => {
    const event = events.find((e) => e.eventType === type)
    let status
    if (event) status = 'completed'
    else if (idx === lastCompletedIdx + 1) status = 'current'
    else status = 'pending'

    return {
      eventType: type,
      status,
      ...(event ? fmtEvent(event) : {}),
    }
  })

  return annotated
}

// ── GET /api/traceability/crop/:cropId ──────────────────────────────────────────
async function getCropTraceability(req, res) {
  try {
    const { cropId } = req.params

    const crop = await Crop.findById(cropId)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })

    // Derive summary info from crop
    const summary = {
      cropId:   crop._id.toString(),
      cropName: crop.cropName,
      variety:  crop.variety,
      quantity: `${crop.totalQuantityKg} ${crop.unit}`,
      grade:    crop.qualityGrade,
      status:   crop.status,
      farmLocation: crop.farmLocation,
    }

    // Find related order (if any bookings exist for this crop)
    const booking = await Booking.findOne({ crop: cropId, farmer: crop.farmerId }).sort({ createdAt: -1 })
    let order = null
    if (booking?.orderId) {
      order = await Order.findById(booking.orderId)
    }
    if (order) {
      summary.orderId    = order._id.toString()
      summary.buyerName  = order.buyerCompany || order.buyerName
      summary.totalAmount= order.totalAmount
    }

    const events = await getEventsByCrop(cropId, crop.farmerId)
    const timeline = annotateStatus(events)

    res.json({ summary, timeline, events: events.map(fmtEvent) })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Crop not found' })
    res.status(500).json({ message: 'Failed to fetch traceability', error: err.message })
  }
}

// ── GET /api/traceability/order/:orderId ────────────────────────────────────────
async function getOrderTraceability(req, res) {
  try {
    const { orderId } = req.params

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    const summary = {
      orderId:      order._id.toString(),
      cropName:     order.cropName,
      variety:      order.variety,
      quantity:     `${order.quantity} ${order.unit}`,
      buyerName:    order.buyerCompany || order.buyerName,
      totalAmount:  order.totalAmount,
      status:       order.status,
      deliveryLocation: order.deliveryLocation,
    }

    // Find the crop from the booking
    const booking = await Booking.findById(order.booking)
    if (booking) {
      summary.cropId = booking.crop?.toString()
      summary.cropName = booking.cropName
      summary.variety  = booking.variety
    }

    const events = await getEventsByOrder(orderId, order.farmer)
    const timeline = annotateStatus(events)

    res.json({ summary, timeline, events: events.map(fmtEvent) })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Order not found' })
    res.status(500).json({ message: 'Failed to fetch traceability', error: err.message })
  }
}

// ── GET /api/traceability (overview — all crops with events for this farmer) ──
async function getFarmerTraceability(req, res) {
  try {
    const events = await getEventsByFarmer(req.user._id)

    // Group events by cropId
    const byCrop = {}
    events.forEach((e) => {
      const cropId = e.cropId.toString()
      if (!byCrop[cropId]) byCrop[cropId] = []
      byCrop[cropId].push(fmtEvent(e))
    })

    // Build summary cards
    const crops = await Crop.find({ _id: { $in: Object.keys(byCrop) } })
    const items = crops.map((crop) => ({
      cropId:   crop._id.toString(),
      cropName: crop.cropName,
      variety:  crop.variety,
      status:   crop.status,
      eventCount: byCrop[crop._id.toString()]?.length || 0,
      lastEvent: byCrop[crop._id.toString()]?.[byCrop[crop._id.toString()].length - 1] || null,
    }))

    res.json({ items, totalCrops: items.length })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch traceability overview', error: err.message })
  }
}

// ── GET /api/traceability/buyer ────────────────────────────────────────────────
// Overview of all traceability-enabled orders belonging to the authenticated buyer.
async function getBuyerTraceability(req, res) {
  try {
    const User = require('../models/User')

    // Find buyer's bookings that have a linked order
    const bookings = await Booking.find({
      buyerId: req.user._id,
      orderId: { $ne: null },
    }).select('orderId cropName variety')

    if (bookings.length === 0) {
      return res.json({ items: [], totalOrders: 0 })
    }

    const orderIds = bookings.map((b) => b.orderId)

    // Fetch orders
    const orders = await Order.find({ _id: { $in: orderIds } })

    // For each order, fetch its latest traceability event
    const TraceabilityEvent = require('../models/TraceabilityEvent')
    const eventsByOrder = {}
    for (const order of orders) {
      const events = await TraceabilityEvent.find({ orderId: order._id })
        .sort({ timestamp: -1 })
        .limit(1)
      eventsByOrder[order._id.toString()] = events[0] || null
    }

    // Fetch farmer names
    const farmerIds = [...new Set(orders.map((o) => o.farmer?.toString()).filter(Boolean))]
    const farmers   = await User.find({ _id: { $in: farmerIds } }).select('name')
    const farmerMap = {}
    farmers.forEach((f) => { farmerMap[f._id.toString()] = f.name })

    // Count total events per order
    const eventCounts = {}
    for (const order of orders) {
      eventCounts[order._id.toString()] = await TraceabilityEvent.countDocuments({ orderId: order._id })
    }

    const items = orders.map((o) => {
      const lastEv = eventsByOrder[o._id.toString()]
      return {
        orderId:     o._id.toString(),
        cropName:    o.cropName,
        variety:     o.variety,
        quantity:    `${o.quantity} ${o.unit}`,
        farmerName:  farmerMap[o.farmer?.toString()] || '—',
        orderStatus: o.status,
        eventCount:  eventCounts[o._id.toString()] || 0,
        lastEvent:   lastEv ? fmtEvent(lastEv) : null,
        orderDate:   o.createdAt,
      }
    }).sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))

    res.json({ items, totalOrders: items.length })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer traceability', error: err.message })
  }
}

// ── GET /api/traceability/buyer/order/:orderId ──────────────────────────────────
// Full traceability timeline for one order — buyer ownership verified.
async function getBuyerOrderTraceability(req, res) {
  try {
    const { orderId } = req.params
    const User = require('../models/User')

    const order = await Order.findById(orderId)
    if (!order) return res.status(404).json({ message: 'Order not found' })

    // Verify buyer owns this order via their booking
    const booking = await Booking.findOne({
      _id:     order.booking,
      buyerId: req.user._id,
    })
    if (!booking) return res.status(404).json({ message: 'Order not found' })

    // Enrich summary with farmer info
    const farmer = await User.findById(order.farmer).select('name farmInfo verification')

    const summary = {
      orderId:          order._id.toString(),
      cropName:         order.cropName,
      variety:          order.variety,
      quantity:         `${order.quantity} ${order.unit}`,
      buyerName:        order.buyerCompany || order.buyerName,
      totalAmount:      order.totalAmount,
      status:           order.status,
      deliveryLocation: order.deliveryLocation,
      orderDate:        order.createdAt,
      farmer: farmer ? {
        id:           farmer._id.toString(),
        name:         farmer.name,
        farmName:     farmer.farmInfo?.farmName     || '',
        farmLocation: farmer.farmInfo?.farmLocation || '',
        verification: farmer.verification?.status   || 'Not Verified',
      } : null,
    }

    const events   = await getEventsByOrder(orderId, order.farmer)
    const timeline = annotateStatus(events)

    res.json({ summary, timeline, events: events.map(fmtEvent) })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Order not found' })
    res.status(500).json({ message: 'Failed to fetch order traceability', error: err.message })
  }
}

// ── GET /api/traceability/blockchain/status ──────────────────────────────────

// Returns live status of Polygon Amoy blockchain connection and smart contract
async function getTraceabilityBlockchainStatus(_req, res) {
  try {
    const status = await getBlockchainStatus()
    res.json(status)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch blockchain status', error: err.message })
  }
}

module.exports = {
  getCropTraceability,
  getOrderTraceability,
  getFarmerTraceability,
  getBuyerTraceability,
  getBuyerOrderTraceability,
  getTraceabilityBlockchainStatus,
}

