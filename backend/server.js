const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
require('dotenv').config()

const authRoutes         = require('./routes/authRoutes')
const cropRoutes         = require('./routes/cropRoutes')
const demandRoutes       = require('./routes/demandRoutes')
const aiRoutes           = require('./routes/aiRoutes')
const bookingRoutes      = require('./routes/bookingRoutes')
const orderRoutes        = require('./routes/orderRoutes')
const paymentRoutes      = require('./routes/paymentRoutes')
const farmerRoutes       = require('./routes/farmerRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const traceabilityRoutes = require('./routes/traceabilityRoutes')
const marketplaceRoutes  = require('./routes/marketplaceRoutes')
const requirementRoutes  = require('./routes/requirementRoutes')
const buyerRoutes        = require('./routes/buyerRoutes')
const transporterRoutes  = require('./routes/transporterRoutes')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://agri-flow1.vercel.app',
    'https://agri-flow1-bi60ktc2i-shabaansatarkar05-8846s-projects.vercel.app'
  ],
  credentials: true
}))
app.use(express.json())

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRoutes)
app.use('/api/crops',        cropRoutes)
app.use('/api/demand',       demandRoutes)
app.use('/api/ai',           aiRoutes)
app.use('/api/bookings',     bookingRoutes)
app.use('/api/orders',       orderRoutes)
app.use('/api/payments',     paymentRoutes)
app.use('/api/farmers',       farmerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/traceability',  traceabilityRoutes)
app.use('/api/marketplace',   marketplaceRoutes)
app.use('/api/requirements',  requirementRoutes)
app.use('/api/buyers',        buyerRoutes)
app.use('/api/transporter',   transporterRoutes)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'AgriFlow API' }))

// 404 handler
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }))

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  })
})

// ── Database + Server ───────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`🚀 AgriFlow API running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })

