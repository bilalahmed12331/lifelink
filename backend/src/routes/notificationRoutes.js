const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getMyNotifications,
  markAsRead,
  markAllRead,
  getUnreadCount
} = require('../controllers/notificationController');

router.get('/', auth, getMyNotifications);

router.get('/unread-count', auth, getUnreadCount);

router.put('/:notification_id/read', auth, markAsRead);

router.put('/read-all', auth, markAllRead);

module.exports = router;
