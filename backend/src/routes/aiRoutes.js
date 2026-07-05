const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  matchDonors,
  getRecommendations
} = require('../controllers/aiController');

router.post('/match/:request_id', auth, matchDonors);

router.get('/recommendations/:request_id', auth, getRecommendations);

module.exports = router;
