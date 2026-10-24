const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ── Helper: sign and return a token ─────────────────────────────────────────
function generateToken(userId, role) {
  return jwt.sign(
    { id: userId, role: role || 'farmer' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// ── POST /api/auth/register ──────────────────────────────────────────────────
async function register(req, res) {
  try {
    const { name, email, password, phone, role } = req.body

    // Basic required-field validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' })
    }

    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() })
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists' })
    }

    // Allow 'farmer', 'buyer', or 'transporter' role via this endpoint
    const assignedRole = ['farmer', 'buyer', 'transporter'].includes(role) ? role : 'farmer'

    const user  = await User.create({ name, email, password, phone, role: assignedRole })
    const token = generateToken(user._id, user.role)

    res.status(201).json({
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message)
      return res.status(400).json({ message: messages.join('; ') })
    }
    res.status(500).json({ message: 'Registration failed', error: err.message })
  }
}

// ── POST /api/auth/login ─────────────────────────────────────────────────────
async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Explicitly select password field (it's excluded by default via select:false)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = generateToken(user._id, user.role)

    res.json({
      token,
      user: user.toSafeObject(),
    })
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message })
  }
}

// ── GET /api/auth/me (protected) ─────────────────────────────────────────────
async function getMe(req, res) {
  // req.user is populated by the protect middleware
  res.json({ user: req.user.toSafeObject() })
}

// ── PUT /api/auth/change-password (protected) ────────────────────────────────
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' })
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' })
    }

    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await user.matchPassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password', error: err.message })
  }
}

module.exports = { register, login, getMe, changePassword }
