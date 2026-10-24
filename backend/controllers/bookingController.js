const Booking = require('../models/Booking')
const Order   = require('../models/Order')
const Crop    = require('../models/Crop')
const Payment = require('../models/Payment')
const traceabilityService = require('../services/traceabilityService')

// ── Seed helper ───────────────────────────────────────────────────────────────
async function seedIfEmpty(farmerId) {
  const count = await Booking.countDocuments({ farmer: farmerId })
  if (count > 0) return

  // Fetch first two of this farmer's crops to seed realistic bookings
  const crops = await Crop.find().limit(2)
  if (crops.length === 0) return

  const now  = new Date()
  const d = (days) => new Date(now.getTime() + days * 86400000)

  const seeds = [
    {
      farmer: farmerId, buyerName: 'Vikram Nair', buyerCompany: 'FreshMart Pvt Ltd',
      buyerContact: '+91 98100 11234',
      crop: crops[0]._id, cropName: crops[0].cropName, variety: crops[0].variety,
      quantity: 500, unit: crops[0].unit,
      pricePerUnit: crops[0].expectedPricePerKg,
      totalAmount: 500 * crops[0].expectedPricePerKg,
      deliveryLocation: 'Pune, Maharashtra', requestedDeliveryDate: d(5),
      status: 'Pending', notes: 'Grade A only, prefer chemical-free.',
    },
    {
      farmer: farmerId, buyerName: 'Priya Shah', buyerCompany: 'GreenBasket Co.',
      buyerContact: '+91 98200 22345',
      crop: crops[0]._id, cropName: crops[0].cropName, variety: crops[0].variety,
      quantity: 200, unit: crops[0].unit,
      pricePerUnit: crops[0].expectedPricePerKg - 2,
      totalAmount: 200 * (crops[0].expectedPricePerKg - 2),
      deliveryLocation: 'Nashik, Maharashtra', requestedDeliveryDate: d(8),
      status: 'Accepted', notes: '',
    },
    ...(crops[1] ? [{
      farmer: farmerId, buyerName: 'Anand Joshi', buyerCompany: 'Metro Wholesale',
      buyerContact: '+91 90000 33456',
      crop: crops[1]._id, cropName: crops[1].cropName, variety: crops[1].variety,
      quantity: 300, unit: crops[1].unit,
      pricePerUnit: crops[1].expectedPricePerKg,
      totalAmount: 300 * crops[1].expectedPricePerKg,
      deliveryLocation: 'Mumbai, Maharashtra', requestedDeliveryDate: d(12),
      status: 'Pending', notes: 'Bulk order — can arrange transport.',
    }] : []),
  ]

  await Booking.insertMany(seeds)
}

// ── Format ────────────────────────────────────────────────────────────────────
function fmt(b) {
  const d = b.toObject ? b.toObject() : b
  return {
    id:                    d._id.toString(),
    buyerId:               d.buyerId?.toString() || null,
    buyerName:             d.buyerName,
    buyerCompany:          d.buyerCompany,
    buyerContact:          d.buyerContact,
    farmerId:              d.farmer?.toString(),
    cropName:              d.cropName,
    variety:               d.variety,
    cropId:                d.crop?.toString(),
    quantity:              d.quantity,
    unit:                  d.unit,
    pricePerUnit:          d.pricePerUnit,
    totalAmount:           d.totalAmount,
    deliveryLocation:      d.deliveryLocation,
    requestedDeliveryDate: d.requestedDeliveryDate,
    status:                d.status,
    rejectionReason:       d.rejectionReason,
    notes:                 d.notes,
    orderId:               d.orderId?.toString() || null,
    createdAt:             d.createdAt,
  }
}

