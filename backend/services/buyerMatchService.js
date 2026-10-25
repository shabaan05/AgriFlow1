/**
 * buyerMatchService.js
 *
 * Rule-based Buyer–Farmer Matching Service.
 *
 * Flow:
 *   1. Hard eligibility filter  — reject clearly unsuitable crops immediately
 *   2. Weighted factor scoring  — deterministic 0–100 score per crop
 *   3. Rank by descending score — return top N with breakdown + reasons
 *
 * All scoring weights are defined in WEIGHTS below so they can be tuned
 * without touching any other file.
 *
 * No ML, no LLM, no external AI APIs — pure deterministic logic.
 */

'use strict'

const Crop = require('../models/Crop')
const User = require('../models/User')

// ─── Tunable weights (must sum to 100) ───────────────────────────────────────
const WEIGHTS = {
  price:       25,   // how well crop price fits buyer budget
  quality:     20,   // grade match
  quantity:    20,   // available qty vs required qty
  location:    15,   // farm location vs delivery location (text/region match)
  dateSuit:    10,   // harvest date suitability vs required-by date
  reliability: 10,   // farmer account age + verification proxy
}

// Statuses that mean a crop is actually purchasable right now
const AVAILABLE_STATUSES = new Set([
  'Harvest Ready',
  'Pre-Harvest',
  'Harvested',
])

// Grade order — higher index = higher grade tier
const GRADE_ORDER = { 'Grade A': 2, 'Grade B': 1, 'Grade C': 0 }

// Top N matches to return
const TOP_N = 5

// ─── Hard-filter ─────────────────────────────────────────────────────────────
/**
 * Returns true when the crop should be EXCLUDED from consideration.
 * Adding an exclusion rule here is the single place to tighten/relax filtering.
 */
function isIneligible(crop, req) {
  // 1. Crop name must match (case-insensitive, trimmed)
  if (crop.cropName.trim().toLowerCase() !== req.cropName.trim().toLowerCase()) {
    return true
  }

  // 2. Crop must be in an available status
  if (!AVAILABLE_STATUSES.has(crop.status)) {
    return true
  }

  // 3. Available quantity must be > 0
  if (!crop.availableQuantityKg || crop.availableQuantityKg <= 0) {
    return true
  }

  // 4. Hard maximum price constraint — if buyer states maxPricePerKg,
  //    exclude crops whose minimum acceptable price is already above that.
  if (
    req.maxPricePerKg != null &&
    crop.minimumAcceptablePrice > 0 &&
    crop.minimumAcceptablePrice > req.maxPricePerKg
  ) {
    return true
  }

  // 5. Hard quality constraint — if buyer requires Grade A, exclude Grade B/C.
  //    "Any" or blank means no hard constraint.
  if (req.qualityGrade && req.qualityGrade !== 'Any') {
    const buyerTier  = GRADE_ORDER[req.qualityGrade] ?? -1
    const cropTier   = GRADE_ORDER[crop.qualityGrade] ?? -1
    if (cropTier < buyerTier) {
      return true
    }
  }

  // 6. Hard date constraint — if buyer needs the crop by a date that has
  //    already passed (requiredByDate in the past), skip (no valid crop can
  //    satisfy it). Also skip crops whose harvest date is AFTER requiredByDate.
  if (req.requiredByDate) {
    const required = new Date(req.requiredByDate)
    const now      = new Date()

    if (required < now) {
      // Buyer requirement date is already past — cannot be satisfied
      return 'STALE_REQUIREMENT'   // special sentinel to abort whole search
    }

    // Crop won't be ready before the buyer needs it
    const harvest = new Date(crop.expectedHarvestDate)
    if (harvest > required) {
      return true
    }
  }

  return false
}

// ─── Individual factor scorers (each returns 0–100) ──────────────────────────

/**
 * Price score: full marks if crop's expectedPrice <= buyer's maxPricePerKg.
 * Linear decay down to 0 when price exceeds budget by 50 %.
 * If buyer has no maxPricePerKg constraint → neutral 50.
 */
