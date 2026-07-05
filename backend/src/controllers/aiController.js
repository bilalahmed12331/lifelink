const pool = require('../config/db');

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

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

const matchDonors = async (req, res) => {
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

    const compatibleGroups = getCompatibleBloodGroups(request.blood_group);

    const [donors] = await pool.query(
      `SELECT d.*, u.name, u.phone, u.city, u.address
       FROM donors d
       JOIN users u ON d.user_id = u.id
       WHERE d.blood_group IN (${compatibleGroups.map(() => '?').join(',')})
       AND u.is_blocked = FALSE
       AND d.is_available = TRUE`,
      compatibleGroups
    );

    const scoredDonors = donors.map(donor => {
      let score = 0;
      const criteria = {};

      const distance = request.latitude && request.longitude && donor.latitude && donor.longitude
        ? haversineDistance(request.latitude, request.longitude, donor.latitude, donor.longitude)
        : 50;

      criteria.blood_group_compatibility = donor.blood_group === request.blood_group ? 40 : 20;
      score += criteria.blood_group_compatibility;

      const distanceScore = Math.max(0, 30 - (distance * 0.5));
      criteria.distance = distanceScore;
      score += distanceScore;

      criteria.availability = donor.is_available ? 20 : 0;
      score += criteria.availability;

      const daysSinceDonation = donor.last_donated
        ? Math.floor((new Date() - new Date(donor.last_donated)) / (1000 * 60 * 60 * 24))
        : 365;
      const recencyScore = Math.min(10, daysSinceDonation / 30);
      criteria.recency = recencyScore;
      score += recencyScore;

      return {
        ...donor,
        score: Math.round(score * 100) / 100,
        distance: Math.round(distance * 10) / 10,
        criteria
      };
    });

    const rankedDonors = scoredDonors
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    for (const donor of rankedDonors) {
      await pool.query(
        'INSERT INTO ai_recommendations (request_id, donor_id, score, criteria_json) VALUES (?, ?, ?, ?)',
        [request_id, donor.id, donor.score, JSON.stringify(donor.criteria)]
      );
    }

    res.json({
      request_id,
      matched_donors: rankedDonors,
      total_candidates: donors.length
    });
  } catch (error) {
    console.error('Match donors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getRecommendations = async (req, res) => {
  try {
    const { request_id } = req.params;

    const [recommendations] = await pool.query(
      `SELECT ar.*, d.blood_group, u.name as donor_name
       FROM ai_recommendations ar
       JOIN donors d ON ar.donor_id = d.id
       JOIN users u ON d.user_id = u.id
       WHERE ar.request_id = ?
       ORDER BY ar.score DESC`,
      [request_id]
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  matchDonors,
  getRecommendations
};
