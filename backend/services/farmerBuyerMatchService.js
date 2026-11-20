/**
 * farmerBuyerMatchService.js
 *
 * Farmer-perspective Buyer–Farmer Matching Service.
 *
 * Inverse of buyerMatchService.js:
 *   - buyerMatchService: given a buyer's criteria → find matching CROPS.
 *   - farmerBuyerMatchService: given a farmer's id → find matching BUYER REQUIREMENTS.
 *
 * Flow:
 *   1. Fetch the farmer's available crops.
 *   2. Fetch all ACTIVE buyer requirements.
 *   3. For each (crop, requirement) pair that shares the same crop name,
 *      score the match (0–100) using the same weighted factors as buyerMatchService.
 *   4. Return one result per (crop, requirement) pair, ranked by score descending.
 *   5. Deduplicate: if the same buyer requirement matches multiple crops,
 *      only keep the highest-scoring pairing.
 *
 * No ML, no LLM, no external APIs — pure deterministic logic.
 * No new Mongoose models are created.
 */

'use strict'

const Crop             = require('../models/Crop')
const BuyerRequirement = require('../models/BuyerRequirement')
const User             = require('../models/User')

// ── Tunable weights (same philosophy as buyerMatchService) ───────────────────
const WEIGHTS = {
  price:    25,   // crop price vs buyer budget
  quality:  20,   // grade match
  quantity: 20,   // crop available qty vs buyer required qty
  location: 15,   // farm location vs buyer delivery location
  dateSuit: 10,   // harvest date vs buyer required-by date
  buyer:    10,   // buyer reliability proxy (account age + verification)
}

// Crop statuses that mean supply is actually available
const AVAILABLE_STATUSES = new Set(['Harvest Ready', 'Pre-Harvest', 'Harvested'])

// Grade tier (higher = better quality)
const GRADE_ORDER = { 'Grade A': 2, 'Grade B': 1, 'Grade C': 0 }

// Max matches to return
const TOP_N = 10

// ── Eligibility guards ────────────────────────────────────────────────────────

function cropIsAvailable(crop) {
  return (
    AVAILABLE_STATUSES.has(crop.status) &&
    crop.availableQuantityKg > 0
  )
}

function requirementIsActive(req) {
  return req.status === 'ACTIVE'
}

/**
 * Returns false if this (crop, requirement) pair is a hard mismatch.
 * Returns true if it should proceed to scoring.
 */
function isEligiblePair(crop, req) {
  // 1. Crop name must match (case-insensitive)
  if (crop.cropName.trim().toLowerCase() !== req.cropName.trim().toLowerCase()) {
    return false
  }

  // 2. If buyer has a maxPricePerKg and crop's minimum price exceeds it → hard exclude
  if (
    req.maxPricePerKg != null &&
    crop.minimumAcceptablePrice > 0 &&
    crop.minimumAcceptablePrice > req.maxPricePerKg
  ) {
    return false
  }

  // 3. If buyer requires a specific grade, exclude crops below that tier
  if (req.qualityGrade && req.qualityGrade !== 'Any' && req.qualityGrade !== '') {
    const buyerTier = GRADE_ORDER[req.qualityGrade] ?? -1
    const cropTier  = GRADE_ORDER[crop.qualityGrade] ?? -1
    if (cropTier < buyerTier) return false
  }

  // 4. If buyer requiredByDate is in the past → stale requirement (skip)
  if (req.requiredByDate) {
    const required = new Date(req.requiredByDate)
    if (required < new Date()) return false
  }

  // 5. If buyer requiredByDate exists and crop won't be ready in time → skip
  if (req.requiredByDate && crop.expectedHarvestDate) {
    const required = new Date(req.requiredByDate)
    const harvest  = new Date(crop.expectedHarvestDate)
    if (harvest > required) return false
  }

  return true
}

// ── Factor scorers (0–100 each) ───────────────────────────────────────────────

function scorePrice(crop, req) {
  // Farmer wants to know: does the buyer's budget accommodate my price?
  if (req.maxPricePerKg == null) return 50  // no constraint — neutral

  const cropPrice = crop.expectedPricePerKg
  const budget    = req.maxPricePerKg

  if (cropPrice <= budget) {
    const gap = (budget - cropPrice) / budget
    return Math.round(60 + 40 * Math.min(gap, 1))
  }
  // Price above budget (passed hard filter because minPrice ≤ budget)
  const over = (cropPrice - budget) / budget
  return Math.max(0, Math.round(60 * (1 - over / 0.5)))
}

