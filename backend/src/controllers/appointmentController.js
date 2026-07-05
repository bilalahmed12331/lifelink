const pool = require('../config/db');
const { sendEmail, sendSMS } = require('../utils/notifications');

const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, time_slot, reason, notes } = req.body;
    const patientId = req.user.id;

    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE id = ?',
      [doctor_id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM appointments WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? AND status != ?',
      [doctor_id, appointment_date, time_slot, 'cancelled']
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_date, time_slot, reason, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patientId, doctor_id, appointment_date, time_slot, reason, notes, 'pending']
    );

    const appointmentId = result.insertId;

    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [patientId, 'Appointment Booked', `Your appointment has been booked and is pending confirmation.`, 'info']
    );

    const [doctorUsers] = await pool.query(
      'SELECT u.id, u.name, u.email, u.phone FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [doctor_id]
    );

    if (doctorUsers.length > 0) {
      const doctor = doctorUsers[0];
      
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [doctor.id, 'New Appointment Request', `You have a new appointment request for ${appointment_date} at ${time_slot}.`, 'info']
      );

      const [patientUsers] = await pool.query(
        'SELECT name FROM users WHERE id = ?',
        [patientId]
      );

      if (patientUsers.length > 0) {
        const patientName = patientUsers[0].name;
        await sendEmail(doctor.email, 'New Appointment Request', `<h2>New Appointment Request</h2><p>Patient: ${patientName}</p><p>Date: ${appointment_date}</p><p>Time: ${time_slot}</p>`);
      }
    }

    res.status(201).json({ message: 'Appointment booked successfully', id: appointmentId });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const respondToAppointment = async (req, res) => {
  try {
    const { appointment_id, status, new_date, new_time } = req.body;
    const userId = req.user.id;

    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctorId = doctors[0].id;

    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointment_id, doctorId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    const appointment = appointments[0];

    if (status === 'rescheduled' && new_date && new_time) {
      await pool.query(
        'UPDATE appointments SET status = ?, appointment_date = ?, time_slot = ?, notes = CONCAT(COALESCE(notes, ""), " - Rescheduled from ", ?, " ", ?) WHERE id = ?',
        ['rescheduled', new_date, new_time, appointment.appointment_date, appointment.time_slot, appointment_id]
      );
    } else {
      await pool.query(
        'UPDATE appointments SET status = ? WHERE id = ?',
        [status, appointment_id]
      );
    }

    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [appointment.patient_id, 'Appointment Updated', `Your appointment has been ${status}.`, status === 'accepted' ? 'success' : 'warning']
    );

    const [patientUsers] = await pool.query(
      'SELECT name, email, phone FROM users WHERE id = ?',
      [appointment.patient_id]
    );

    if (patientUsers.length > 0) {
      const patient = patientUsers[0];
      const message = status === 'accepted' ? 'Your appointment has been confirmed.' : status === 'rejected' ? 'Your appointment has been rejected.' : 'Your appointment has been rescheduled.';
      await sendEmail(patient.email, 'Appointment Update', `<h2>Appointment Update</h2><p>${message}</p>`);
      await sendSMS(patient.phone, `LifeLink: ${message}`);
    }

    res.json({ message: 'Appointment response recorded successfully' });
  } catch (error) {
    console.error('Respond to appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const { appointment_id } = req.params;
    const userId = req.user.id;

    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ? AND patient_id = ?',
      [appointment_id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['cancelled', appointment_id]
    );

    const appointment = appointments[0];

    const [doctorUsers] = await pool.query(
      'SELECT u.id FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.id = ?',
      [appointment.doctor_id]
    );

    if (doctorUsers.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [doctorUsers[0].id, 'Appointment Cancelled', `An appointment has been cancelled by the patient.`, 'warning']
      );
    }

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [appointments] = await pool.query(
      `SELECT a.*, d.specialization, u.name as doctor_name, u.phone as doctor_phone
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE a.patient_id = ?
       ORDER BY a.appointment_date DESC, a.time_slot DESC`,
      [userId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Get my appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorAppointments = async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctorId = doctors[0].id;

    const [appointments] = await pool.query(
      `SELECT a.*, u.name as patient_name, u.phone as patient_phone, u.email as patient_email
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC, a.time_slot DESC`,
      [doctorId]
    );

    res.json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  respondToAppointment,
  cancelAppointment,
  getMyAppointments,
  getDoctorAppointments
};
