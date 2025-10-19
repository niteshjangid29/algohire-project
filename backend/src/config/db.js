const { Pool } = require('pg');

const pool = new Pool({
    // The DATABASE_URL is loaded from the .env file in the main index.js
    connectionString: process.env.DATABASE_URL,
});

pool.on('connect', () => {
    console.log('✅ Successfully connected to PostgreSQL database.');
});

// --- FIX: Added error handling for failed connections ---
pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    // Function to test the connection on startup
    testConnection: async () => {
        try {
            await pool.query('SELECT NOW()');
        } catch (err) {
            console.error('❌ Failed to connect to the database:', err);
            throw err;
        }
    }
};
