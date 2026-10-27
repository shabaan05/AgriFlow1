const PickupRequest       = require('../models/PickupRequest')
const Order               = require('../models/Order')
const User                = require('../models/User')
const Booking             = require('../models/Booking')
const Payment             = require('../models/Payment')
const TransporterEarning  = require('../models/TransporterEarning')
const traceabilityService = require('../services/traceabilityService')
const routeOptimizationService = require('../services/routeOptimizationService')

// ── Format helper ─────────────────────────────────────────────────────────────
function fmt(doc) {
  const d = doc.toObject ? doc.toObject() : doc
  return {
    id:                    d._id.toString(),
    orderId:               d.orderId?.toString(),
    bookingId:             d.bookingId?.toString() || null,
    farmerId:              d.farmerId?.toString(),
    buyerId:               d.buyerId?.toString() || null,
    transporterId:         d.transporterId?.toString() || null,
    cropName:              d.cropName,
    variety:               d.variety,
    quantity:              d.quantity,
    unit:                  d.unit,
    totalAmount:           d.totalAmount,
    farmerName:            d.farmerName,
    buyerName:             d.buyerName,
    buyerCompany:          d.buyerCompany,
    pickupLocation:        d.pickupLocation,
    deliveryLocation:      d.deliveryLocation,
    pickupDate:            d.pickupDate,
    deliveryDate:          d.deliveryDate,
    estimatedDistanceKm:   d.estimatedDistanceKm,
    estimatedDurationHrs:  d.estimatedDurationHrs,
    estimatedEarnings:     d.estimatedEarnings,
    status:                d.status,
    rejectionReason:       d.rejectionReason,
    notes:                 d.notes,
    createdAt:             d.createdAt,
    updatedAt:             d.updatedAt,
  }
}

