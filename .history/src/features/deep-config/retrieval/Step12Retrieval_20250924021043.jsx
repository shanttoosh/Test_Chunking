import React from 'react';

export default function Step12Retrieval({ 
  similarityMetric, setSimilarityMetric,
  query, setQuery, topK, setTopK,
  onBack, onSearch, onComplete 
}) {
  return (
    <div className="config-step" data-step="12">
      <div className="step-header">
        <h3>🔍 Retrieval Testing</h3>
        <p>Test your vector search with sample queries</p>
      </div>
      
      <div className="retrieval-config">
        <div className="search-settings">
          <h4>Search Configuration</h4>
          <div className="settings-grid">
            <label>
              Similarity Metric
              <select 
                value={similarityMetric} 
                onChange={(e) => setSimilarityMetric(e.target.value)}
              >
                <option value="cosine">Cosine</option>
                <option value="dot">Dot Product</option>
                <option value="euclidean">Euclidean</option>
              </select>
            </label>
            <label>
              Top K Results
              <input 
                type="number" 
                value={topK} 
                onChange={(e) => setTopK(parseInt(e.target.value))}
                min="1"
                max="20"
              />
            </label>
          </div>
        </div>

        <div className="query-section">
          <h4>Test Query</h4>
          <div className="query-input-group">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your search query..."
              className="query-input"
            />
            <button 
              className="btn btn-primary" 
              onClick={onSearch}
              disabled={!query.trim()}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-success" onClick={onComplete}>Complete Process</button>
      </div>
    </div>
  );
}


