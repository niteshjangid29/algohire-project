const express = require('express');
const router = express.Router();
const { listSubscriptions, createSubscription } = require('../controllers/subscriptions.controller');

router.get('/', listSubscriptions);
router.post('/', createSubscription);

module.exports = router;