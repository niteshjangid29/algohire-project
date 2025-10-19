const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');

    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: API Key is missing.' });
    }

    if (apiKey !== process.env.INTERNAL_API_KEY) {
        return res.status(403).json({ error: 'Forbidden: Invalid API Key.' });
    }

    next();
};

module.exports = { apiKeyAuth };