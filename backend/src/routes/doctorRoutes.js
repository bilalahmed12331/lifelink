const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const {
  getAllDoctors,
  getDoctorProfile,
  updateSchedule,
  getDoctorDashboard
} = require('../controllers/doctorController');

router.get('/', getAllDoctors);

router.get('/profile', auth, requireRole('doctor'), getDoctorProfile);

router.put('/schedule', auth, requireRole('doctor'), updateSchedule);

router.get('/dashboard', auth, requireRole('doctor'), getDoctorDashboard);

module.exports = router;
