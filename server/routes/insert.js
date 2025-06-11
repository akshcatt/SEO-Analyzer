const express = require('express');
const axios = require('axios');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const GROQ_API_KEY = process.env.GROQ ;


function buildPrompt(text, keyword) {
  return `
You are an expert copywriter. Insert the keyword "${keyword}" into the provided text in a natural and coherent way, without distorting the meaning or flow. Do not simply append the keyword; integrate it smoothly into the sentences. If the keyword is already present, you may enhance its usage. Return only the revised text.
keep the inserted keyword density below 2% of the total word count.
Original text:
"${text}"
`;
}

router.post('/', async (req, res) => {
  const { text, keyword } = req.body;
  if (!text || !keyword) {
    return res.status(400).json({ error: 'Text and a single keyword are required.' });
  }

  try {
    const prompt = buildPrompt(text, keyword);

    // Groq's OpenAI-compatible endpoint
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile', // or 'llama-3-8b-8192', etc.
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1024,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Groq returns choices[0].message.content
    const revisedText = response.data.choices[0].message.content.trim();

    res.json({
      revised_text: revisedText
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to insert keyword using Groq LLM.' });
  }
});

module.exports = router;