// ── POST /api/bookings ────────────────────────────────────────────────────────
// Supports BOTH farmer-initiated and buyer-initiated bookings.
// When a Buyer creates a booking:
//   - cropId must be provided
//   - farmerId is derived from the crop's owning farmer (via farmLocation match or explicit farmerId)
//   - buyerId is set from req.user._id
// When a Farmer creates a booking (existing behaviour): farmer = req.user._id
async function createBooking(req, res) {
  try {
    const { cropId, buyerName, buyerCompany, buyerContact,
            quantity, pricePerUnit, deliveryLocation,
            requestedDeliveryDate, notes, farmerId } = req.body

    if (!cropId || !quantity || !pricePerUnit) {
      return res.status(400).json({ message: 'cropId, quantity and pricePerUnit are required' })
    }

    const crop = await Crop.findById(cropId)
    if (!crop) return res.status(404).json({ message: 'Crop not found' })

    const isBuyer  = req.user.role === 'buyer'
    const isFarmer = req.user.role === 'farmer'

    let resolvedFarmerId
    let resolvedBuyerId   = null
    let resolvedBuyerName, resolvedBuyerCompany, resolvedBuyerContact

    if (isBuyer) {
      // Buyer creates booking — derive farmer from crop.farmerId (primary) or explicit farmerId
      if (farmerId) {
        resolvedFarmerId = farmerId
      } else if (crop.farmerId) {
        resolvedFarmerId = crop.farmerId
      } else {
        // Fallback: location match for legacy crops without farmerId
        const User = require('../models/User')
        const farmer = await User.findOne({
          role: 'farmer',
          'farmInfo.farmLocation': { $regex: new RegExp(crop.farmLocation, 'i') },
        })
        resolvedFarmerId = farmer?._id
        if (!resolvedFarmerId) {
          const anyFarmer = await User.findOne({ role: 'farmer' })
          resolvedFarmerId = anyFarmer?._id
        }
      }
      if (!resolvedFarmerId) {
        return res.status(400).json({ message: 'Could not identify the farmer for this crop. Please provide farmerId.' })
      }
      resolvedBuyerId      = req.user._id
      resolvedBuyerName    = buyerName || req.user.name
      resolvedBuyerCompany = buyerCompany || ''
      resolvedBuyerContact = buyerContact || req.user.phone || ''
    } else {
      // Farmer creates booking (existing behaviour)
      if (!buyerName) return res.status(400).json({ message: 'buyerName is required' })
      resolvedFarmerId     = req.user._id
      resolvedBuyerName    = buyerName
      resolvedBuyerCompany = buyerCompany || ''
      resolvedBuyerContact = buyerContact || ''
    }

    if (Number(quantity) > crop.availableQuantityKg) {
      return res.status(400).json({
        message: `Requested quantity (${quantity}) exceeds available quantity (${crop.availableQuantityKg} ${crop.unit})`,
      })
    }

    const booking = await Booking.create({
      farmer:   resolvedFarmerId,
      buyerId:  resolvedBuyerId,
      buyerName: resolvedBuyerName,
      buyerCompany: resolvedBuyerCompany,
      buyerContact: resolvedBuyerContact,
      crop: cropId, cropName: crop.cropName, variety: crop.variety,
      quantity: Number(quantity), unit: crop.unit,
      pricePerUnit: Number(pricePerUnit),
      totalAmount:  Number(quantity) * Number(pricePerUnit),
      deliveryLocation: deliveryLocation || crop.farmLocation,
      requestedDeliveryDate, notes: notes || '',
      status: 'Pending',
    })
    res.status(201).json(fmt(booking))
  } catch (err) {
    res.status(500).json({ message: 'Failed to create booking', error: err.message })
  }
}

// ── GET /api/bookings/farmer ──────────────────────────────────────────────────
async function getFarmerBookings(req, res) {
  try {
    await seedIfEmpty(req.user._id)
    const bookings = await Booking.find({ farmer: req.user._id }).sort({ createdAt: -1 })
    res.json(bookings.map(fmt))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch bookings', error: err.message })
  }
}

// ── GET /api/bookings/:id ─────────────────────────────────────────────────────
async function getBookingById(req, res) {
  try {
    const isBuyer = req.user.role === 'buyer'
    // Farmer: filter by farmer field. Buyer: filter by buyerId field.
    const query = isBuyer
      ? { _id: req.params.id, buyerId: req.user._id }
      : { _id: req.params.id, farmer: req.user._id }

    const booking = await Booking.findOne(query)
    if (!booking) return res.status(404).json({ message: 'Booking not found' })
    res.json(fmt(booking))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Booking not found' })
    res.status(500).json({ message: 'Failed to fetch booking', error: err.message })
  }
}

