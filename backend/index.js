require('dotenv').config();
const app = require('./src/app');
const db = require('./src/config/db');

const PORT = process.env.PORT || 8000;

// This is the line that starts the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});