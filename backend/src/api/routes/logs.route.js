const express = require('express');
const router = express.Router();
const { listLogs } = require('../controllers/logs.controller');

router.get('/', listLogs);

module.exports = router;