// ── PUT /api/bookings/:id/status ──────────────────────────────────────────────
// Valid transitions: Pending→Accepted, Pending→Rejected, Accepted→Cancelled
async function updateBookingStatus(req, res) {
  try {
    const { status, rejectionReason, scheduledPickupDate, pickupLocation } = req.body
    const booking = await Booking.findOne({ _id: req.params.id, farmer: req.user._id })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    const allowed = {
      Pending:  ['Accepted', 'Rejected'],
      Accepted: ['Cancelled'],
    }
    if (!allowed[booking.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot transition from ${booking.status} to ${status}`,
      })
    }

    booking.status = status
    if (status === 'Rejected') booking.rejectionReason = rejectionReason || ''

    // When Accepted → auto-create Order
    if (status === 'Accepted') {
      const order = await Order.create({
        booking:          booking._id,
        farmer:           req.user._id,
        buyerName:        booking.buyerName,
        buyerCompany:     booking.buyerCompany,
        cropName:         booking.cropName,
        variety:          booking.variety,
        quantity:         booking.quantity,
        unit:             booking.unit,
        pricePerUnit:     booking.pricePerUnit,
        totalAmount:      booking.totalAmount,
        deliveryLocation: booking.deliveryLocation,
        pickupLocation:   pickupLocation || '',
        scheduledPickupDate: scheduledPickupDate || booking.requestedDeliveryDate,
        status:           'Confirmed',
        timeline: [{ status: 'Confirmed', note: 'Booking accepted by farmer' }],
      })
      booking.orderId = order._id

      // ── Traceability: BOOKED event ────────────────────────────────────────
      await traceabilityService.createEvent({
        farmerId:    req.user._id,
        cropId:      booking.crop,
        orderId:     order._id,
        bookingId:   booking._id,
        eventType:   'BOOKED',
        description: `Booking accepted from ${booking.buyerCompany || booking.buyerName} for ${booking.quantity} ${booking.unit} of ${booking.cropName}`,
        metadata:    { buyerName: booking.buyerName, quantity: booking.quantity, pricePerUnit: booking.pricePerUnit, totalAmount: booking.totalAmount },
      })

      // ── Traceability: PICKUP_SCHEDULED event ──────────────────────────────
      if (scheduledPickupDate || booking.requestedDeliveryDate) {
        await traceabilityService.createEvent({
          farmerId:   req.user._id,
          cropId:     booking.crop,
          orderId:    order._id,
          bookingId:  booking._id,
          eventType:  'PICKUP_SCHEDULED',
          description:`Pickup scheduled for ${new Date(scheduledPickupDate || booking.requestedDeliveryDate).toLocaleDateString('en-IN')}`,
          location:   pickupLocation || booking.deliveryLocation || '',
          metadata:   { scheduledDate: scheduledPickupDate || booking.requestedDeliveryDate },
        })
      }
    }

    await booking.save()
    res.json(fmt(booking))
  } catch (err) {
    res.status(500).json({ message: 'Failed to update booking', error: err.message })
  }
}

// ── GET /api/bookings/buyer ────────────────────────────────────────────────────
async function getBuyerBookings(req, res) {
  try {
    const bookings = await Booking.find({ buyerId: req.user._id }).sort({ createdAt: -1 })
    res.json(bookings.map(fmt))
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch buyer bookings', error: err.message })
  }
}

// ── PUT /api/bookings/:id/cancel (buyer) ──────────────────────────────────────
// Buyer can cancel only their own PENDING bookings.
async function cancelBookingByBuyer(req, res) {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, buyerId: req.user._id })
    if (!booking) return res.status(404).json({ message: 'Booking not found' })

    if (booking.status !== 'Pending') {
      return res.status(400).json({
        message: `Only Pending bookings can be cancelled by the buyer (current: ${booking.status})`,
      })
    }

    booking.status = 'Cancelled'
    await booking.save()
    res.json(fmt(booking))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Booking not found' })
    res.status(500).json({ message: 'Failed to cancel booking', error: err.message })
  }
}

module.exports = { createBooking, getFarmerBookings, getBookingById, updateBookingStatus,
                   getBuyerBookings, cancelBookingByBuyer }
