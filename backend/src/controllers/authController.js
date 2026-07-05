const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { sendEmail } = require('../utils/notifications');

const generateRequestCode = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LL-${random}`;
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, cnic, gender, date_of_birth, email, phone, address, city, password, role, ...roleSpecificData } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await pool.query(
      'INSERT INTO users (name, cnic, gender, date_of_birth, email, phone, address, city, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, cnic, gender, date_of_birth, email, phone, address, city, hashedPassword, role]
    );

    const userId = userResult.insertId;

    if (role === 'donor') {
      await pool.query(
        'INSERT INTO donors (user_id, blood_group, is_available) VALUES (?, ?, ?)',
        [userId, roleSpecificData.blood_group, true]
      );
    } else if (role === 'doctor') {
      await pool.query(
        'INSERT INTO doctors (user_id, specialization, qualifications, experience_years, city) VALUES (?, ?, ?, ?, ?)',
        [userId, roleSpecificData.specialization, roleSpecificData.qualifications, roleSpecificData.experience_years, city]
      );
    } else if (role === 'hospital') {
      await pool.query(
        'INSERT INTO hospitals (user_id, name, license_number, address, city, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, roleSpecificData.hospital_name, roleSpecificData.license_number, address, city, phone]
      );
    } else if (role === 'blood_bank') {
      await pool.query(
        'INSERT INTO blood_banks (user_id, name, address, city, phone) VALUES (?, ?, ?, ?, ?)',
        [userId, roleSpecificData.blood_bank_name, address, city, phone]
      );
    }

    const token = jwt.sign(
      { id: userId, email, role, name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { id: userId, name, email, role } });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email or CNIC already registered' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.is_blocked) {
      return res.status(403).json({ message: 'Your account has been blocked' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT id, name, cnic, gender, date_of_birth, email, phone, address, city, role, is_verified, is_blocked, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    if (user.role === 'donor') {
      const [donors] = await pool.query(
        'SELECT * FROM donors WHERE user_id = ?',
        [userId]
      );
      user.donor_data = donors[0] || {};
    } else if (user.role === 'doctor') {
      const [doctors] = await pool.query(
        'SELECT * FROM doctors WHERE user_id = ?',
        [userId]
      );
      user.doctor_data = doctors[0] || {};
    } else if (user.role === 'hospital') {
      const [hospitals] = await pool.query(
        'SELECT * FROM hospitals WHERE user_id = ?',
        [userId]
      );
      user.hospital_data = hospitals[0] || {};
    } else if (user.role === 'blood_bank') {
      const [bloodBanks] = await pool.query(
        'SELECT * FROM blood_banks WHERE user_id = ?',
        [userId]
      );
      user.blood_bank_data = bloodBanks[0] || {};
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(oldPassword, users[0].password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedNewPassword, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.query(
      'SELECT id, name FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    await sendEmail(email, 'Password Reset - LifeLink', html);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
