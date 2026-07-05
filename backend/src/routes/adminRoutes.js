const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllUsers,
  verifyUser,
  blockUser,
  deleteUser,
  getAllRequests,
  getSystemLogs,
  getAnalytics
} = require('../controllers/adminController');

router.get('/users', auth, requireRole('admin'), getAllUsers);

router.put('/users/:user_id/verify', auth, requireRole('admin'), verifyUser);

router.put('/users/:user_id/block', auth, requireRole('admin'), blockUser);

router.delete('/users/:user_id', auth, requireRole('admin'), deleteUser);

router.get('/requests', auth, requireRole('admin'), getAllRequests);

router.get('/logs', auth, requireRole('admin'), getSystemLogs);

router.get('/analytics', auth, requireRole('admin'), getAnalytics);

module.exports = router;
