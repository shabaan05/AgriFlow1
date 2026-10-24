const User = require('../models/User')

// All handlers use req.user._id from JWT — buyers only access their own data.

// ── GET /api/buyers/profile ───────────────────────────────────────────────────
async function getBuyerProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ profile: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message })
  }
}

// ── PUT /api/buyers/profile ───────────────────────────────────────────────────
async function updateBuyerProfile(req, res) {
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

// ── GET /api/buyers/business-info ─────────────────────────────────────────────
async function getBuyerInfo(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ buyerInfo: user.buyerInfo || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch business info', error: err.message })
  }
}

// ── PUT /api/buyers/business-info ─────────────────────────────────────────────
async function updateBuyerInfo(req, res) {
  try {
    const { companyName, businessType, address, city, state, pincode, gstNumber, description } = req.body
    const user = await User.findById(req.user._id)

    user.buyerInfo = {
      companyName:  companyName  || '',
      businessType: businessType || '',
      address:      address      || '',
      city:         city         || '',
      state:        state        || '',
      pincode:      pincode      || '',
      gstNumber:    gstNumber    || '',
      description:  description  || '',
    }
    await user.save()
    res.json({ buyerInfo: user.buyerInfo })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update business info', error: err.message })
  }
}

// ── GET /api/buyers/verification ──────────────────────────────────────────────
async function getBuyerVerification(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ verification: user.verification || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch verification', error: err.message })
  }
}

// ── POST /api/buyers/verification/submit ──────────────────────────────────────
async function submitBuyerVerification(req, res) {
  try {
    const { documentType } = req.body
    const user = await User.findById(req.user._id)
    if (user.verification?.status === 'Verified') {
      return res.status(400).json({ message: 'Already verified' })
    }
    user.verification = {
      status:       'Pending',
      submittedAt:  new Date(),
      verifiedAt:   null,
      documentType: documentType || '',
      notes:        'Buyer verification request submitted. Under review.',
    }
    await user.save()
    res.json({ verification: user.verification })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit verification', error: err.message })
  }
}

// ── GET /api/buyers/payment-details ───────────────────────────────────────────
async function getBuyerPaymentDetails(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ paymentDetails: user.toSafeObject().paymentDetails })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment details', error: err.message })
  }
}

// ── PUT /api/buyers/payment-details ───────────────────────────────────────────
async function updateBuyerPaymentDetails(req, res) {
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

// ── PUT /api/buyers/notification-prefs ────────────────────────────────────────
async function updateBuyerNotifPrefs(req, res) {
  try {
    const user = await User.findById(req.user._id)
    user.notificationPrefs = { ...user.notificationPrefs?.toObject?.() || {}, ...req.body }
    await user.save()
    res.json({ notificationPrefs: user.notificationPrefs })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update notification preferences', error: err.message })
  }
}

module.exports = {
  getBuyerProfile, updateBuyerProfile,
  getBuyerInfo, updateBuyerInfo,
  getBuyerVerification, submitBuyerVerification,
  getBuyerPaymentDetails, updateBuyerPaymentDetails,
  updateBuyerNotifPrefs,
}
