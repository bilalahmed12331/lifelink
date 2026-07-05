const express = require('express');
const router = express.Router();
const {
  chatbotResponse
} = require('../controllers/chatbotController');

router.post('/', chatbotResponse);

module.exports = router;
