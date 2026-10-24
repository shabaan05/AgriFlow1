/**
 * Buyer Match Agent
 *
 * CURRENT STATE: Returns structured mock recommendations.
 * FUTURE STATE:  Replace run() body with real logic:
 *   1. Fetch farmer's active crops from Crop model
 *   2. Fetch active buyer requirements from Demand model
 *   3. Score each (crop, buyer) pair using:
 *      - Location proximity (haversine / region match)
 *      - Quantity overlap
 *      - Price compatibility (expectedPrice vs minPrice)
 *      - Quality grade match
 *      - Deadline urgency
 *   4. Rank and return top N matches with matchScore 0–100
 */

function run(farmerId) {
  return {
    agentId:    'buyer-match',
    agentName:  'Buyer Match Agent',
    runAt:      new Date().toISOString(),
    isDemo:     true,
    summary: {
      totalMatches:    5,
      highScoreMatches: 2,
      topCrop:         'Tomato',
    },
    recommendations: [
      {
        id:            'bm-001',
        cropName:      'Tomato',
        variety:       'Hybrid Roma',
        quantity:      800,
        unit:          'kg',
        buyerName:     'FreshMart Pvt Ltd',
        buyerContact:  'Vikram Nair',
        location:      'Pune, Maharashtra',
        expectedPrice: 30,
        matchScore:    92,
        matchReasons: [
          'Crop grade matches buyer requirement (Grade A)',
          'Location within 50 km of buyer pickup point',
          'Quantity fully satisfies buyer order',
          'Price above your minimum acceptable price',
        ],
        urgency: 'High',
        deadline: '2026-11-05',
      },
      {
        id:            'bm-002',
        cropName:      'Tomato',
        variety:       'Hybrid Roma',
        quantity:      400,
        unit:          'kg',
        buyerName:     'GreenBasket Co.',
        buyerContact:  'Priya Shah',
        location:      'Nashik, Maharashtra',
        expectedPrice: 28,
        matchScore:    81,
        matchReasons: [
          'Same city as your farm location',
          'Partial quantity match — buyer needs 500 kg',
          'Price meets minimum acceptable threshold',
        ],
        urgency: 'Medium',
        deadline: '2026-11-03',
      },
      {
        id:            'bm-003',
        cropName:      'Onion',
        variety:       'Nasik Red',
        quantity:      500,
        unit:          'kg',
        buyerName:     'Metro Wholesale',
        buyerContact:  'Anand Joshi',
        location:      'Mumbai, Maharashtra',
        expectedPrice: 22,
        matchScore:    74,
        matchReasons: [
          'High-volume buyer — stable repeat orders',
          'Grade B accepted by buyer',
          'Distance 170 km — pickup can be arranged',
        ],
        urgency: 'Medium',
        deadline: '2026-11-10',
      },
      {
        id:            'bm-004',
        cropName:      'Mango',
        variety:       'Alphonso',
        quantity:      300,
        unit:          'kg',
        buyerName:     'ExportFresh India',
        buyerContact:  'Kiran Mehta',
        location:      'Mumbai Port, Maharashtra',
        expectedPrice: 125,
        matchScore:    88,
        matchReasons: [
          'GI-tagged Alphonso export match',
          'Price significantly above minimum',
          'Export buyer — premium pricing guaranteed',
        ],
        urgency: 'High',
        deadline: '2026-11-22',
      },
      {
        id:            'bm-005',
        cropName:      'Wheat',
        variety:       'GW-496',
        quantity:      900,
        unit:          'kg',
        buyerName:     'Sunrise Flour Mills',
        buyerContact:  'Ramesh Kulkarni',
        location:      'Aurangabad, Maharashtra',
        expectedPrice: 19,
        matchScore:    67,
        matchReasons: [
          'Milling-grade wheat matches your Grade B stock',
          'Large order covers most of available quantity',
          'Price slightly above minimum acceptable',
        ],
        urgency: 'Low',
        deadline: '2026-11-20',
      },
    ],
  }
}

module.exports = { run }
