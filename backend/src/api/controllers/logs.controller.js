const db = require('../../config/db');

// GET /api/logs
const listLogs = async (req, res) => {
    try {
        // We use a JOIN to get the endpoint_url from the subscriptions table
        const { rows } = await db.query(`
      SELECT 
        dl.id, 
        dl.status, 
        dl.response_status_code, 
        dl.attempted_at,
        s.endpoint_url,
        e.event_type
      FROM 
        delivery_logs dl
      JOIN 
        subscriptions s ON dl.subscription_id = s.id
      JOIN 
        events e ON dl.event_id = e.id
      ORDER BY 
        dl.attempted_at DESC
      LIMIT 100;
    `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching delivery logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    listLogs,
};