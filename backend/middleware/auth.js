const jwt  = require('jsonwebtoken')
const User = require('../models/User')

/**
 * protect — JWT authentication middleware.
 * Reads the token from the Authorization header: "Bearer <token>"
 * Attaches the user document (without password) to req.user.
 * Returns 401 if token is missing, invalid or expired.
 */
async function protect(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // Attach user (without password field) to the request
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised — user no longer exists' })
    }
    next()
  } catch (err) {
    const message = err.name === 'TokenExpiredError'
      ? 'Not authorised — token expired'
      : 'Not authorised — invalid token'
    return res.status(401).json({ message })
  }
}

/**
 * requireRole(...roles) — role-based access control middleware.
 * Must be used after protect().
 * Usage: router.get('/admin', protect, requireRole('admin'), handler)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({
        message: `Access denied — requires role: ${roles.join(' or ')}`,
      })
    }
    next()
  }
}

module.exports = { protect, requireRole }