// ── GET /api/transporter/pickups ──────────────────────────────────────────────
// Returns PENDING requests visible to all transporters + this transporter's own
async function getPickupRequests(req, res) {
  try {
    const query = {
      $or: [
        { status: 'PENDING' },
        { transporterId: req.user._id },
      ],
    }
    const requests = await PickupRequest.find(query).sort({ createdAt: -1 })

    // Enrich with farmer location from User.farmInfo if needed
    const farmerIds = [...new Set(requests.map((r) => r.farmerId?.toString()).filter(Boolean))]
    const farmers   = await User.find({ _id: { $in: farmerIds } }).select('name farmInfo')
    const farmerMap = {}
    farmers.forEach((f) => { farmerMap[f._id.toString()] = f })

    const result = requests.map((r) => {
      const f = farmerMap[r.farmerId?.toString()]
      return {
        ...fmt(r),
        farmerVerification: f?.verification?.status || 'Not Verified',
        farmerFarmLocation: f?.farmInfo?.farmLocation || r.pickupLocation,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pickup requests', error: err.message })
  }
}

// ── GET /api/transporter/pickups/:id ─────────────────────────────────────────
async function getPickupRequestById(req, res) {
  try {
    const request = await PickupRequest.findById(req.params.id)
    if (!request) return res.status(404).json({ message: 'Pickup request not found' })

    // Only transporter can see PENDING requests; if ACCEPTED, only the assigned transporter
    if (request.status === 'ACCEPTED' &&
        request.transporterId?.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Pickup request not found' })
    }

    const farmer = await User.findById(request.farmerId).select('name phone farmInfo verification')
    const enriched = {
      ...fmt(request),
      farmer: farmer ? {
        id:           farmer._id.toString(),
        name:         farmer.name,
        phone:        farmer.phone,
        farmName:     farmer.farmInfo?.farmName     || '',
        farmLocation: farmer.farmInfo?.farmLocation || request.pickupLocation,
        verification: farmer.verification?.status   || 'Not Verified',
      } : null,
    }

    res.json(enriched)
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Pickup request not found' })
    res.status(500).json({ message: 'Failed to fetch request', error: err.message })
  }
}

// ── PUT /api/transporter/pickups/:id/accept ───────────────────────────────────
async function acceptPickupRequest(req, res) {
  try {
    // findOneAndUpdate with status: PENDING is the atomic check-and-set
    // that prevents two transporters from accepting the same request simultaneously
    const request = await PickupRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      {
        status:        'ACCEPTED',
        transporterId: req.user._id,
      },
      { new: true }
    )

    if (!request) {
      // Either doesn't exist, already accepted by someone else, or wrong status
      const existing = await PickupRequest.findById(req.params.id)
      if (!existing) return res.status(404).json({ message: 'Pickup request not found' })
      if (existing.status !== 'PENDING') {
        return res.status(409).json({
          message: `Request is no longer available (status: ${existing.status})`,
        })
      }
      return res.status(409).json({ message: 'Request was just taken by another transporter' })
    }

    res.json(fmt(request))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Pickup request not found' })
    res.status(500).json({ message: 'Failed to accept request', error: err.message })
  }
}

// ── PUT /api/transporter/pickups/:id/reject ───────────────────────────────────
async function rejectPickupRequest(req, res) {
  try {
    const { rejectionReason } = req.body

    const request = await PickupRequest.findOneAndUpdate(
      { _id: req.params.id, status: 'PENDING' },
      {
        status:          'REJECTED',
        transporterId:   req.user._id,
        rejectionReason: rejectionReason || '',
      },
      { new: true }
    )

    if (!request) {
      const existing = await PickupRequest.findById(req.params.id)
      if (!existing) return res.status(404).json({ message: 'Pickup request not found' })
      return res.status(400).json({
        message: `Cannot reject a request with status: ${existing.status}`,
      })
    }

    res.json(fmt(request))
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Pickup request not found' })
    res.status(500).json({ message: 'Failed to reject request', error: err.message })
  }
}

// ── Internal: createPickupRequest ─────────────────────────────────────────────
// Called from orderController when an order reaches 'Ready for Pickup'.
// Uses upsert so it is safe to call multiple times (idempotent).
async function createPickupRequest(order, booking) {
  try {
    const User   = require('../models/User')
    const farmer = await User.findById(order.farmer).select('name')

    // Simple distance heuristic until real routing is added:
    // placeholder = 150 km, 3 h, ₹3 500 per order
    const DEMO_KM    = 150
    const DEMO_HRS   = 3
    const DEMO_EARN  = Math.round(order.totalAmount * 0.08)   // 8 % of order value

    await PickupRequest.findOneAndUpdate(
      { orderId: order._id },
      {
        orderId:          order._id,
        bookingId:        order.booking || null,
        farmerId:         order.farmer,
        buyerId:          booking?.buyerId || null,
        cropName:         order.cropName,
        variety:          order.variety,
        quantity:         order.quantity,
        unit:             order.unit,
        totalAmount:      order.totalAmount,
        farmerName:       farmer?.name || '',
        buyerName:        order.buyerName,
        buyerCompany:     order.buyerCompany,
        pickupLocation:   order.pickupLocation || '',
        deliveryLocation: order.deliveryLocation,
        pickupDate:       order.scheduledPickupDate || null,
        deliveryDate:     null,
        estimatedDistanceKm:   DEMO_KM,
        estimatedDurationHrs:  DEMO_HRS,
        estimatedEarnings:     DEMO_EARN,
        status:           'PENDING',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    console.log(`[transporter] PickupRequest created/updated for order ${order._id}`)
  } catch (err) {
    console.error('[transporter] Failed to create pickup request:', err.message)
  }
}

// ── GET /api/transporter/trips ────────────────────────────────────────────────
// Returns trips assigned to this transporter (ACCEPTED or COMPLETED pickup requests),
// enriched with the actual Order delivery status.
async function getTrips(req, res) {
  try {
    const requests = await PickupRequest.find({
      transporterId: req.user._id,
      status: { $in: ['ACCEPTED', 'COMPLETED'] },
    }).sort({ createdAt: -1 })

    if (requests.length === 0) return res.json([])

    // Fetch linked orders for real-time status
    const orderIds = requests.map((r) => r.orderId)
    const orders   = await Order.find({ _id: { $in: orderIds } })
    const orderMap = {}
    orders.forEach((o) => { orderMap[o._id.toString()] = o })

    const result = requests.map((r) => {
      const order = orderMap[r.orderId?.toString()]
      return {
        ...fmt(r),
        orderStatus:    order?.status || 'Unknown',
        orderTimeline:  order?.timeline || [],
        actualDeliveryDate: order?.actualDeliveryDate || null,
      }
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trips', error: err.message })
  }
}

// ── GET /api/transporter/trips/:id ──────────────────────────────────────────
async function getTripById(req, res) {
  try {
    const request = await PickupRequest.findOne({
      _id: req.params.id,
      transporterId: req.user._id,
    })
    if (!request) return res.status(404).json({ message: 'Trip not found' })

    const order = await Order.findById(request.orderId)
    const farmer = await User.findById(request.farmerId).select('name phone farmInfo verification')

    res.json({
      ...fmt(request),
      orderStatus:       order?.status || 'Unknown',
      orderTimeline:     order?.timeline || [],
      actualDeliveryDate: order?.actualDeliveryDate || null,
      farmer: farmer ? {
        id:           farmer._id.toString(),
        name:         farmer.name,
        phone:        farmer.phone,
        farmName:     farmer.farmInfo?.farmName     || '',
        farmLocation: farmer.farmInfo?.farmLocation || request.pickupLocation,
        verification: farmer.verification?.status   || 'Not Verified',
      } : null,
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Trip not found' })
    res.status(500).json({ message: 'Failed to fetch trip', error: err.message })
  }
}

// ── Helper: advance order status + create traceability event ─────────────────
async function advanceTrip(req, res, newStatus, eventType, eventDesc, locationField) {
  try {
    const request = await PickupRequest.findOne({
      _id: req.params.id,
      transporterId: req.user._id,
      status: 'ACCEPTED',
    })
    if (!request) return res.status(404).json({ message: 'Trip not found or not assigned to you' })

    const order = await Order.findById(request.orderId)
    if (!order) return res.status(404).json({ message: 'Linked order not found' })

    // Validate transition
    const TRANSITIONS = {
      'Picked Up':     ['Ready for Pickup'],
      'In Transit':    ['Picked Up'],
      'Delivered':      ['In Transit'],
    }
    if (!TRANSITIONS[newStatus]?.includes(order.status)) {
      return res.status(400).json({
        message: `Cannot move order from "${order.status}" to "${newStatus}"`,
      })
    }

    // Update Order
    order.status = newStatus
    order.timeline.push({ status: newStatus, note: `Updated by transporter: ${req.user.name}` })
    if (newStatus === 'Delivered') order.actualDeliveryDate = new Date()
    await order.save()

    // Create TraceabilityEvent
    const booking = await Booking.findById(order.booking)
    const cropId  = booking?.crop || null

    await traceabilityService.createEvent({
      farmerId:   order.farmer,        // the farmer who owns the crop
      cropId,
      orderId:    order._id,
      bookingId:  order.booking,
      eventType,
      description: eventDesc,
      location:   order[locationField] || '',
      metadata:   {
        transporterName: req.user.name,
        transporterId:   req.user._id.toString(),
        buyerName:       order.buyerName,
      },
    })

    // When Delivered: create Payment + mark PickupRequest as COMPLETED + create TransporterEarning
    if (newStatus === 'Delivered') {
      const existing = await Payment.findOne({ order: order._id })
      if (!existing) {
        await Payment.create({
          order:    order._id,
          farmer:   order.farmer,
          buyerName: order.buyerName,
          cropName:  order.cropName,
          amount:    order.totalAmount,
          status:    'Pending',
        })
      }
      request.status = 'COMPLETED'
      await request.save()

      // ── Create TransporterEarning (idempotent — unique index on pickupRequestId) ──
      const BASE_RATE    = 500                         // base transport fee
      const DIST_RATE    = 5                           // ₹5 per km
      const QTY_RATE     = 0.5                         // ₹0.50 per kg
      const distComp     = (request.estimatedDistanceKm || 0) * DIST_RATE
      const qtyComp      = (request.quantity || 0) * QTY_RATE
      const totalEarning = BASE_RATE + distComp + qtyComp

      await TransporterEarning.findOneAndUpdate(
        { pickupRequestId: request._id },
        {
          pickupRequestId:   request._id,
          orderId:           order._id,
          transporterId:     req.user._id,
          cropName:          request.cropName,
          quantity:          request.quantity,
          unit:              request.unit,
          pickupLocation:    request.pickupLocation,
          deliveryLocation:  request.deliveryLocation,
          amount:            totalEarning,
          calculation: {
            baseAmount:        BASE_RATE,
            distanceComponent: distComp,
            quantityComponent: qtyComp,
            distanceKm:        request.estimatedDistanceKm || 0,
          },
          status:      'PENDING',
          completedAt: new Date(),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    }

    res.json({
      ...fmt(request),
      orderStatus:       order.status,
      orderTimeline:     order.timeline,
      actualDeliveryDate: order.actualDeliveryDate,
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Trip not found' })
    res.status(500).json({ message: 'Failed to update trip status', error: err.message })
  }
}

// ── PUT /api/transporter/trips/:id/pickup ─────────────────────────────────────
async function markPickedUp(req, res) {
  return advanceTrip(req, res, 'Picked Up', 'PICKED_UP',
    `Crop picked up by transporter (${req.user.name})`, 'pickupLocation')
}

// ── PUT /api/transporter/trips/:id/in-transit ──────────────────────────────────
async function markInTransit(req, res) {
  return advanceTrip(req, res, 'In Transit', 'IN_TRANSIT',
    `Order in transit to ${req.body?.deliveryLocation || 'buyer'}`, 'deliveryLocation')
}

// ── PUT /api/transporter/trips/:id/delivered ───────────────────────────────────
async function markDelivered(req, res) {
  return advanceTrip(req, res, 'Delivered', 'DELIVERED',
    `Order delivered to ${req.body?.buyerName || 'buyer'}`, 'deliveryLocation')
}

// ── GET /api/transporter/earnings ────────────────────────────────────────────
async function getEarnings(req, res) {
  try {
    const earnings = await TransporterEarning.find({ transporterId: req.user._id })
      .sort({ completedAt: -1 })

    // Calculate KPIs
    const now       = new Date()
    const weekAgo   = new Date(now - 7  * 86400000)
    const monthAgo  = new Date(now - 30 * 86400000)

    const totalEarnings = earnings.reduce((s, e) => s + e.amount, 0)
    const thisMonth     = earnings.filter((e) => new Date(e.completedAt) >= monthAgo).reduce((s, e) => s + e.amount, 0)
    const thisWeek      = earnings.filter((e) => new Date(e.completedAt) >= weekAgo).reduce((s, e) => s + e.amount, 0)
    const pending       = earnings.filter((e) => e.status === 'PENDING').reduce((s, e) => s + e.amount, 0)
    const completedTrips = earnings.length

    res.json({
      summary: {
        totalEarnings,
        thisMonth,
        thisWeek,
        pending,
        completedTrips,
      },
      earnings: earnings.map((e) => {
        const d = e.toObject ? e.toObject() : e
        return {
          id:                d._id.toString(),
          pickupRequestId:   d.pickupRequestId?.toString(),
          orderId:           d.orderId?.toString(),
          cropName:          d.cropName,
          quantity:          d.quantity,
          unit:              d.unit,
          pickupLocation:    d.pickupLocation,
          deliveryLocation:  d.deliveryLocation,
          amount:            d.amount,
          calculation:       d.calculation,
          status:            d.status,
          paidAt:            d.paidAt,
          completedAt:       d.completedAt,
          createdAt:         d.createdAt,
        }
      }),
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch earnings', error: err.message })
  }
}

// ── GET /api/transporter/earnings/:id ─────────────────────────────────────────
async function getEarningById(req, res) {
  try {
    const earning = await TransporterEarning.findOne({
      _id: req.params.id,
      transporterId: req.user._id,
    })
    if (!earning) return res.status(404).json({ message: 'Earning record not found' })

    // Fetch linked order for enrichment
    const order = await Order.findById(earning.orderId)
    const d = earning.toObject ? earning.toObject() : earning

    res.json({
      id:                d._id.toString(),
      pickupRequestId:   d.pickupRequestId?.toString(),
      orderId:           d.orderId?.toString(),
      cropName:          d.cropName,
      quantity:          d.quantity,
      unit:              d.unit,
      pickupLocation:    d.pickupLocation,
      deliveryLocation:  d.deliveryLocation,
      amount:            d.amount,
      calculation:       d.calculation,
      status:            d.status,
      paidAt:            d.paidAt,
      completedAt:       d.completedAt,
      createdAt:         d.createdAt,
      order: order ? {
        id:           order._id.toString(),
        status:       order.status,
        buyerName:    order.buyerName,
        buyerCompany: order.buyerCompany,
        totalAmount:  order.totalAmount,
        actualDeliveryDate: order.actualDeliveryDate,
      } : null,
    })
  } catch (err) {
    if (err.name === 'CastError') return res.status(404).json({ message: 'Earning record not found' })
    res.status(500).json({ message: 'Failed to fetch earning', error: err.message })
  }
}

// ── GET /api/transporter/profile ─────────────────────────────────────────────
async function getTransporterProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ profile: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message })
  }
}

// ── PUT /api/transporter/profile ─────────────────────────────────────────────
async function updateTransporterProfile(req, res) {
  try {
    const { name, phone, avatar } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (name   !== undefined) user.name   = name.trim()
    if (phone  !== undefined) user.phone  = phone.trim()
    if (avatar !== undefined) user.avatar = avatar.trim()

    await user.save()
    res.json({ profile: user.toSafeObject() })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join('; ') })
    }
    res.status(500).json({ message: 'Failed to update profile', error: err.message })
  }
}

// ── GET /api/transporter/transporter-info ───────────────────────────────────
async function getTransporterInfo(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ transporterInfo: user.transporterInfo || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transporter info', error: err.message })
  }
}

// ── PUT /api/transporter/transporter-info ───────────────────────────────────
async function updateTransporterInfo(req, res) {
  try {
    const { address, city, state, pincode } = req.body
    const user = await User.findById(req.user._id)
    user.transporterInfo = {
      address: address || '',
      city:    city    || '',
      state:   state   || '',
      pincode: pincode || '',
    }
    await user.save()
    res.json({ transporterInfo: user.transporterInfo })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update info', error: err.message })
  }
}

// ── GET /api/transporter/vehicle ─────────────────────────────────────────────
async function getVehicleInfo(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ vehicleInfo: user.vehicleInfo || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch vehicle info', error: err.message })
  }
}

// ── PUT /api/transporter/vehicle ─────────────────────────────────────────────
async function updateVehicleInfo(req, res) {
  try {
    const { vehicleType, vehicleNumber, capacity, availability, description } = req.body
    const user = await User.findById(req.user._id)
    user.vehicleInfo = {
      vehicleType:   vehicleType   || '',
      vehicleNumber: vehicleNumber || '',
      capacity:      capacity      || '',
      availability:  availability  || '',
      description:   description   || '',
    }
    await user.save()
    res.json({ vehicleInfo: user.vehicleInfo })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vehicle info', error: err.message })
  }
}

// ── GET /api/transporter/verification ────────────────────────────────────────
async function getTransporterVerification(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ verification: user.verification || {}, vehicleVerification: user.vehicleInfo?.verificationStatus || 'Not Verified' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch verification', error: err.message })
  }
}

// ── POST /api/transporter/verification/submit ───────────────────────────────
async function submitTransporterVerification(req, res) {
  try {
    const { documentType, vehicleVerification } = req.body
    const user = await User.findById(req.user._id)
    if (user.verification?.status === 'Verified') {
      return res.status(400).json({ message: 'Already verified' })
    }
    user.verification = {
      status:       'Pending',
      submittedAt:  new Date(),
      verifiedAt:   null,
      documentType: documentType || '',
      notes:        'Transporter verification request submitted. Under review.',
    }
    if (vehicleVerification) {
      user.vehicleInfo = user.vehicleInfo || {}
      user.vehicleInfo.verificationStatus = 'Pending'
    }
    await user.save()
    res.json({ verification: user.verification, vehicleVerification: user.vehicleInfo?.verificationStatus })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit verification', error: err.message })
  }
}

// ── GET /api/transporter/payment-details ─────────────────────────────────────
async function getTransporterPaymentDetails(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ paymentDetails: user.toSafeObject().paymentDetails })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment details', error: err.message })
  }
}

// ── PUT /api/transporter/payment-details ─────────────────────────────────────
async function updateTransporterPaymentDetails(req, res) {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId, preferredMethod } = req.body
    const user = await User.findById(req.user._id)
    const existing = user.paymentDetails || {}
    user.paymentDetails = {
      accountHolderName: accountHolderName ?? existing.accountHolderName ?? '',
      bankName:          bankName          ?? existing.bankName          ?? '',
      accountNumber:     accountNumber     ?? existing.accountNumber     ?? '',
      ifscCode:          ifscCode          ?? existing.ifscCode          ?? '',
      upiId:             upiId             ?? existing.upiId             ?? '',
      preferredMethod:   preferredMethod   ?? existing.preferredMethod   ?? '',
      isSet:             true,
    }
    await user.save()
    res.json({ paymentDetails: user.toSafeObject().paymentDetails })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment details', error: err.message })
  }
}

