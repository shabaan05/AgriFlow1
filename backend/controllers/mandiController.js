const mandiService = require('../services/mandiService')

// @desc    Get Mandi prices with filters
// @route   GET /api/mandi/prices or POST /api/mandi/prices
// @access  Public
exports.getMandiPrices = async (req, res) => {
  try {
    const filters = {
      state: req.query.state || req.body.state || '',
      district: req.query.district || req.body.district || '',
      market: req.query.market || req.body.market || '',
      commodity: req.query.commodity || req.body.commodity || '',
      grade: req.query.grade || req.body.grade || ''
    }

    const data = await mandiService.fetchMandiPrices(filters)
    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('getMandiPrices error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch Mandi prices' })
  }
}

// @desc    Get live ticker prices
// @route   GET /api/mandi/ticker
// @access  Public
exports.getLiveTicker = async (_req, res) => {
  try {
    const data = await mandiService.fetchLiveTicker()
    res.json({
      success: true,
      count: data.length,
      data
    })
  } catch (error) {
    console.error('getLiveTicker error:', error)
    res.status(500).json({ success: false, message: 'Failed to fetch live ticker' })
  }
}

// @desc    Get intelligent benchmark for CropForm
// @route   GET /api/mandi/benchmark
// @access  Public
exports.getBenchmark = async (req, res) => {
  try {
    const { commodity, location } = req.query
    if (!commodity) {
      return res.status(400).json({ success: false, message: 'Commodity name is required' })
    }

    const benchmark = await mandiService.getCropPricingBenchmark({
      rawCommodity: commodity,
      rawLocation: location || ''
    })

    res.json({
      success: true,
      data: benchmark
    })
  } catch (error) {
    console.error('getBenchmark error:', error)
    res.status(500).json({ success: false, message: 'Failed to calculate pricing benchmark' })
  }
}

// @desc    Get filter options (commodities, states)
// @route   GET /api/mandi/options
// @access  Public
exports.getOptions = async (req, res) => {
  try {
    const level = req.query.level || 'commodity'
    const data = await mandiService.fetchFilterOptions(level)
    res.json({
      success: true,
      level,
      data
    })
  } catch (error) {
    console.error('getOptions error:', error)
    res.status(500).json({ success: false, message: 'Failed to load options' })
  }
}
