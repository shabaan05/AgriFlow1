const buyerMatchAgent           = require('../agents/buyerMatchAgent')
const harvestPlannerAgent       = require('../agents/harvestPlannerAgent')
const shelfLifeAgent            = require('../agents/shelfLifeAgent')
const wastagePreventionAgent    = require('../agents/wastagePreventionAgent')
const buyerMatchService         = require('../services/buyerMatchService')
const demandForecastService     = require('../services/demandForecastService')
const farmerBuyerMatchService   = require('../services/farmerBuyerMatchService')
const harvestPlannerService     = require('../services/harvestPlannerService')
const shelfLifeService          = require('../services/shelfLifeService')
const wastagePreventionService  = require('../services/wastagePreventionService')

/**
 * GET /api/ai/summary
 * Returns a summary card for each agent — used by the AI Centre dashboard.
 * All 4 agents now use real database data (no demo data).
 */
async function getAISummary(req, res) {
  try {
    const farmerId = req.user?.id || req.user?._id?.toString()

    // Real buyer match data
    let bmSummary = { totalMatches: 0, highScoreMatches: 0, topCrop: null }
    let bmInsight = 'No matching buyer requirements found for your crops'
    try {
      const bmResult = await farmerBuyerMatchService.findMatchesForFarmer(farmerId)
      if (bmResult.success && bmResult.summary) {
        bmSummary = bmResult.summary
        if (bmSummary.totalMatches > 0) {
          bmInsight = `${bmSummary.totalMatches} buyer match${bmSummary.totalMatches > 1 ? 'es' : ''} found for your crops`
        }
      }
    } catch (_) { /* fall back silently */ }

    // Real harvest planner data
    let hpSummary = { upcomingHarvests: 0, urgentHarvests: 0, nextHarvestDate: null }
    let hpInsight = 'No upcoming harvests found'
    try {
      const hpResult = await harvestPlannerService.planHarvest(farmerId)
      if (hpResult.success && hpResult.summary) {
        hpSummary = hpResult.summary
        hpInsight = hpSummary.urgentHarvests > 0
          ? `${hpSummary.urgentHarvests} urgent harvest${hpSummary.urgentHarvests !== 1 ? 's' : ''} need attention`
          : hpSummary.upcomingHarvests > 0
            ? `${hpSummary.upcomingHarvests} upcoming harvest${hpSummary.upcomingHarvests !== 1 ? 's' : ''} scheduled`
            : 'No upcoming harvests found'
      }
    } catch (_) { /* fall back silently */ }

    // Real shelf-life data
    let slSummary = { totalMonitored: 0, fresh: 0, attention: 0, critical: 0 }
    let slInsight = 'No harvested crops to monitor'
    let slStatus  = 'active'
    try {
      const slResult = await shelfLifeService.monitorShelfLife(farmerId)
      if (slResult.success && slResult.summary) {
        slSummary = slResult.summary
        if (slSummary.critical > 0) {
          slInsight = `${slSummary.critical} crop${slSummary.critical > 1 ? 's' : ''} at critical freshness risk`
          slStatus  = 'alert'
        } else if (slSummary.attention > 0) {
          slInsight = `${slSummary.attention} crop${slSummary.attention > 1 ? 's' : ''} need attention`
        } else if (slSummary.totalMonitored > 0) {
          slInsight = `All ${slSummary.totalMonitored} monitored crop${slSummary.totalMonitored > 1 ? 's' : ''} are Fresh or stable`
        }
      }
    } catch (_) { /* fall back silently */ }

    // Real wastage prevention data
    let wpSummary = { atRiskCrops: 0, potentialWastageKg: 0, potentialRevenueLoss: '₹0' }
    let wpInsight = 'No crops at risk of wastage'
    let wpStatus  = 'active'
    try {
      const wpResult = await wastagePreventionService.detectWastageRisks(farmerId)
      if (wpResult.success && wpResult.summary) {
        wpSummary = wpResult.summary
        if (wpSummary.atRiskCrops > 0) {
          wpInsight = `${wpSummary.atRiskCrops} crop${wpSummary.atRiskCrops > 1 ? 's' : ''} at risk — potential loss ${wpSummary.potentialRevenueLoss}`
          wpStatus  = 'alert'
        }
      }
    } catch (_) { /* fall back silently */ }

    res.json({
      isDemo: false,  // all 4 agents now use real data
      agents: [
        {
          id:          'buyer-match',
          name:        'Buyer Match Agent',
          icon:        'match',
          status:      'active',
          insight:     bmInsight,
          metric:      bmSummary.totalMatches,
          metricLabel: 'matches',
          route:       '/farmer/ai/buyer-matches',
          isDemo:      false,
        },
        {
          id:          'harvest-planner',
          name:        'Harvest Planner',
          icon:        'harvest',
          status:      hpSummary.urgentHarvests > 0 ? 'alert' : 'active',
          insight:     hpInsight,
          metric:      hpSummary.upcomingHarvests,
          metricLabel: 'upcoming',
          route:       '/farmer/ai/harvest-planner',
          isDemo:      false,
        },
        {
          id:          'shelf-life',
          name:        'Shelf-Life Monitor',
          icon:        'shelf',
          status:      slStatus,
          insight:     slInsight,
          metric:      slSummary.critical,
          metricLabel: 'critical',
          route:       '/farmer/ai/shelf-life',
          isDemo:      false,
        },
        {
          id:          'wastage-prevention',
          name:        'Wastage Prevention',
          icon:        'wastage',
          status:      wpStatus,
          insight:     wpInsight,
          metric:      wpSummary.atRiskCrops,
          metricLabel: 'at risk',
          route:       '/farmer/ai/wastage-prevention',
          isDemo:      false,
        },
      ],
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load AI summary', error: err.message })
  }
}

/**
 * GET /api/ai/buyer-matches
 * Returns real buyer match results for the authenticated farmer.
 * No longer uses the demo agent.
 */
async function getBuyerMatches(req, res) {
  try {
    // Allow farmers only
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Access denied — farmers only' })
    }

    const farmerId = req.user._id?.toString() || req.user.id
    const result   = await farmerBuyerMatchService.findMatchesForFarmer(farmerId)

    return res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Buyer Match Agent error', error: err.message })
  }
}

/** GET /api/ai/harvest-planner — real data */
async function getHarvestPlan(req, res) {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Access denied — farmers only' })
    }
    const farmerId = req.user._id?.toString() || req.user.id
    const result   = await harvestPlannerService.planHarvest(farmerId)
    return res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Harvest Planner Agent error', error: err.message })
  }
}

