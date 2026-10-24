const User = require('../models/User')

// ── GET /api/farmers/profile ──────────────────────────────────────────────────
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ profile: user.toSafeObject() })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message })
  }
}

// ── PUT /api/farmers/profile ──────────────────────────────────────────────────
async function updateProfile(req, res) {
  try {
    const { name, phone, avatar } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (name  !== undefined) user.name   = name.trim()
    if (phone !== undefined) user.phone  = phone.trim()
    if (avatar!== undefined) user.avatar = avatar.trim()

    await user.save()
    res.json({ profile: user.toSafeObject() })
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map(e => e.message).join('; ') })
    }
    res.status(500).json({ message: 'Failed to update profile', error: err.message })
  }
}

// ── GET /api/farmers/farm ─────────────────────────────────────────────────────
async function getFarmInfo(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ farmInfo: user.farmInfo || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch farm info', error: err.message })
  }
}

// ── PUT /api/farmers/farm ─────────────────────────────────────────────────────
async function updateFarmInfo(req, res) {
  try {
    const { farmName, farmLocation, farmSize, farmingType, mainCrops, description } = req.body
    const user = await User.findById(req.user._id)

    user.farmInfo = {
      farmName:     farmName     || '',
      farmLocation: farmLocation || '',
      farmSize:     farmSize     || '',
      farmingType:  farmingType  || '',
      mainCrops:    Array.isArray(mainCrops) ? mainCrops : [],
      description:  description  || '',
    }
    await user.save()
    res.json({ farmInfo: user.farmInfo })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update farm info', error: err.message })
  }
}

// ── GET /api/farmers/verification ────────────────────────────────────────────
async function getVerification(req, res) {
  try {
    const user = await User.findById(req.user._id)
    res.json({ verification: user.verification || {} })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch verification', error: err.message })
  }
}

// ── POST /api/farmers/verification/submit ────────────────────────────────────
// Moves status from Not Verified → Pending (no real KYC)
async function submitVerification(req, res) {
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
      notes:        'Verification request submitted. Under review.',
    }
    await user.save()
    res.json({ verification: user.verification })
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit verification', error: err.message })
  }
}

// ── GET /api/farmers/payment-details ─────────────────────────────────────────
async function getPaymentDetails(req, res) {
  try {
    const user = await User.findById(req.user._id)
    // Return masked version via toSafeObject
    res.json({ paymentDetails: user.toSafeObject().paymentDetails })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment details', error: err.message })
  }
}

// ── PUT /api/farmers/payment-details ─────────────────────────────────────────
async function updatePaymentDetails(req, res) {
  try {
    const { accountHolderName, bankName, accountNumber, ifscCode, upiId, preferredMethod } = req.body
    const user = await User.findById(req.user._id)

    // Only update provided fields; preserve existing if not sent
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
    // Return masked version
    res.json({ paymentDetails: user.toSafeObject().paymentDetails })
  } catch (err) {
    res.status(500).json({ message: 'Failed to update payment details', error: err.message })
  }
}

// ── PUT /api/farmers/notification-prefs ──────────────────────────────────────
async function updateNotificationPrefs(req, res) {
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
  getProfile, updateProfile,
  getFarmInfo, updateFarmInfo,
  getVerification, submitVerification,
  getPaymentDetails, updatePaymentDetails,
  updateNotificationPrefs,
}
