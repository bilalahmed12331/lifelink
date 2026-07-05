const pool = require('../config/db');

const getCompatibleBloodGroups = (bloodGroup) => {
  const compatibility = {
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    'AB-': ['A-', 'B-', 'AB-', 'O-'],
    'O+': ['O+', 'O-'],
    'O-': ['O-']
  };
  return compatibility[bloodGroup] || [bloodGroup];
};

const searchDonors = async (req, res) => {
  try {
    const { blood_group, city, area, available_only } = req.query;

    let query = `
      SELECT d.*, u.name, u.phone, u.address, u.city 
      FROM donors d
      JOIN users u ON d.user_id = u.id
      WHERE u.is_blocked = FALSE
    `;
    const params = [];

    if (blood_group) {
      const compatibleGroups = getCompatibleBloodGroups(blood_group);
      query += ` AND d.blood_group IN (${compatibleGroups.map(() => '?').join(',')})`;
      params.push(...compatibleGroups);
    }

    if (city) {
      query += ` AND u.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (area) {
      query += ` AND u.address LIKE ?`;
      params.push(`%${area}%`);
    }

    if (available_only === 'true') {
      query += ` AND d.is_available = TRUE`;
    }

    query += ` ORDER BY d.reward_points DESC, d.total_donations DESC`;

    const [donors] = await pool.query(query, params);

    res.json(donors);
  } catch (error) {
    console.error('Search donors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDonorDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [donors] = await pool.query(
      'SELECT * FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const donor = donors[0];

    const [responses] = await pool.query(
      'SELECT dr.*, br.request_code, br.blood_group, br.units_needed, br.hospital_name, br.status as request_status FROM donor_responses dr JOIN blood_requests br ON dr.request_id = br.id WHERE dr.donor_id = ? ORDER BY dr.responded_at DESC LIMIT 10',
      [donor.id]
    );

    const [appointments] = await pool.query(
      'SELECT a.*, d.specialization, u.name as doctor_name FROM appointments a JOIN doctors d ON a.doctor_id = d.id JOIN users u ON d.user_id = u.id WHERE a.patient_id = ? ORDER BY a.appointment_date DESC LIMIT 5',
      [userId]
    );

    res.json({
      donor,
      recent_responses: responses,
      upcoming_appointments: appointments
    });
  } catch (error) {
    console.error('Get donor dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const { is_available } = req.body;
    const userId = req.user.id;

    const [donors] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    await pool.query(
      'UPDATE donors SET is_available = ? WHERE user_id = ?',
      [is_available, userId]
    );

    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDonationHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [donors] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const donorId = donors[0].id;

    const [history] = await pool.query(
      `SELECT dr.*, br.request_code, br.blood_group, br.units_needed, br.hospital_name, br.city, br.required_date 
       FROM donor_responses dr 
       JOIN blood_requests br ON dr.request_id = br.id 
       WHERE dr.donor_id = ? AND dr.status = 'completed'
       ORDER BY dr.responded_at DESC`,
      [donorId]
    );

    res.json(history);
  } catch (error) {
    console.error('Get donation history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  searchDonors,
  getDonorDashboard,
  updateAvailability,
  getDonationHistory
};
