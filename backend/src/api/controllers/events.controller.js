const db = require('../../config/db');
const eventQueue = require('../../config/queue');

const createEvent = async (req, res) => {
    const { eventType, payload } = req.body;

    if (!eventType || !payload) {
        return res.status(400).json({ error: 'eventType and payload are required.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO events (event_type, payload) VALUES ($1, $2) RETURNING id',
            [eventType, payload]
        );

        const eventId = result.rows[0].id;

        // --- Add job to the queue with retry options ---
        await eventQueue.add(
            'process-event',
            { eventId, eventType },
            {
                attempts: 3, // Total attempts: 1 initial + 2 retries
                backoff: {
                    type: 'exponential',
                    delay: 5000, // Start with a 5-second delay
                },
            }
        );
        console.log(`[Queue] Added job for event ID: ${eventId} with 3 retry attempts.`);
        // ------------------------------------------------

        res.status(202).json({
            status: 'success',
            message: 'Event received and queued for processing.',
            eventId: eventId,
        });
    } catch (error) {
        console.error('Error in createEvent controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    createEvent,
};