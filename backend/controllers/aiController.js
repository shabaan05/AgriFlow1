const buyerMatchAgent       = require('../agents/buyerMatchAgent')
const harvestPlannerAgent   = require('../agents/harvestPlannerAgent')
const shelfLifeAgent        = require('../agents/shelfLifeAgent')
const wastagePreventionAgent = require('../agents/wastagePreventionAgent')

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

module.exports = {
  getAISummary,
  getBuyerMatches,
  getHarvestPlan,
  getShelfLife,
  getWastagePrevention,
}
