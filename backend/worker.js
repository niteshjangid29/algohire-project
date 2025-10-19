// --- FIX: dotenv.config() should be at the very top ---
require('dotenv').config();

const { Worker } = require('bullmq');
const crypto = require('crypto');
const axios = require('axios');
const db = require('./src/config/db');
const { Redis } = require('ioredis');

// --- FIX: Added a retry mechanism for the database connection ---
const connectWithRetry = async (retries = 5, delay = 5000) => {
    while (retries > 0) {
        try {
            await db.testConnection();
            console.log('✅ Database connection successful on startup.');
            return;
        } catch (err) {
            retries--;
            console.log(`... Database connection failed. Retrying in ${delay / 1000}s. (${retries} retries left)`);
            if (retries === 0) {
                console.error('❌ Could not connect to the database after multiple retries. Exiting.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
};
// -----------------------------------------------------------------

const startWorker = async () => {
    console.log('🚀 Starting background worker...');

    // Wait for DB connection before proceeding
    await connectWithRetry();

    // Redis client for caching
    const redisClient = new Redis(process.env.REDIS_URL);
    redisClient.on('error', err => console.error('❌ Redis Cache Client Error', err));
    redisClient.on('connect', () => console.log('✅ Redis Cache Client Connected'));

    const connectionOptions = {
        connection: {
            url: process.env.REDIS_URL,
        },
    };

    const worker = new Worker('event-queue', async (job) => {
        const { eventId, eventType } = job.data;
        console.log(`[Worker] Processing job for event ID: ${eventId} (${eventType})`);

        try {
            const eventResult = await db.query('SELECT payload FROM events WHERE id = $1', [eventId]);
            if (eventResult.rows.length === 0) {
                throw new Error(`Event with ID ${eventId} not found.`);
            }
            const eventPayload = eventResult.rows[0].payload;
            const requestBody = JSON.stringify(eventPayload);

            const cacheKey = `subscribers:${eventType}`;
            let subscribers;

            const cachedSubscribers = await redisClient.get(cacheKey);

            if (cachedSubscribers) {
                subscribers = JSON.parse(cachedSubscribers);
                console.log(`[Cache] HIT: Found ${subscribers.length} subscribers for event type "${eventType}" in cache.`);
            } else {
                console.log(`[Cache] MISS: No subscribers for event type "${eventType}" in cache. Querying DB.`);
                const subsResult = await db.query(
                    'SELECT id, endpoint_url, secret_key FROM subscriptions WHERE event_type = $1 AND is_active = TRUE',
                    [eventType]
                );
                subscribers = subsResult.rows;
                await redisClient.set(cacheKey, JSON.stringify(subscribers), 'EX', 60);
            }

            for (const sub of subscribers) {
                let status = 'failed';
                let responseStatusCode = null;
                let responseBody = null;
                try {
                    const signature = crypto.createHmac('sha256', sub.secret_key).update(requestBody).digest('hex');
                    const response = await axios.post(sub.endpoint_url, requestBody, {
                        headers: { 'Content-Type': 'application/json', 'X-AlgoHire-Signature': signature },
                        timeout: 5000,
                    });
                    status = 'success';
                    responseStatusCode = response.status;
                    responseBody = JSON.stringify(response.data);
                } catch (error) {
                    responseStatusCode = error.response ? error.response.status : 500;
                    responseBody = error.response ? JSON.stringify(error.response.data) : error.message;
                    throw error;
                } finally {
                    await db.query(
                        'INSERT INTO delivery_logs (subscription_id, event_id, status, response_status_code, response_body) VALUES ($1, $2, $3, $4, $5)',
                        [sub.id, eventId, status, responseStatusCode, responseBody]
                    );
                }
            }
        } catch (error) {
            console.error(`[Worker] Critical error processing job for event ${eventId}:`, error.message);
            throw error;
        }
    }, connectionOptions);

    worker.on('completed', (job) => {
        console.log(`[Worker] Job ${job.id} has completed successfully.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`[Worker] Job ${job.id} has failed after attempts. Error: ${err.message}`);
    });
};

startWorker();

