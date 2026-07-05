const pool = require('../config/db');

const getAllDoctors = async (req, res) => {
  try {
    const { specialization, city } = req.query;

    let query = `
      SELECT d.*, u.name, u.email, u.phone, u.is_verified
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      WHERE u.is_blocked = FALSE
    `;
    const params = [];

    if (specialization) {
      query += ` AND d.specialization LIKE ?`;
      params.push(`%${specialization}%`);
    }

    if (city) {
      query += ` AND d.city LIKE ?`;
      params.push(`%${city}%`);
    }

    query += ` ORDER BY d.is_verified DESC, d.experience_years DESC`;

    const [doctors] = await pool.query(query, params);

    res.json(doctors);
  } catch (error) {
    console.error('Get all doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctors] = await pool.query(
      'SELECT d.*, u.name, u.email, u.phone, u.address FROM doctors d JOIN users u ON d.user_id = u.id WHERE d.user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    res.json(doctors[0]);
  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const { available_days, available_times, consultation_fee } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE doctors SET available_days = ?, available_times = ?, consultation_fee = ? WHERE user_id = ?',
      [available_days, available_times, consultation_fee, userId]
    );

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDoctorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [doctors] = await pool.query(
      'SELECT * FROM doctors WHERE user_id = ?',
      [userId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor profile not found' });
    }

    const doctor = doctors[0];

    const [appointments] = await pool.query(
      `SELECT a.*, u.name as patient_name, u.phone as patient_phone
       FROM appointments a
       JOIN users u ON a.patient_id = u.id
       WHERE a.doctor_id = ?
       ORDER BY a.appointment_date DESC, a.time_slot DESC LIMIT 20`,
      [doctor.id]
    );

    const [pendingCount] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = ?',
      [doctor.id, 'pending']
    );

    const [completedCount] = await pool.query(
      'SELECT COUNT(*) as count FROM appointments WHERE doctor_id = ? AND status = ?',
      [doctor.id, 'completed']
    );

    res.json({
      doctor,
      recent_appointments: appointments,
      stats: {
        pending: pendingCount[0].count,
        completed: completedCount[0].count
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorProfile,
  updateSchedule,
  getDoctorDashboard
};
