import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
const apiUrl = import.meta.env.VITE_API_URL; // Base URL for your backend API

function App() {
  const [inputValue, setInputValue] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [readabilityScore, setReadabilityScore] = useState(null);
  const [updatedText, setUpdatedText] = useState('');
  const [coarseTopics, setCoarseTopics] = useState([]);
  const [keywordDensity, setKeywordDensity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
const [insertedKeywords, setInsertedKeywords] = useState([]);


  const handleSubmit = async () => {
    setLoading(true);
    setInsertedKeywords([]);
    try {
      const response = await axios.post(`${apiUrl}/analyze`, { text: inputValue });
      setKeywords(response.data.recommended_keywords || []);
      setReadabilityScore(response.data.seo_metrics?.readability || null);
      setKeywordDensity(response.data.seo_metrics?.keyword_density || null);
      setCoarseTopics(response.data.seo_metrics?.coarse_topics || []);
      setUpdatedText(inputValue);
    } catch (error) {
      console.error('Error during SEO analysis:', error);
    }
    setLoading(false);
  };

  const handleInsertKeyword = async (keyword) => {
  setLoading(true);
  try {
    const response = await axios.post(`${apiUrl}/insert-keyword`, {
      text: updatedText,
      keyword: keyword
    });
    setUpdatedText(response.data.revised_text);

    // Add the keyword to insertedKeywords if not already present
    setInsertedKeywords(prev =>
      prev.includes(keyword) ? prev : [...prev, keyword]
    );
  } catch (error) {
    console.error('Error inserting keyword:', error);
  }
  setLoading(false);
};

const handleCopy = () => {
  navigator.clipboard.writeText(updatedText);
  setCopied(true);
  setTimeout(() => setCopied(false), 1500); // Reset after 1.5 seconds
};

  return (
    <div className="app-container">
      <header>
        <h1 className="main-title">SEO - ANALYZER</h1>
      </header>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-modal">
            <p>Loading...</p>
          </div>
        </div>
      )}

      <div className="main-content">
        {/* Side-by-side Input and Updated Text */}
        <div className="side-by-side">
          <section className="input-section">
            <h3>Input Text</h3>
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type or paste your content here..."
              rows={12}
            />
            <button id= "analyze-btn" onClick={handleSubmit}>Analyze</button>
          </section>

          <section className="updated-text-section">
            <h3>
              Updated Text
              <button
  className="copy-btn"
  onClick={handleCopy}
  disabled={copied}
>
  {copied ? 'Copied' : 'Copy'}
</button>

            </h3>
            <div className="updated-text-container">
              {updatedText}
            </div>
          </section>
        </div>

        {/* SEO Analysis and Keywords */}
        <div className="bottom-sections">
          <section className="seo-analysis-section">
            <h3>SEO Analysis</h3>
            {readabilityScore && (
              <p><strong>Readability:</strong> {readabilityScore}</p>
            )}
            {keywordDensity && (
              <p><strong>Keyword Density:</strong> {keywordDensity}</p>
            )}
            {coarseTopics.length > 0 && (
              <>
                <h4>Related Topics:</h4>
                <ul>
                  {coarseTopics.map((topic, idx) => (
                    <li key={idx}>
                      {topic.label} ({topic.score*100} % Match)
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <section className="recommended-keywords-section">
            <h3>Recommended Keywords</h3>
          <ul>
  {keywords.map((keyword, index) => (
    <li key={index}>
      {keyword}
      <button
        onClick={() => handleInsertKeyword(keyword)}
        disabled={insertedKeywords.includes(keyword)}
      >
        {insertedKeywords.includes(keyword) ? 'Inserted' : 'Insert'}
      </button>
    </li>
  ))}
</ul>

          </section>
        </div>
      </div>
    </div>
  );
}

export default App;