function scorePrice(crop, req) {
  if (req.maxPricePerKg == null) return 50   // neutral — no constraint

  const price  = crop.expectedPricePerKg
  const budget = req.maxPricePerKg

  if (price <= budget) {
    // Under budget → score from 60 (exactly at budget) to 100 (very cheap)
    const gap    = (budget - price) / budget
    return Math.round(60 + 40 * Math.min(gap, 1))
  }

  // Over budget (but passed hard filter so minimumAcceptablePrice <= budget)
  // Linear decay: at budget → 60, at +50 % over → 0
  const over = (price - budget) / budget
  return Math.max(0, Math.round(60 * (1 - over / 0.5)))
}

/**
 * Quality score: exact match → 100.  one tier down → 60.  two tiers down → 20.
 * No buyer constraint → neutral 70.
 */
function scoreQuality(crop, req) {
  if (!req.qualityGrade || req.qualityGrade === 'Any') return 70

  const buyerTier = GRADE_ORDER[req.qualityGrade] ?? 0
  const cropTier  = GRADE_ORDER[crop.qualityGrade] ?? 0
  const diff      = cropTier - buyerTier

  if (diff >= 0) return 100    // meets or exceeds requirement
  if (diff === -1) return 60
  return 20
}

/**
 * Quantity score: crop's available qty vs required qty.
 * Fully covers requirement → 100.
 * Partial coverage → proportional (min 10).
 * Over-supply is also good (no penalty).
 */
function scoreQuantity(crop, req) {
  if (!req.quantity || req.quantity <= 0) return 50  // no constraint

  const ratio = crop.availableQuantityKg / req.quantity
  if (ratio >= 1) return 100
  // Partial: e.g. 80 % available → 90 score (scale 10–100)
  return Math.max(10, Math.round(10 + 90 * ratio))
}

/**
 * Location score: compares buyer's deliveryLocation and crop's farmLocation.
 * No ML — uses simple tokenised overlap (city/state keywords).
 * Same city → 100.  Same state → 60.  No match → 30 (neutral).
 * If either location is absent → 40 (neutral-ish).
 */
function scoreLocation(crop, req) {
  if (!req.deliveryLocation || !crop.farmLocation) return 40

  const normalize = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)

  const buyerTokens = normalize(req.deliveryLocation)
  const farmTokens  = normalize(crop.farmLocation)

  // Count how many tokens overlap
  const overlap = buyerTokens.filter(t => farmTokens.includes(t)).length

  if (overlap === 0) return 30
  if (overlap === 1) return 60
  return Math.min(100, 60 + overlap * 20)
}

/**
 * Date suitability score: how well the harvest date aligns with the buyer's
 * required-by date.
 *
 * Ideal: harvest is 0–7 days before required-by (fresh, just in time).
 * Acceptable: 8–30 days before (needs storage but manageable).
 * Risky: more than 30 days before (longer storage, freshness concern).
 * If no requiredByDate → neutral 60.
 */
function scoreDateSuit(crop, req) {
  if (!req.requiredByDate) return 60

  const harvest  = new Date(crop.expectedHarvestDate)
  const required = new Date(req.requiredByDate)
  const daysDiff = Math.round((required - harvest) / (1000 * 60 * 60 * 24))

  // daysDiff > 0 means harvest is before required date (good).
  // daysDiff < 0 would have been filtered in hard-filter.
  if (daysDiff <= 7)  return 100
  if (daysDiff <= 14) return 90
  if (daysDiff <= 30) return 70
  if (daysDiff <= 60) return 50
  return 30  // very early harvest — storage / freshness risk
}

/**
 * Farmer reliability score: proxy using available User data.
 * Uses account age and verification status — no fabricated fields.
 *
 * Scoring:
 *  - Verified farmer          → +60 pts
 *  - Pending verification     → +30 pts
 *  - Not Verified             → +10 pts
 *  - Account age bonus (up to +40 pts): 1 pt per 30 days, cap at 40.
 */
function scoreReliability(farmer) {
  if (!farmer) return 40   // default neutral if farmer data unavailable

  let score = 0

  // Verification status
  const verStatus = farmer.verification?.status || 'Not Verified'
  if (verStatus === 'Verified')     score += 60
  else if (verStatus === 'Pending') score += 30
  else                              score += 10

  // Account age
  const ageMs    = Date.now() - new Date(farmer.createdAt).getTime()
  const ageDays  = ageMs / (1000 * 60 * 60 * 24)
  const ageBonus = Math.min(40, Math.round(ageDays / 30))
  score += ageBonus

  return Math.min(100, score)
}

