const express = require('express')
const {
  getMandiPrices,
  getLiveTicker,
  getBenchmark,
  getOptions
} = require('../controllers/mandiController')

const router = express.Router()

// Ticker marquee endpoint
router.get('/ticker', getLiveTicker)

// Benchmark price advisor endpoint for crop creation & editing
router.get('/benchmark', getBenchmark)

// Filter options (commodities, states)
router.get('/options', getOptions)

// Mandi rates list (supports both GET and POST)
router.route('/prices')
  .get(getMandiPrices)
  .post(getMandiPrices)

module.exports = router
