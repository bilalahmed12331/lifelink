const pool = require('../config/db');

const getAllBloodBanks = async (req, res) => {
  try {
    const { city } = req.query;

    let query = `
      SELECT bb.*, u.name, u.email, u.phone as user_phone, u.is_verified
      FROM blood_banks bb
      JOIN users u ON bb.user_id = u.id
      WHERE u.is_blocked = FALSE
    `;
    const params = [];

    if (city) {
      query += ` AND bb.city LIKE ?`;
      params.push(`%${city}%`);
    }

    query += ` ORDER BY bb.is_verified DESC, bb.name ASC`;

    const [bloodBanks] = await pool.query(query, params);

    for (const bloodBank of bloodBanks) {
      const [inventory] = await pool.query(
        'SELECT blood_group, units, max_units FROM blood_inventory WHERE blood_bank_id = ?',
        [bloodBank.id]
      );
      bloodBank.inventory = inventory;
    }

    res.json(bloodBanks);
  } catch (error) {
    console.error('Get all blood banks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getInventory = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bloodBanks] = await pool.query(
      'SELECT id FROM blood_banks WHERE user_id = ?',
      [userId]
    );

    if (bloodBanks.length === 0) {
      return res.status(404).json({ message: 'Blood bank profile not found' });
    }

    const bloodBankId = bloodBanks[0].id;

    const [inventory] = await pool.query(
      'SELECT * FROM blood_inventory WHERE blood_bank_id = ?',
      [bloodBankId]
    );

    res.json(inventory);
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { blood_group, units, max_units } = req.body;
    const userId = req.user.id;

    const [bloodBanks] = await pool.query(
      'SELECT id FROM blood_banks WHERE user_id = ?',
      [userId]
    );

    if (bloodBanks.length === 0) {
      return res.status(404).json({ message: 'Blood bank profile not found' });
    }

    const bloodBankId = bloodBanks[0].id;

    const [existing] = await pool.query(
      'SELECT * FROM blood_inventory WHERE blood_bank_id = ? AND blood_group = ?',
      [bloodBankId, blood_group]
    );

    if (existing.length > 0) {
      await pool.query(
        'UPDATE blood_inventory SET units = ?, max_units = ? WHERE blood_bank_id = ? AND blood_group = ?',
        [units, max_units, bloodBankId, blood_group]
      );
    } else {
      await pool.query(
        'INSERT INTO blood_inventory (blood_bank_id, blood_group, units, max_units) VALUES (?, ?, ?, ?)',
        [bloodBankId, blood_group, units, max_units]
      );
    }

    res.json({ message: 'Inventory updated successfully' });
  } catch (error) {
    console.error('Update inventory error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getBloodBankDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bloodBanks] = await pool.query(
      'SELECT * FROM blood_banks WHERE user_id = ?',
      [userId]
    );

    if (bloodBanks.length === 0) {
      return res.status(404).json({ message: 'Blood bank profile not found' });
    }

    const bloodBank = bloodBanks[0];

    const [inventory] = await pool.query(
      'SELECT * FROM blood_inventory WHERE blood_bank_id = ?',
      [bloodBank.id]
    );

    const [requests] = await pool.query(
      `SELECT br.*, u.name as patient_name 
       FROM blood_requests br
       JOIN users u ON br.patient_id = u.id
       WHERE br.city = ?
       ORDER BY br.created_at DESC LIMIT 20`,
      [bloodBank.city]
    );

    res.json({
      blood_bank: bloodBank,
      inventory,
      nearby_requests: requests
    });
  } catch (error) {
    console.error('Get blood bank dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllBloodBanks,
  getInventory,
  updateInventory,
  getBloodBankDashboard
};
