/**
 * Wastage Prevention Agent
 *
 * CURRENT STATE: Returns structured mock at-risk crop analysis.
 * FUTURE STATE:  Replace run() body with real logic:
 *   1. Combine Shelf-Life Agent output with unsold crop inventory
 *   2. Score wastage risk using: shelf life remaining, availableQty > 0,
 *      no confirmed buyer, days until expiry, demand signal availability
 *   3. Generate context-aware actions per crop:
 *      - Find nearby buyers from Demand model
 *      - Suggest price reduction if minPrice allows headroom
 *      - Trigger transport booking if buyer exists
 *      - Suggest local market / mandi listing
 *   4. Calculate potential revenue loss from wastage
 */

function run(farmerId) {
  return {
    agentId:   'wastage-prevention',
    agentName: 'Wastage Prevention Agent',
    runAt:     new Date().toISOString(),
    isDemo:    true,
    summary: {
      atRiskCrops:       2,
      potentialWastageKg: 800,
      potentialRevenueLoss: '₹22,400',
    },
    alerts: [
      {
        id:               'wp-001',
        cropName:         'Tomato',
        variety:          'Hybrid Roma',
        availableQty:     800,
        unit:             'kg',
        riskLevel:        'High',
        riskReasons: [
          'Shelf life only 7 days after harvest',
          'Harvest due in 4 days — no confirmed buyer for full quantity',
          'High market demand exists in Kolhapur at ₹28–34/kg',
        ],
        potentialWastageKg: 150,
        potentialRevenueLoss: '₹4,500',
        expectedPrice:    28,
        recommendedActions: [
          { action: 'Find Buyer',       label: 'Find Buyer',        priority: 1 },
          { action: 'Prioritize Pickup', label: 'Prioritize Pickup', priority: 2 },
          { action: 'Offer Discount',   label: 'Offer Discount',    priority: 3 },
        ],
        urgency: 'Act within 3 days',
      },
      {
        id:               'wp-002',
        cropName:         'Onion',
        variety:          'Nasik Red',
        availableQty:     500,
        unit:             'kg',
        riskLevel:        'Medium',
        riskReasons: [
          '21-day shelf life — harvest in 5 days',
          'Only 1 buyer identified so far, partial order (50% of qty)',
          'Remaining 250 kg has no buyer yet',
        ],
        potentialWastageKg: 250,
        potentialRevenueLoss: '₹5,500',
        expectedPrice:    22,
        recommendedActions: [
          { action: 'Find Buyer',    label: 'Find Buyer',     priority: 1 },
          { action: 'Sell Locally',  label: 'Sell Locally',   priority: 2 },
          { action: 'Offer Discount',label: 'Offer Discount', priority: 3 },
        ],
        urgency: 'Act within 7 days',
      },
    ],
  }
}

module.exports = { run }