/** GET /api/ai/shelf-life — real data */
async function getShelfLife(req, res) {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Access denied — farmers only' })
    }
    const farmerId = req.user._id?.toString() || req.user.id
    const result   = await shelfLifeService.monitorShelfLife(farmerId)
    return res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Shelf-Life Agent error', error: err.message })
  }
}

/** GET /api/ai/wastage-prevention — real data */
async function getWastagePrevention(req, res) {
  try {
    if (req.user.role !== 'farmer') {
      return res.status(403).json({ success: false, message: 'Access denied — farmers only' })
    }
    const farmerId = req.user._id?.toString() || req.user.id
    const result   = await wastagePreventionService.detectWastageRisks(farmerId)
    return res.json(result)
  } catch (err) {
    res.status(500).json({ message: 'Wastage Prevention Agent error', error: err.message })
  }
}

/**
 * POST /api/ai/buyer-match
 *
 * Buyer-facing explainable matching endpoint.
 * Accepts buyer requirement criteria and returns ranked farmer crops with
 * per-factor scores and human-readable reasons.
 *
 * Only authenticated buyers should call this endpoint
 * (enforced via protect + role check in the route).
 *
 * Request body:
 *   cropName        string  (required)
 *   quantity        number  kg (optional)
 *   maxPricePerKg   number  (optional)
 *   qualityGrade    string  'Grade A'|'Grade B'|'Grade C'|'Any' (optional)
 *   requiredByDate  string  ISO date (optional)
 *   deliveryLocation string (optional)
 */
async function postBuyerMatch(req, res) {
  try {
    // Role guard — only buyers may use this endpoint
    if (req.user.role !== 'buyer') {
      return res.status(403).json({ success: false, message: 'Access denied — buyers only' })
    }

    const { cropName, quantity, maxPricePerKg, qualityGrade, requiredByDate, deliveryLocation } = req.body

    if (!cropName || typeof cropName !== 'string' || !cropName.trim()) {
      return res.status(400).json({ success: false, message: 'cropName is required' })
    }

    const result = await buyerMatchService.findMatches({
      cropName,
      quantity,
      maxPricePerKg,
      qualityGrade,
      requiredByDate,
      deliveryLocation,
    })

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.json(result)
  } catch (err) {
    console.error('[buyer-match]', err)
    res.status(500).json({ success: false, message: 'Buyer match error', error: err.message })
  }
}

/**
 * POST /api/ai/demand-forecast
 *
 * Demand forecast endpoint — available to both farmers and buyers.
 * Farmers: plan crop production based on expected future demand.
 * Buyers:  understand procurement trends and plan purchasing.
 * Uses existing Order, Booking, BuyerRequirement, and Demand data.
 *
 * Request body:
 *   cropName       string  (required)
 *   forecastPeriod string  '1 month' | '3 months' | '6 months' | '12 months'
 *                          Accepts numeric string or "N months" format.
 */
async function postDemandForecast(req, res) {
  try {
    // Role guard — farmers and buyers may use this endpoint (demand data is relevant for both)
    if (!['farmer', 'buyer'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied — farmers and buyers only' })
    }

    const { cropName, forecastPeriod } = req.body

    if (!cropName || typeof cropName !== 'string' || !cropName.trim()) {
      return res.status(400).json({ success: false, message: 'cropName is required' })
    }

    // Parse forecastPeriod: accept '3 months', '3', 3, etc.
    let forecastMonths = 3
    if (forecastPeriod !== undefined && forecastPeriod !== null) {
      const parsed = parseInt(String(forecastPeriod), 10)
      if (!isNaN(parsed) && parsed > 0 && parsed <= 12) {
        forecastMonths = parsed
      }
    }

    const result = await demandForecastService.generateForecast({ cropName, forecastMonths })

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.json(result)
  } catch (err) {
    console.error('[demand-forecast]', err)
    res.status(500).json({ success: false, message: 'Demand forecast error', error: err.message })
  }
}

module.exports = {
  getAISummary,
  getBuyerMatches,
  getHarvestPlan,
  getShelfLife,
  getWastagePrevention,
  postBuyerMatch,
  postDemandForecast,
}
