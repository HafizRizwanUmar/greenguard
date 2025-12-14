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

        // Option 2: Fallback Mock Data - Professional Sources
        const mockNews = [
            {
                source: { name: "Nature Climate Change" },
                author: "Scientific Editorial",
                title: "Satellite analysis reveals shifting patterns in tropical deforestation",
                description: "New study using high-resolution imagery suggests a 15% reduction in primary forest loss in key Amazonian regions, attributed to stricter enforcement.",
                url: "https://www.nature.com/nclimate/",
                urlToImage: "https://images.unsplash.com/photo-1542601906990-24d4c16419d9?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date().toISOString(),
                content: "Detailed analysis of recent forest cover changes..."
            },
            {
                source: { name: "FAO Forestry" },
                author: "United Nations FAO",
                title: "State of the World's Forests 2025 Report Released",
                description: "The Food and Agriculture Organization (FAO) emphasizes the critical role of forest innovation in addressing the climate crisis.",
                url: "https://www.fao.org/forestry/en/",
                urlToImage: "https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 86400000).toISOString(),
                content: "New strategies for sustainable forest management..."
            },
            {
                source: { name: "NASA Earth Observatory" },
                author: "NASA Earth Science News",
                title: "Tracking Vegetation Health from Space",
                description: "How new spectral indices are helping scientists predict drought stress in boreal forests before visible damage occurs.",
                url: "https://earthobservatory.nasa.gov/",
                urlToImage: "https://images.unsplash.com/photo-1448375240586-dfd8d395ea6c?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 172800000).toISOString(),
                content: "Remote sensing data provides early warnings..."
            },
            {
                source: { name: "Science Daily" },
                author: "Environmental Research Group",
                title: "Reforestation efforts show higher survival rates with native species",
                description: "A 10-year study concludes that monoculture plantations differ significantly from restored native biodiversity in carbon sequestration.",
                url: "https://www.sciencedaily.com/",
                urlToImage: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 259200000).toISOString(),
                content: "Long-term study results..."
            },
            {
                source: { name: "Global Forest Watch" },
                author: "Data Insights Team",
                title: "Real-time alerts help reduce illegal logging in Protected Areas",
                description: "Integration of GLAD alerts with mobile ranger units has decreased illegal incursions by 40% in pilot districts.",
                url: "https://www.globalforestwatch.org/",
                urlToImage: "https://images.unsplash.com/photo-1418065460487-3e41a6c84dc5?q=80&w=1000&auto=format&fit=crop",
                publishedAt: new Date(Date.now() - 500000000).toISOString(),
                content: "Technology empowering local enforcement..."
            }
        ];

        res.json(mockNews);

    } catch (err) {
        console.error('News Fetch Error:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
