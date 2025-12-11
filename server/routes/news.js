const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET api/news
// @desc    Get forest and environment related news
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Option 1: Use NewsAPI if key exists
        if (process.env.NEWS_API_KEY) {
            const response = await axios.get(`https://newsapi.org/v2/everything?q=deforestation+forest+climate&apiKey=${process.env.NEWS_API_KEY}&language=en&sortBy=publishedAt&pageSize=10`);
            return res.json(response.data.articles);
        }

        // Option 2: Fallback Mock Data
        const mockNews = [
            {
                source: { name: "Environment Daily" },
                author: "Sarah Green",
                title: "Global Deforestation Rates Slow Down in 2024",
                description: "New satellite data reveals a promising trend in global forest conservation efforts.",
                url: "#",
                urlToImage: "https://images.unsplash.com/photo-1542601906990-24d4c16419d9?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date().toISOString(),
                content: "Detailed analysis of recent forest cover changes..."
            },
            {
                source: { name: "Tech for Nature" },
                author: "Mike Rivers",
                title: "AI Tools Revolutionize Forest Monitoring",
                description: "How machine learning is helping rangers protect endangered biodiversity hotspots.",
                url: "#",
                urlToImage: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                content: "The latest algorithms are detecting chainsaw sounds in real-time..."
            },
            {
                source: { name: "Climate Watch" },
                author: "Emma Stone",
                title: "Pakistan's Billion Tree Tsunami Project Updates",
                description: "An in-depth look at the progress of one of the world's largest reforestation initiatives.",
                url: "#",
                urlToImage: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 172800000).toISOString(),
                content: "Local communities are seeing the benefits of restored green cover..."
            }
        ];

        res.json(mockNews);

    } catch (err) {
        console.error('News Fetch Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
