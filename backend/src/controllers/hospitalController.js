const pool = require('../config/db');

const getAllHospitals = async (req, res) => {
  try {
    const { city } = req.query;

    let query = `
      SELECT h.*, u.name, u.email, u.phone as user_phone, u.is_verified
      FROM hospitals h
      JOIN users u ON h.user_id = u.id
      WHERE u.is_blocked = FALSE
    `;
    const params = [];

    if (city) {
      query += ` AND h.city LIKE ?`;
      params.push(`%${city}%`);
    }

    query += ` ORDER BY h.is_verified DESC, h.name ASC`;

    const [hospitals] = await pool.query(query, params);

    res.json(hospitals);
  } catch (error) {
    console.error('Get all hospitals error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHospitalDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [hospitals] = await pool.query(
      'SELECT * FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const hospital = hospitals[0];

    const [requests] = await pool.query(
      `SELECT br.*, u.name as patient_name 
       FROM blood_requests br
       JOIN users u ON br.patient_id = u.id
       WHERE br.hospital_name = ?
       ORDER BY br.created_at DESC LIMIT 20`,
      [hospital.name]
    );

    const [inventory] = await pool.query(
      `SELECT bi.*, bb.name as blood_bank_name 
       FROM blood_inventory bi
       JOIN blood_banks bb ON bi.blood_bank_id = bb.id
       WHERE bb.city = ?
       ORDER BY bi.units DESC`,
      [hospital.city]
    );

    res.json({
      hospital,
      recent_requests: requests,
      nearby_inventory: inventory
    });
  } catch (error) {
    console.error('Get hospital dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { blood_group, units, max_units } = req.body;
    const userId = req.user.id;

    const [hospitals] = await pool.query(
      'SELECT id FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    res.status(400).json({ message: 'Inventory management is for blood banks only' });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHospitalRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [hospitals] = await pool.query(
      'SELECT name FROM hospitals WHERE user_id = ?',
      [userId]
    );

    if (hospitals.length === 0) {
      return res.status(404).json({ message: 'Hospital profile not found' });
    }

    const hospitalName = hospitals[0].name;

    const [requests] = await pool.query(
      `SELECT br.*, u.name as patient_name, u.phone as patient_phone
       FROM blood_requests br
       JOIN users u ON br.patient_id = u.id
       WHERE br.hospital_name = ?
       ORDER BY br.created_at DESC`,
      [hospitalName]
    );

    res.json(requests);
  } catch (error) {
    console.error('Get hospital requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllHospitals,
  getHospitalDashboard,
  updateInventory,
  getHospitalRequests
};