// ── PUT /api/transporter/notification-prefs ──────────────────────────────────
async function updateTransporterNotifPrefs(req, res) {
  try {
    const user = await User.findById(req.user._id)
    user.notificationPrefs = { ...user.notificationPrefs?.toObject?.() || {}, ...req.body }
    await user.save()
    res.json({ notificationPrefs: user.notificationPrefs })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification preferences', error: err.message })
  }
}

/**
 * POST /api/transporter/routes/optimize
 *
 * Route Optimization: accepts a list of pickup request IDs and vehicle
 * capacity, returns an optimized pickup/delivery sequence.
 *
 * Only authenticated transporters may call this endpoint.
 */
async function optimizeRoute(req, res) {
  try {
    if (req.user.role !== 'transporter') {
      return res.status(403).json({ success: false, message: 'Access denied — transporters only' })
    }

    const { pickupRequestIds, vehicleCapacity } = req.body

    if (!Array.isArray(pickupRequestIds) || pickupRequestIds.length === 0) {
      return res.status(400).json({ success: false, message: 'pickupRequestIds must be a non-empty array' })
    }

    // Parse vehicleCapacity — stored as String on User.vehicleInfo.capacity
    const capKg = vehicleCapacity !== undefined && vehicleCapacity !== null
      ? Math.max(1, parseFloat(String(vehicleCapacity)) || 1000)
      : 1000

    const result = await routeOptimizationService.optimize({
      pickupRequestIds,
      vehicleCapacity: capKg,
    })

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.json(result)
  } catch (err) {
    console.error('[route-optimize]', err)
    res.status(500).json({ success: false, message: 'Route optimization error', error: err.message })
  }
}

module.exports = {
  getPickupRequests,
  getPickupRequestById,
  acceptPickupRequest,
  rejectPickupRequest,
  createPickupRequest,
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
  optimizeRoute,
}