function scoreQuality(crop, req) {
  if (!req.qualityGrade || req.qualityGrade === 'Any' || req.qualityGrade === '') return 70

  const buyerTier = GRADE_ORDER[req.qualityGrade] ?? 0
  const cropTier  = GRADE_ORDER[crop.qualityGrade] ?? 0
  const diff      = cropTier - buyerTier

  if (diff >= 0)   return 100   // meets or exceeds
  if (diff === -1) return 60
  return 20
}

function scoreQuantity(crop, req) {
  if (!req.quantity || req.quantity <= 0) return 50

  const ratio = crop.availableQuantityKg / req.quantity
  if (ratio >= 1)  return 100
  return Math.max(10, Math.round(10 + 90 * ratio))
}

function scoreLocation(crop, req) {
  if (!req.deliveryLocation || !crop.farmLocation) return 40

  const normalize = (s) =>
    s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(Boolean)

  const farmerTokens = normalize(crop.farmLocation)
  const buyerTokens  = normalize(req.deliveryLocation)

  const overlap = farmerTokens.filter(t => buyerTokens.includes(t)).length

  if (overlap === 0) return 30
  if (overlap === 1) return 60
  return Math.min(100, 60 + overlap * 20)
}

function scoreDateSuit(crop, req) {
  if (!req.requiredByDate) return 60

  const harvest  = new Date(crop.expectedHarvestDate)
  const required = new Date(req.requiredByDate)
  const days     = Math.round((required - harvest) / (1000 * 60 * 60 * 24))

  if (days <= 7)  return 100
  if (days <= 14) return 90
  if (days <= 30) return 70
  if (days <= 60) return 50
  return 30
}

function scoreBuyer(buyerUser) {
  if (!buyerUser) return 40

  let score = 0
  const verStatus = buyerUser.verification?.status || 'Not Verified'
  if (verStatus === 'Verified')     score += 60
  else if (verStatus === 'Pending') score += 30
  else                              score += 10

  const ageMs    = Date.now() - new Date(buyerUser.createdAt).getTime()
  const ageDays  = ageMs / (1000 * 60 * 60 * 24)
  const ageBonus = Math.min(40, Math.round(ageDays / 30))
  score += ageBonus

  return Math.min(100, score)
}

// ── Composite score + reasons ─────────────────────────────────────────────────

