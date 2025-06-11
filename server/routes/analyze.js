const express = require('express');
const router = express.Router();
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const TEXTRAZOR_API_KEY = process.env.TEXTRAZOR ;

function calculateKeywordDensity(text, keyword) {
    if (!keyword) return 0;
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    const words = text.split(/\s+/).length;
    return ((count / words) * 100).toFixed(2);
}

function calculateReadability(text) {
    const sentences = text.split(/[.!?]/).filter(Boolean).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / Math.max(sentences, 1);
    if (avgWordsPerSentence < 15) return "Easy";
    if (avgWordsPerSentence < 25) return "Medium";
    return "Difficult";
}

router.post('/', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided' });

    try {
        // Call TextRazor API
        const response = await axios.post(
            'https://api.textrazor.com/',
            `text=${encodeURIComponent(text)}&extractors=entities,topics`,
            {
                headers: {
                    'x-textrazor-key': TEXTRAZOR_API_KEY,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        const data = response.data;
        const entities = (data.response.entities || [])
            .filter(e => e.relevanceScore > 0.5 && e.id)
            .map(e => e.entityId.toLowerCase());
        const topics = (data.response.topics || [])
            .filter(t => t.score > 0.5 && t.label)
            .map(t => t.label.toLowerCase());
        const categories = (data.response.categories || [])
            .filter(cat => typeof cat.label === 'string' && typeof cat.score === 'number')
            .map(cat => ({
                label: cat.label,
                score: cat.score
            }));


        // SEO Metrics
        const topEntity = entities[0] || topics[0] || '';
        const keywordDensity = calculateKeywordDensity(text, topEntity);
        const readability = calculateReadability(text);
         const coarseTopics = (data.response.coarseTopics || [])
        .filter(topic => topic.score > 0.5 && topic.label)
        .map(topic => ({
            label: topic.label.toLowerCase(),
            score: topic.score
        }));

        // Recommend keywords not present in text
        const presentWords = new Set(text.toLowerCase().split(/\W+/));
        const recommendedKeywords = [...new Set([...entities, ...topics])]
            .filter(word => word && !presentWords.has(word))
            .slice(0, 10);

        res.json({
            seo_metrics: {
                readability,
                keyword_density: `${keywordDensity}%`,
                coarse_topics: coarseTopics,
            },
            recommended_keywords: recommendedKeywords
        });
    } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to analyze text' });
    }
});

module.exports = router;