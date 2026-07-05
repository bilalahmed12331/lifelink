const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createRequest,
  getRequests,
  getMyRequests,
  respondToRequest,
  getTrackingData,
  updateRequestStatus
} = require('../controllers/requestController');

router.post('/', auth, createRequest);

router.get('/', getRequests);

router.get('/my-requests', auth, getMyRequests);

router.post('/respond', auth, respondToRequest);

router.get('/tracking/:request_id', auth, getTrackingData);

router.put('/:request_id/status', auth, updateRequestStatus);

module.exports = router;
