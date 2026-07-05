const pool = require('../config/db');
const { sendEmail, sendSMS } = require('../utils/notifications');

const generateRequestCode = () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LL-${random}`;
};

const createRequest = async (req, res) => {
  try {
    const { patient_id, blood_group, units_needed, urgency, hospital_name, city, latitude, longitude, required_date, contact_number, notes } = req.body;
    const userId = req.user.id;

    const request_code = generateRequestCode();

    const [result] = await pool.query(
      `INSERT INTO blood_requests (request_code, patient_id, blood_group, units_needed, urgency, hospital_name, city, latitude, longitude, required_date, contact_number, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted', ?)`,
      [request_code, userId, blood_group, units_needed, urgency, hospital_name, city, latitude, longitude, required_date, contact_number, notes]
    );

    const requestId = result.insertId;

    await pool.query(
      'UPDATE blood_requests SET status = ? WHERE id = ?',
      ['matching', requestId]
    );

    const [users] = await pool.query(
      'SELECT name, email, phone FROM users WHERE id = ?',
      [userId]
    );

    if (users.length > 0) {
      const user = users[0];
      
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
        [userId, 'Blood Request Created', `Your blood request ${request_code} has been submitted and is now matching with donors.`, 'success']
      );

      const emailHtml = `
        <h2>Blood Request Submitted</h2>
        <p>Hello ${user.name},</p>
        <p>Your blood request ${request_code} has been successfully submitted.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Blood Group: ${blood_group}</li>
          <li>Units Needed: ${units_needed}</li>
          <li>Hospital: ${hospital_name}</li>
          <li>Required Date: ${required_date}</li>
          <li>Urgency: ${urgency}</li>
        </ul>
        <p>We are now matching you with available donors.</p>
      `;

      await sendEmail(user.email, `Blood Request ${request_code} - LifeLink`, emailHtml);
    }

    res.status(201).json({ message: 'Blood request created successfully', request_code, id: requestId });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRequests = async (req, res) => {
  try {
    const { status, city, blood_group } = req.query;

    let query = `
      SELECT br.*, u.name as patient_name 
      FROM blood_requests br
      JOIN users u ON br.patient_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ` AND br.status = ?`;
      params.push(status);
    }

    if (city) {
      query += ` AND br.city LIKE ?`;
      params.push(`%${city}%`);
    }

    if (blood_group) {
      query += ` AND br.blood_group = ?`;
      params.push(blood_group);
    }

    query += ` ORDER BY br.created_at DESC`;

    const [requests] = await pool.query(query, params);

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    const [requests] = await pool.query(
      `SELECT br.*, 
        (SELECT COUNT(*) FROM donor_responses WHERE request_id = br.id AND status = 'accepted') as accepted_donors
       FROM blood_requests br
       WHERE br.patient_id = ?
       ORDER BY br.created_at DESC`,
      [userId]
    );

    res.json(requests);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { request_id, status, location_lat, location_lng } = req.body;
    const userId = req.user.id;

    const [donors] = await pool.query(
      'SELECT id FROM donors WHERE user_id = ?',
      [userId]
    );

    if (donors.length === 0) {
      return res.status(404).json({ message: 'Donor profile not found' });
    }

    const donorId = donors[0].id;

    const [existing] = await pool.query(
      'SELECT * FROM donor_responses WHERE request_id = ? AND donor_id = ?',
      [request_id, donorId]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already responded to this request' });
    }

    await pool.query(
      'INSERT INTO donor_responses (request_id, donor_id, status, location_lat, location_lng) VALUES (?, ?, ?, ?, ?)',
      [request_id, donorId, status, location_lat, location_lng]
    );

    if (status === 'accepted') {
      await pool.query(
        'UPDATE blood_requests SET status = ? WHERE id = ?',
        ['accepted', request_id]
      );

      await pool.query(
        'UPDATE donors SET total_donations = total_donations + 1, reward_points = reward_points + 100, last_donated = CURDATE() WHERE id = ?',
        [donorId]
      );

      const newPoints = (donors[0].reward_points || 0) + 100;
      let badge = 'bronze';
      if (newPoints >= 500) badge = 'platinum';
      else if (newPoints >= 300) badge = 'gold';
      else if (newPoints >= 100) badge = 'silver';

      await pool.query(
        'UPDATE donors SET badge = ? WHERE id = ?',
        [badge, donorId]
      );

      const [requests] = await pool.query(
        'SELECT * FROM blood_requests WHERE id = ?',
        [request_id]
      );

      if (requests.length > 0) {
        const request = requests[0];
        
        await pool.query(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [request.patient_id, 'Donor Accepted', `A donor has accepted your blood request ${request.request_code}.`, 'success']
        );

        const [patientUsers] = await pool.query(
          'SELECT name, email, phone FROM users WHERE id = ?',
          [request.patient_id]
        );

        if (patientUsers.length > 0) {
          const patient = patientUsers[0];
          await sendEmail(patient.email, `Donor Accepted - ${request.request_code}`, `<h2>Donor Accepted</h2><p>A donor has accepted your blood request ${request.request_code}.</p>`);
          await sendSMS(patient.phone, `LifeLink: A donor has accepted your blood request ${request.request_code}.`);
        }
      }
    }

    res.json({ message: 'Response recorded successfully' });
  } catch (error) {
    console.error('Respond to request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTrackingData = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [requests] = await pool.query(
      'SELECT * FROM blood_requests WHERE id = ?',
      [request_id]
    );

    if (requests.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const request = requests[0];

    const [responses] = await pool.query(
      `SELECT dr.*, d.blood_group, u.name as donor_name, u.phone as donor_phone
       FROM donor_responses dr
       JOIN donors d ON dr.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE dr.request_id = ? AND dr.status = 'accepted'`,
      [request_id]
    );

    const statusFlow = ['submitted', 'matching', 'accepted', 'en_route', 'delivered', 'completed'];
    const currentIndex = statusFlow.indexOf(request.status);

    res.json({
      request,
      accepted_donors: responses,
      progress: {
        current_status: request.status,
        current_index: currentIndex,
        total_stages: statusFlow.length,
        stages: statusFlow
      }
    });
  } catch (error) {
    console.error('Get tracking data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status } = req.body;

    await pool.query(
      'UPDATE blood_requests SET status = ? WHERE id = ?',
      [status, request_id]
    );

    res.json({ message: 'Request status updated successfully' });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getMyRequests,
  respondToRequest,
  getTrackingData,
  updateRequestStatus
};
