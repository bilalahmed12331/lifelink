const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  bookAppointment,
  respondToAppointment,
  cancelAppointment,
  getMyAppointments,
  getDoctorAppointments
} = require('../controllers/appointmentController');

router.post('/', auth, bookAppointment);

router.post('/respond', auth, respondToAppointment);

router.delete('/:appointment_id', auth, cancelAppointment);

router.get('/my-appointments', auth, getMyAppointments);

router.get('/doctor-appointments', auth, getDoctorAppointments);

module.exports = router;