function computeScore(crop, req, buyerUser) {
  const f = {
    price:    scorePrice(crop, req),
    quality:  scoreQuality(crop, req),
    quantity: scoreQuantity(crop, req),
    location: scoreLocation(crop, req),
    dateSuit: scoreDateSuit(crop, req),
    buyer:    scoreBuyer(buyerUser),
  }

  const matchScore = Math.round(
    (f.price    * WEIGHTS.price    +
     f.quality  * WEIGHTS.quality  +
     f.quantity * WEIGHTS.quantity +
     f.location * WEIGHTS.location +
     f.dateSuit * WEIGHTS.dateSuit +
     f.buyer    * WEIGHTS.buyer) / 100
  )

  const reasons = []

  // Price
  if (req.maxPricePerKg != null) {
    const diff = req.maxPricePerKg - crop.expectedPricePerKg
    if (diff >= 0) {
      reasons.push(`Your price ₹${crop.expectedPricePerKg}/kg fits within buyer budget of ₹${req.maxPricePerKg}/kg`)
    } else {
      reasons.push(`Your price ₹${crop.expectedPricePerKg}/kg is above buyer budget (₹${req.maxPricePerKg}/kg) but minimum is ₹${crop.minimumAcceptablePrice}/kg`)
    }
  } else {
    reasons.push(`Buyer has no price ceiling — your price ₹${crop.expectedPricePerKg}/kg is acceptable`)
  }

  // Quality
  if (!req.qualityGrade || req.qualityGrade === 'Any' || req.qualityGrade === '') {
    reasons.push(`Buyer accepts any grade — your ${crop.qualityGrade} qualifies`)
  } else if (crop.qualityGrade === req.qualityGrade) {
    reasons.push(`Grade match: buyer requires ${req.qualityGrade} and your crop is ${crop.qualityGrade}`)
  } else {
    reasons.push(`Your ${crop.qualityGrade} meets or exceeds buyer's ${req.qualityGrade} requirement`)
  }

  // Quantity
  if (req.quantity > 0) {
    const pct = Math.round((crop.availableQuantityKg / req.quantity) * 100)
    if (pct >= 100) {
      reasons.push(`Your ${crop.availableQuantityKg} kg fully covers their ${req.quantity} kg requirement`)
    } else {
      reasons.push(`You have ${crop.availableQuantityKg} kg available — ${pct}% of buyer's ${req.quantity} kg need`)
    }
  }

  // Location
  if (req.deliveryLocation && crop.farmLocation) {
    const loc = scoreLocation(crop, req)
    if (loc >= 80) {
      reasons.push(`Your farm (${crop.farmLocation}) is very close to their delivery location (${req.deliveryLocation})`)
    } else if (loc >= 60) {
      reasons.push(`Your farm (${crop.farmLocation}) is in the same region as delivery location (${req.deliveryLocation})`)
    } else {
      reasons.push(`Delivery from ${crop.farmLocation} to ${req.deliveryLocation} may require transport arrangement`)
    }
  }

  // Date
  if (req.requiredByDate && crop.expectedHarvestDate) {
    const harvest  = new Date(crop.expectedHarvestDate)
    const required = new Date(req.requiredByDate)
    const days     = Math.round((required - harvest) / (1000 * 60 * 60 * 24))
    if (days <= 7) {
      reasons.push(`Your harvest on ${harvest.toISOString().slice(0, 10)} is just-in-time for their deadline`)
    } else if (days <= 30) {
      reasons.push(`You harvest ${days} days before their deadline of ${required.toISOString().slice(0, 10)}`)
    } else {
      reasons.push(`Harvest on ${harvest.toISOString().slice(0, 10)} is well before their deadline — plan storage if needed`)
    }
  }

  // Buyer reliability
  if (buyerUser) {
    const verStatus = buyerUser.verification?.status || 'Not Verified'
    if (verStatus === 'Verified') {
      reasons.push('Buyer is platform-verified')
    } else if (verStatus === 'Pending') {
      reasons.push('Buyer verification is pending')
    } else {
      reasons.push('Buyer is not yet verified on platform')
    }
  }

  return { matchScore, factors: f, reasons }
}

// ── Main entry point ──────────────────────────────────────────────────────────
/**
 * findMatchesForFarmer(farmerId) → { success, matches[], summary, meta }
 */
