/**
 * Harvest Planner Agent
 *
 * CURRENT STATE: Returns structured mock harvest schedule recommendations.
 * FUTURE STATE:  Replace run() body with real logic:
 *   1. Fetch farmer's crops with status Pre-Harvest / Booked
 *   2. Cross-reference with active buyer bookings and demand signals
 *   3. Factor in: weather forecasts (external API), market price trend,
 *      shelf life of each crop, transport lead times
 *   4. Compute optimal harvest window per crop
 *   5. Rank by urgency (crops approaching deadline or spoilage risk first)
 */

function run(farmerId) {
  return {
    agentId:   'harvest-planner',
    agentName: 'Harvest Planner',
    runAt:     new Date().toISOString(),
    isDemo:    true,
    summary: {
      upcomingHarvests: 3,
      urgentHarvests:   1,
      nextHarvestDate:  '2026-10-25',
    },
    recommendations: [
      {
        id:                   'hp-001',
        cropName:             'Tomato',
        variety:              'Hybrid Roma',
        currentStatus:        'Pre-Harvest',
        expectedHarvestDate:  '2026-10-25',
        recommendedHarvestDate: '2026-10-25',
        availableQty:         800,
        unit:                 'kg',
        urgency:              'High',
        daysUntilHarvest:     4,
        linkedBookings:       1,
        linkedBuyers:         2,
        recommendation: 'Harvest on schedule — FreshMart has confirmed pickup on Oct 26. Delaying beyond Oct 27 risks shelf-life loss.',
        actions: ['Confirm harvest date with transporter', 'Notify FreshMart of harvest confirmation'],
      },
      {
        id:                   'hp-002',
        cropName:             'Onion',
        variety:              'Nasik Red',
        currentStatus:        'Harvest Ready',
        expectedHarvestDate:  '2026-10-27',
        recommendedHarvestDate: '2026-10-26',
        availableQty:         500,
        unit:                 'kg',
        urgency:              'Medium',
        daysUntilHarvest:     5,
        linkedBookings:       0,
        linkedBuyers:         1,
        recommendation: 'Harvest one day early — Metro Wholesale requires delivery by Oct 28. Harvesting Oct 26 gives adequate curing time.',
        actions: ['Harvest on Oct 26', 'Begin dry curing process immediately'],
      },
      {
        id:                   'hp-003',
        cropName:             'Wheat',
        variety:              'GW-496',
        currentStatus:        'Booked',
        expectedHarvestDate:  '2026-11-10',
        recommendedHarvestDate: '2026-11-10',
        availableQty:         1200,
        unit:                 'kg',
        urgency:              'Low',
        daysUntilHarvest:     20,
        linkedBookings:       1,
        linkedBuyers:         1,
        recommendation: 'Harvest on planned date — no market pressure to advance. Ensure dry storage is prepared in advance.',
        actions: ['Prepare dry storage facility', 'Confirm delivery date with Sunrise Flour Mills'],
      },
    ],
  }
}

module.exports = { run }
