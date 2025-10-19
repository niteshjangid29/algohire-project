const db = require('../../config/db');
const crypto = require('crypto');

// GET /api/subscriptions
const listSubscriptions = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, event_type, endpoint_url, is_active FROM subscriptions ORDER BY created_at DESC');
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching subscriptions:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// POST /api/subscriptions
const createSubscription = async (req, res) => {
    const { eventType, endpointUrl } = req.body;

    if (!eventType || !endpointUrl) {
        return res.status(400).json({ error: 'eventType and endpointUrl are required.' });
    }

    // Generate a secure, random secret key for HMAC signatures
    const secretKey = crypto.randomBytes(32).toString('hex');

    try {
        const result = await db.query(
            'INSERT INTO subscriptions (event_type, endpoint_url, secret_key) VALUES ($1, $2, $3) RETURNING id, event_type, endpoint_url, is_active, created_at',
            [eventType, endpointUrl, secretKey]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if (error.code === '23505') { // Unique violation error code
            return res.status(409).json({ error: 'This endpoint is already subscribed to this event type.' });
        }
        console.error('Error creating subscription:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    listSubscriptions,
    createSubscription,
};