async function findMatchesForFarmer(farmerId) {
  if (!farmerId) {
    return { success: false, message: 'farmerId is required', matches: [] }
  }

  // 1. Fetch farmer's available crops
  const crops = await Crop.find({ farmerId }).lean()
  const availableCrops = crops.filter(cropIsAvailable)

  if (availableCrops.length === 0) {
    return {
      success: true,
      matches: [],
      summary: { totalMatches: 0, highScoreMatches: 0, topCrop: null },
      meta: {
        farmerCrops:        crops.length,
        availableCrops:     0,
        activeRequirements: 0,
        message:            crops.length === 0
          ? 'No crops found. Add crops to see buyer matches.'
          : 'Your crops are not currently available for purchase (check crop status).',
      },
    }
  }

  // 2. Fetch ACTIVE buyer requirements that match any of the farmer's crop names
  const cropNames = [...new Set(availableCrops.map(c => c.cropName.toLowerCase()))]
  const rawReqs   = await BuyerRequirement.find({ status: 'ACTIVE' }).lean()
  const matchingReqs = rawReqs.filter(r =>
    cropNames.includes(r.cropName.trim().toLowerCase())
  )

  if (matchingReqs.length === 0) {
    return {
      success: true,
      matches: [],
      summary: { totalMatches: 0, highScoreMatches: 0, topCrop: null },
      meta: {
        farmerCrops:        crops.length,
        availableCrops:     availableCrops.length,
        activeRequirements: rawReqs.length,
        message:            'No active buyer requirements match your available crops right now.',
      },
    }
  }

  // 3. Fetch buyer user records for the requirements
  const buyerIds  = [...new Set(matchingReqs.map(r => r.buyerId?.toString()).filter(Boolean))]
  const buyers    = buyerIds.length > 0
    ? await User.find({ _id: { $in: buyerIds } })
        .select('name phone buyerInfo verification createdAt')
        .lean()
    : []
  const buyerMap  = Object.fromEntries(buyers.map(b => [b._id.toString(), b]))

  // 4. Score all eligible (crop, requirement) pairs
  const pairs = []

  for (const crop of availableCrops) {
    for (const req of matchingReqs) {
      if (!isEligiblePair(crop, req)) continue

      const buyer   = req.buyerId ? buyerMap[req.buyerId.toString()] : null
      const scoring = computeScore(crop, req, buyer)

      pairs.push({
        cropId:            crop._id.toString(),
        cropName:          crop.cropName,
        variety:           crop.variety || '',
        availableQty:      crop.availableQuantityKg,
        unit:              crop.unit,
        expectedPrice:     crop.expectedPricePerKg,
        qualityGrade:      crop.qualityGrade,
        farmLocation:      crop.farmLocation,
        cropStatus:        crop.status,
        expectedHarvestDate: crop.expectedHarvestDate,

        requirementId:     req._id.toString(),
        buyerId:           req.buyerId?.toString() || null,
        buyerName:         buyer?.name || req.cropName + ' Buyer',   // safe fallback
        buyerCompany:      buyer?.buyerInfo?.companyName || '',
        buyerContact:      buyer?.phone || '',
        buyerLocation:     buyer?.buyerInfo?.city
          ? `${buyer.buyerInfo.city}, ${buyer.buyerInfo.state || ''}`.replace(/, $/, '')
          : req.deliveryLocation || '',
        buyerVerification: buyer?.verification?.status || 'Not Verified',

        requiredQuantity:  req.quantity,
        requiredUnit:      req.unit,
        maxPricePerKg:     req.maxPricePerKg,
        minPricePerKg:     req.minPricePerKg,
        qualityRequired:   req.qualityGrade || 'Any',
        deliveryLocation:  req.deliveryLocation,
        requiredByDate:    req.requiredByDate,

        matchScore:   scoring.matchScore,
        factors:      scoring.factors,
        reasons:      scoring.reasons,
        urgency:      deriveUrgency(req.requiredByDate),
        deadline:     req.requiredByDate ? new Date(req.requiredByDate).toISOString().slice(0, 10) : null,
      })
    }
  }

  if (pairs.length === 0) {
    return {
      success: true,
      matches: [],
      summary: { totalMatches: 0, highScoreMatches: 0, topCrop: null },
      meta: {
        farmerCrops:        crops.length,
        availableCrops:     availableCrops.length,
        activeRequirements: matchingReqs.length,
        message:            'Your crops exist but no buyer requirements passed the eligibility filters (price, grade, date).',
      },
    }
  }

  // 5. Deduplicate: for each requirement keep only the best-scoring crop pairing
  const bestByReq = {}
  for (const p of pairs) {
    const key = p.requirementId
    if (!bestByReq[key] || p.matchScore > bestByReq[key].matchScore) {
      bestByReq[key] = p
    }
  }
  const deduped = Object.values(bestByReq)

  // 6. Sort descending by score, return top N
  deduped.sort((a, b) => b.matchScore - a.matchScore)
  const topMatches = deduped.slice(0, TOP_N)

  const highScoreMatches = topMatches.filter(m => m.matchScore >= 80).length
  const topCrop          = topMatches[0]?.cropName || null

  return {
    success:  true,
    isDemo:   false,
    matches:  topMatches,
    summary: {
      totalMatches:     topMatches.length,
      highScoreMatches,
      topCrop,
    },
    meta: {
      farmerCrops:        crops.length,
      availableCrops:     availableCrops.length,
      activeRequirements: matchingReqs.length,
      pairsEvaluated:     pairs.length,
      returned:           topMatches.length,
      weights:            WEIGHTS,
    },
  }
}

function deriveUrgency(requiredByDate) {
  if (!requiredByDate) return 'Low'
  const days = (new Date(requiredByDate) - Date.now()) / (1000 * 60 * 60 * 24)
  if (days <= 3)  return 'High'
  if (days <= 10) return 'Medium'
  return 'Low'
}

module.exports = { findMatchesForFarmer }
