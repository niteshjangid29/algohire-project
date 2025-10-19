const { Queue } = require('bullmq');
require('dotenv').config();

const connectionOptions = {
    connection: {
        url: process.env.REDIS_URL,
    },
};

// Create and export the queue. We'll name it 'event-queue'.
const eventQueue = new Queue('event-queue', connectionOptions);

console.log('✅ Event queue initialized and connected to Redis.');

module.exports = eventQueue;