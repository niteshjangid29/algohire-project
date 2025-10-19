const express = require('express');
const router = express.Router();
const { apiKeyAuth } = require('../middleware/auth');

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the AlgoHire Webhook Relay API' });
});

// This route is for internal services and does not need the API key
router.use('/events', require('./events.route'));

// These routes are for the dashboard and must be protected by the API key middleware
router.use('/subscriptions', apiKeyAuth, require('./subscriptions.route'));
router.use('/logs', apiKeyAuth, require('./logs.route'));

module.exports = router;