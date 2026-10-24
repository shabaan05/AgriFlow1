const express = require('express')
const { protect } = require('../middleware/auth')
const { getNotifications, markRead, markAllRead } = require('../controllers/notificationController')

const router = express.Router()
router.use(protect)

// GET /api/notifications
router.get('/', getNotifications)

// PUT /api/notifications/read-all
router.put('/read-all', markAllRead)

// PUT /api/notifications/:id/read
router.put('/:id/read', markRead)

module.exports = router
