router.get('/config', (req, res) => {
    res.json({
        apiKey: process.env.OPENAI_API_KEY
    });
});