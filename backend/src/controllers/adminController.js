const pool = require('../config/db');

const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;

    let query = 'SELECT id, name, email, phone, city, role, is_verified, is_blocked, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [users] = await pool.query(query, params);

    res.json(users);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const verifyUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    await pool.query(
      'UPDATE users SET is_verified = TRUE WHERE id = ?',
      [user_id]
    );

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'verify_user', 'user', user_id, `Verified user with ID ${user_id}`]
    );

    res.json({ message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const blockUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { is_blocked } = req.body;

    await pool.query(
      'UPDATE users SET is_blocked = ? WHERE id = ?',
      [is_blocked, user_id]
    );

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, is_blocked ? 'block_user' : 'unblock_user', 'user', user_id, `${is_blocked ? 'Blocked' : 'Unblocked'} user with ID ${user_id}`]
    );

    res.json({ message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (user_id == req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await pool.query(
      'DELETE FROM users WHERE id = ?',
      [user_id]
    );

    await pool.query(
      'INSERT INTO admin_logs (admin_id, action, target_type, target_id, details) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, 'delete_user', 'user', user_id, `Deleted user with ID ${user_id}`]
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllRequests = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT br.*, u.name as patient_name
      FROM blood_requests br
      JOIN users u ON br.patient_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND br.status = ?';
      params.push(status);
    }

    query += ' ORDER BY br.created_at DESC';

    const [requests] = await pool.query(query, params);

    res.json(requests);
  } catch (error) {
    console.error('Get all requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getSystemLogs = async (req, res) => {
  try {
    const [logs] = await pool.query(
      `SELECT al.*, u.name as admin_name
       FROM admin_logs al
       JOIN users u ON al.admin_id = u.id
       ORDER BY al.created_at DESC
       LIMIT 100`
    );

    res.json(logs);
  } catch (error) {
    console.error('Get system logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [userCounts] = await pool.query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );

    const [requestStatuses] = await pool.query(
      'SELECT status, COUNT(*) as count FROM blood_requests GROUP BY status'
    );

    const [totalDonations] = await pool.query(
      'SELECT COUNT(*) as count FROM donor_responses WHERE status = ?',
      ['completed']
    );

    const [totalHospitals] = await pool.query(
      'SELECT COUNT(*) as count FROM hospitals'
    );

    const [totalDoctors] = await pool.query(
      'SELECT COUNT(*) as count FROM doctors'
    );

    const [totalBloodBanks] = await pool.query(
      'SELECT COUNT(*) as count FROM blood_banks'
    );

    const [recentActivity] = await pool.query(
      `SELECT 'user' as type, name, created_at FROM users 
       UNION ALL
       SELECT 'request' as type, request_code as name, created_at FROM blood_requests 
       ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      users_by_role: userCounts,
      requests_by_status: requestStatuses,
      total_donations: totalDonations[0].count,
      total_hospitals: totalHospitals[0].count,
      total_doctors: totalDoctors[0].count,
      total_blood_banks: totalBloodBanks[0].count,
      recent_activity: recentActivity
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllUsers,
  verifyUser,
  blockUser,
  deleteUser,
  getAllRequests,
  getSystemLogs,
  getAnalytics
};