// ─── Composite scorer ────────────────────────────────────────────────────────
/**
 * Returns { matchScore, factors, reasons } for a single crop.
 * matchScore is 0–100.
 */
function computeScore(crop, farmer, req) {
  const f = {
    price:       scorePrice(crop, req),
    quality:     scoreQuality(crop, req),
    quantity:    scoreQuantity(crop, req),
    location:    scoreLocation(crop, req),
    dateSuit:    scoreDateSuit(crop, req),
    reliability: scoreReliability(farmer),
  }

  const matchScore = Math.round(
    (f.price       * WEIGHTS.price       +
     f.quality     * WEIGHTS.quality     +
     f.quantity    * WEIGHTS.quantity    +
     f.location    * WEIGHTS.location    +
     f.dateSuit    * WEIGHTS.dateSuit    +
     f.reliability * WEIGHTS.reliability) / 100
  )

  // ── Human-readable reasons ─────────────────────────────────────────────────
  const reasons = []

  // Price
  if (req.maxPricePerKg != null) {
    const diff = req.maxPricePerKg - crop.expectedPricePerKg
    if (diff >= 0) {
      reasons.push(`Price ₹${crop.expectedPricePerKg}/kg is within your budget of ₹${req.maxPricePerKg}/kg`)
    } else {
      reasons.push(`Price ₹${crop.expectedPricePerKg}/kg slightly exceeds budget but minimum is ₹${crop.minimumAcceptablePrice}/kg`)
    }
  } else {
    reasons.push(`Listed at ₹${crop.expectedPricePerKg}/kg (no budget constraint set)`)
  }

  // Quality
  if (!req.qualityGrade || req.qualityGrade === 'Any') {
    reasons.push(`Quality grade ${crop.qualityGrade} available`)
  } else if (crop.qualityGrade === req.qualityGrade) {
    reasons.push(`Exact quality match: ${crop.qualityGrade}`)
  } else {
    reasons.push(`Grade ${crop.qualityGrade} available (you requested ${req.qualityGrade})`)
  }

  // Quantity
  if (req.quantity > 0) {
    const pct = Math.round((crop.availableQuantityKg / req.quantity) * 100)
    if (pct >= 100) {
      reasons.push(`Fully covers your requirement — ${crop.availableQuantityKg} kg available, ${req.quantity} kg needed`)
    } else {
      reasons.push(`Partial supply — ${crop.availableQuantityKg} kg available (${pct}% of required ${req.quantity} kg)`)
    }
  }

  // Location
  if (req.deliveryLocation && crop.farmLocation) {
    if (f.location >= 80) {
      reasons.push(`Farm in ${crop.farmLocation} is close to your delivery location (${req.deliveryLocation})`)
    } else if (f.location >= 60) {
      reasons.push(`Farm in ${crop.farmLocation} — same region as ${req.deliveryLocation}`)
    } else {
      reasons.push(`Farm in ${crop.farmLocation} — delivery to ${req.deliveryLocation} may require transport arrangement`)
    }
  }

  // Harvest date
  if (req.requiredByDate) {
    const harvest  = new Date(crop.expectedHarvestDate)
    const required = new Date(req.requiredByDate)
    const days     = Math.round((required - harvest) / (1000 * 60 * 60 * 24))
    if (days <= 7) {
      reasons.push(`Harvest date ${harvest.toISOString().slice(0, 10)} is just-in-time for your deadline`)
    } else if (days <= 30) {
      reasons.push(`Harvest date ${harvest.toISOString().slice(0, 10)} gives ${days} days before your deadline`)
    } else {
      reasons.push(`Harvest date ${harvest.toISOString().slice(0, 10)} is ${days} days before your deadline — plan storage`)
    }
  }

  // Reliability
  const verStatus = farmer?.verification?.status || 'Not Verified'
  if (verStatus === 'Verified') {
    reasons.push('Farmer is platform-verified')
  } else if (verStatus === 'Pending') {
    reasons.push('Farmer verification is pending')
  } else {
    reasons.push('Farmer not yet verified on platform')
  }

  return { matchScore, factors: f, reasons }
}

