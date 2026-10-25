const buyerMatchAgent         = require('../agents/buyerMatchAgent')
const harvestPlannerAgent     = require('../agents/harvestPlannerAgent')
const shelfLifeAgent          = require('../agents/shelfLifeAgent')
const wastagePreventionAgent  = require('../agents/wastagePreventionAgent')
const buyerMatchService       = require('../services/buyerMatchService')
const demandForecastService   = require('../services/demandForecastService')

/**
 * GET /api/ai/summary
 * Returns a summary card for each agent — used by the AI Centre dashboard.
 */
async function getAISummary(req, res) {
  try {
    const farmerId = req.user?.id || 'demo'
    const [bm, hp, sl, wp] = [
      buyerMatchAgent.run(farmerId),
      harvestPlannerAgent.run(farmerId),
      shelfLifeAgent.run(farmerId),
      wastagePreventionAgent.run(farmerId),
    ]
    res.json({
      isDemo: true,
      agents: [
        {
          id:          'buyer-match',
          name:        'Buyer Match Agent',
          icon:        'match',
          status:      'active',
          insight:     `${bm.summary.totalMatches} buyer matches found for your crops`,
          metric:      bm.summary.totalMatches,
          metricLabel: 'matches',
          route:       '/farmer/ai/buyer-matches',
        },
        {
          id:          'harvest-planner',
          name:        'Harvest Planner',
          icon:        'harvest',
          status:      'active',
          insight:     `${hp.summary.urgentHarvests} urgent harvest${hp.summary.urgentHarvests !== 1 ? 's' : ''} this week`,
          metric:      hp.summary.upcomingHarvests,
          metricLabel: 'upcoming',
          route:       '/farmer/ai/harvest-planner',
        },
        {
          id:          'shelf-life',
          name:        'Shelf-Life Monitor',
          icon:        'shelf',
          status:      sl.summary.critical > 0 ? 'alert' : 'active',
          insight:     sl.summary.critical > 0
            ? `${sl.summary.critical} crop(s) at critical freshness risk`
            : `All ${sl.summary.totalMonitored} monitored crops are Fresh or stable`,
          metric:      sl.summary.critical,
          metricLabel: 'critical',
          route:       '/farmer/ai/shelf-life',
        },
        {
          id:          'wastage-prevention',
          name:        'Wastage Prevention',
          icon:        'wastage',
          status:      wp.summary.atRiskCrops > 0 ? 'alert' : 'active',
          insight:     `${wp.summary.atRiskCrops} crop${wp.summary.atRiskCrops !== 1 ? 's' : ''} at risk — potential loss ${wp.summary.potentialRevenueLoss}`,
          metric:      wp.summary.atRiskCrops,
          metricLabel: 'at risk',
          route:       '/farmer/ai/wastage-prevention',
        },
      ],
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to load AI summary', error: err.message })
  }
}

/** GET /api/ai/buyer-matches */
async function getBuyerMatches(req, res) {
  try {
    res.json(buyerMatchAgent.run(req.user?.id || 'demo'))
  } catch (err) {
    res.status(500).json({ message: 'Buyer Match Agent error', error: err.message })
  }
}

/** GET /api/ai/harvest-planner */
async function getHarvestPlan(req, res) {
  try {
    res.json(harvestPlannerAgent.run(req.user?.id || 'demo'))
  } catch (err) {
    res.status(500).json({ message: 'Harvest Planner Agent error', error: err.message })
  }
}

/** GET /api/ai/shelf-life */
async function getShelfLife(req, res) {
  try {
    res.json(shelfLifeAgent.run(req.user?.id || 'demo'))
  } catch (err) {
    res.status(500).json({ message: 'Shelf-Life Agent error', error: err.message })
  }
}

/** GET /api/ai/wastage-prevention */
async function getWastagePrevention(req, res) {
  try {
    res.json(wastagePreventionAgent.run(req.user?.id || 'demo'))
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
