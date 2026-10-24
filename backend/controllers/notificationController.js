const Notification = require('../models/Notification')

// ── Seed helper — create demo notifications for new users ─────────────────────
async function seedIfEmpty(userId) {
  const count = await Notification.countDocuments({ user: userId })
  if (count > 0) return
  const now = new Date()
  const ago = (mins) => new Date(now - mins * 60000)
  await Notification.insertMany([
    {
      user: userId, type: 'booking', isRead: false,
      title: 'New Booking Request',
      message: 'FreshMart Pvt Ltd has sent a booking request for 500 kg of Tomato at ₹30/kg.',
      link: '/farmer/orders', createdAt: ago(30),
    },
    {
      user: userId, type: 'order', isRead: false,
      title: 'Order Status Updated',
      message: 'Your order with GreenBasket Co. has been confirmed and is now being prepared.',
      link: '/farmer/orders/active', createdAt: ago(120),
    },
    {
      user: userId, type: 'payment', isRead: true,
      title: 'Payment Received',
      message: 'Payment of ₹8,500 from Metro Wholesale has been marked as paid.',
      link: '/farmer/earnings', createdAt: ago(300),
    },
    {
      user: userId, type: 'pickup', isRead: false,
      title: 'Pickup Reminder',
      message: 'FreshMart pickup is scheduled for tomorrow. Ensure your Tomato crop is ready.',
      link: '/farmer/pickup-delivery', createdAt: ago(60),
    },
    {
      user: userId, type: 'system', isRead: true,
      title: 'Welcome to AgriFlow AI',
      message: 'Your farmer account is set up. Complete your farm profile to unlock all features.',
      link: '/farmer/profile', createdAt: ago(1440),
    },
  ])
}

// ── GET /api/notifications ────────────────────────────────────────────────────
async function getNotifications(req, res) {
  try {
    await seedIfEmpty(req.user._id)
    const notifs = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50)
    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false })
    res.json({
      notifications: notifs.map(fmt),
      unreadCount,
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message })
  }
}

// ── PUT /api/notifications/:id/read ──────────────────────────────────────────
async function markRead(req, res) {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    )
    if (!notif) return res.status(404).json({ message: 'Notification not found' })
    res.json(fmt(notif))
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark notification', error: err.message })
  }
}

// ── PUT /api/notifications/read-all ──────────────────────────────────────────
async function markAllRead(req, res) {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark all as read', error: err.message })
  }
}

function fmt(n) {
  const d = n.toObject ? n.toObject() : n
  return {
    id:        d._id.toString(),
    type:      d.type,
    title:     d.title,
    message:   d.message,
    isRead:    d.isRead,
    link:      d.link,
    createdAt: d.createdAt,
  }
}

module.exports = { getNotifications, markRead, markAllRead }
