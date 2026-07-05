const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllHospitals,
  getHospitalDashboard,
  updateInventory,
  getHospitalRequests
} = require('../controllers/hospitalController');

router.get('/', getAllHospitals);

router.get('/dashboard', auth, requireRole('hospital'), getHospitalDashboard);

router.put('/inventory', auth, requireRole('hospital'), updateInventory);

router.get('/requests', auth, requireRole('hospital'), getHospitalRequests);

module.exports = router;
