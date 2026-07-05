const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  searchDonors,
  getDonorDashboard,
  updateAvailability,
  getDonationHistory
} = require('../controllers/donorController');

router.get('/search', searchDonors);

router.get('/dashboard', auth, requireRole('donor'), getDonorDashboard);

router.put('/availability', auth, requireRole('donor'), updateAvailability);

router.get('/history', auth, requireRole('donor'), getDonationHistory);

module.exports = router;
