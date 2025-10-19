import axios from 'axios';

// This creates a pre-configured instance of axios.
// All requests made with this client will automatically include the base URL and the API key.
const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        // IMPORTANT: Next.js requires the NEXT_PUBLIC_ prefix for client-side environment variables
        'X-API-Key': process.env.NEXT_PUBLIC_API_KEY,
    },
});

export default apiClient;