const express = require('express');
const app = express();
const cors = require('cors');
const apiRouter = require('./api/routes');

// Middleware to parse JSON bodies
app.use(express.json());

const corsOptions = {
    origin: 'http://localhost:3000', // Allow all origins - adjust as needed for security
};
// Enable CORS for all routes
app.use(cors(corsOptions));

// A simple health-check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Mount the main API router
app.use('/api', apiRouter);

module.exports = app;