// ─── Main entry point ─────────────────────────────────────────────────────────
/**
 * findMatches(criteriaObj) → { success, matches[], meta }
 *
 * criteriaObj shape (all optional except cropName):
 * {
 *   cropName        : string  (required)
 *   quantity        : number  (kg)
 *   maxPricePerKg   : number
 *   qualityGrade    : string  ('Grade A' | 'Grade B' | 'Grade C' | 'Any')
 *   requiredByDate  : string  (ISO date)
 *   deliveryLocation: string
 * }
 */
async function findMatches(criteria) {
  const req = {
    cropName:         (criteria.cropName || '').trim(),
    quantity:         Number(criteria.quantity)         || 0,
    maxPricePerKg:    criteria.maxPricePerKg  != null ? Number(criteria.maxPricePerKg)  : null,
    qualityGrade:     criteria.qualityGrade   || '',
    requiredByDate:   criteria.requiredByDate || null,
    deliveryLocation: (criteria.deliveryLocation || '').trim(),
  }

  // Validate required field
  if (!req.cropName) {
    return { success: false, message: 'cropName is required', matches: [] }
  }

  // ── Fetch all crops whose name case-insensitively matches ─────────────────
  // We do a broad DB fetch (case-insensitive regex on cropName) then apply
  // fine-grained hard filters in JS. This avoids building a complex Mongo
  // query that would need to duplicate JS filter logic.
  const nameRegex = new RegExp(`^${escapeRegex(req.cropName)}$`, 'i')
  const rawCrops  = await Crop.find({ cropName: nameRegex }).lean()

  if (rawCrops.length === 0) {
    return {
      success:  true,
      matches:  [],
      meta:     { total: 0, filtered: 0, cropName: req.cropName },
      message:  `No crops found for "${req.cropName}"`,
    }
  }

  // ── Hard filter ───────────────────────────────────────────────────────────
  const eligible = []
  let staleRequirement = false

  for (const crop of rawCrops) {
    const check = isIneligible(crop, req)
    if (check === 'STALE_REQUIREMENT') {
      staleRequirement = true
      break
    }
    if (!check) {
      eligible.push(crop)
    }
  }

  if (staleRequirement) {
    return {
      success:  false,
      matches:  [],
      message:  'The required-by date is in the past — please update your requirement',
    }
  }

  if (eligible.length === 0) {
    return {
      success:  true,
      matches:  [],
      meta:     { total: rawCrops.length, filtered: 0, cropName: req.cropName },
      message:  `No eligible crops found for "${req.cropName}" matching your constraints`,
    }
  }

  // ── Fetch farmer user records for reliability scoring ─────────────────────
  const farmerIds = [...new Set(eligible.map(c => c.farmerId).filter(Boolean))]
  const farmers   = farmerIds.length > 0
    ? await User.find({ _id: { $in: farmerIds } }).select('name verification createdAt farmInfo').lean()
    : []

  const farmerMap = Object.fromEntries(farmers.map(f => [f._id.toString(), f]))

  // ── Score + rank ──────────────────────────────────────────────────────────
  const scored = eligible.map(crop => {
    const farmer  = crop.farmerId ? farmerMap[crop.farmerId.toString()] : null
    const scoring = computeScore(crop, farmer, req)

    return {
      cropId:              crop._id.toString(),
      cropName:            crop.cropName,
      variety:             crop.variety || '',
      category:            crop.category,
      availableQuantityKg: crop.availableQuantityKg,
      unit:                crop.unit,
      expectedHarvestDate: crop.expectedHarvestDate,
      expectedPricePerKg:  crop.expectedPricePerKg,
      minimumPrice:        crop.minimumAcceptablePrice,
      qualityGrade:        crop.qualityGrade,
      farmLocation:        crop.farmLocation,
      status:              crop.status,
      farmerId:            crop.farmerId ? crop.farmerId.toString() : null,
      farmerName:          farmer?.name || null,
      farmerVerification:  farmer?.verification?.status || 'Not Verified',
      farmName:            farmer?.farmInfo?.farmName   || null,
      matchScore:          scoring.matchScore,
      factors:             scoring.factors,
      reasons:             scoring.reasons,
    }
  })

  scored.sort((a, b) => b.matchScore - a.matchScore)
  const topMatches = scored.slice(0, TOP_N)

  return {
    success: true,
    matches: topMatches,
    meta: {
      total:    rawCrops.length,
      filtered: eligible.length,
      returned: topMatches.length,
      cropName: req.cropName,
      weights:  WEIGHTS,
    },
  }
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

module.exports = { findMatches }
