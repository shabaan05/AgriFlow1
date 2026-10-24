/**
 * Shelf-Life Monitor Agent
 *
 * CURRENT STATE: Returns structured mock freshness monitoring data.
 * FUTURE STATE:  Replace run() body with real logic:
 *   1. Fetch harvested/stored crops from Crop model
 *   2. Calculate elapsed days since harvestDate
 *   3. Compare against crop.expectedShelfLife
 *   4. Factor in: storage temperature (IoT sensor feed in future),
 *      humidity, variety-specific decay curves (ML model)
 *   5. Assign freshness status and remaining shelf life estimate
 *   6. Trigger alerts for Critical items
 */

const FRESHNESS_THRESHOLDS = {
  // Days remaining → status
  fresh:     0.5,   // > 50% shelf life remaining = Fresh
  attention: 0.25,  // 25–50% = Attention
  critical:  0,     // < 25% = Critical
}

function run(farmerId) {
  return {
    agentId:   'shelf-life',
    agentName: 'Shelf-Life Monitor',
    runAt:     new Date().toISOString(),
    isDemo:    true,
    summary: {
      totalMonitored: 4,
      fresh:          2,
      attention:      1,
      critical:       1,
    },
    items: [
      {
        id:               'sl-001',
        cropName:         'Turmeric',
        variety:          'Erode Local',
        quantity:         200,
        unit:             'kg',
        harvestDate:      '2026-10-15',
        shelfLifeDays:    365,
        elapsedDays:      6,
        remainingDays:    359,
        freshnessStatus:  'Fresh',
        riskLevel:        'Low',
        storageLocation:  'Sangli, Maharashtra',
        recommendedAction: 'Continue monitoring. Current storage conditions adequate.',
      },
      {
        id:               'sl-002',
        cropName:         'Wheat',
        variety:          'GW-496',
        quantity:         900,
        unit:             'kg',
        harvestDate:      null,
        shelfLifeDays:    180,
        elapsedDays:      0,
        remainingDays:    180,
        freshnessStatus:  'Fresh',
        riskLevel:        'Low',
        storageLocation:  'Pune, Maharashtra',
        recommendedAction: 'Not yet harvested. Ensure dry storage is prepared.',
      },
      {
        id:               'sl-003',
        cropName:         'Tomato',
        variety:          'Hybrid Roma',
        quantity:         800,
        unit:             'kg',
        harvestDate:      null,
        shelfLifeDays:    7,
        elapsedDays:      0,
        remainingDays:    7,
        freshnessStatus:  'Attention',
        riskLevel:        'Medium',
        storageLocation:  'Nashik, Maharashtra',
        recommendedAction: 'Tomatoes have very short shelf life (7 days). Ensure harvest is tied to confirmed buyer pickup. Do not delay harvest beyond Oct 27.',
      },
      {
        id:               'sl-004',
        cropName:         'Soybean',
        variety:          'JS-335',
        quantity:         600,
        unit:             'kg',
        harvestDate:      '2026-10-05',
        shelfLifeDays:    120,
        elapsedDays:      16,
        remainingDays:    104,
        freshnessStatus:  'Fresh',
        riskLevel:        'Low',
        storageLocation:  'Amravati, Maharashtra',
        recommendedAction: 'Good shelf life remaining. Seek buyer before December.',
      },
    ],
  }
}

module.exports = { run }
