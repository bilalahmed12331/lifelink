const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllBloodBanks,
  getInventory,
  updateInventory,
  getBloodBankDashboard
} = require('../controllers/bloodBankController');

router.get('/', getAllBloodBanks);

router.get('/inventory', auth, requireRole('blood_bank'), getInventory);

router.put('/inventory', auth, requireRole('blood_bank'), updateInventory);

router.get('/dashboard', auth, requireRole('blood_bank'), getBloodBankDashboard);

module.exports = router;
