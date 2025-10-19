const express = require('express');
const router = express.Router();
const { createEvent } = require('../controllers/events.controller');

// Handle POST requests to /api/events
router.post('/', createEvent);

module.exports = router;