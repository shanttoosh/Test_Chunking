import React from 'react';

export default function Step12Retrieval({
  similarityMetric, setSimilarityMetric,
  topK, setTopK,
  query, setQuery,
  onBack, onSearch, onComplete
}) {
  return (
    <div className="config-step" data-step="12">
      <div className="step-header">
        <h3>🔎 Retrieval</h3>
        <p>Search stored vectors with your preferred similarity</p>
      </div>

      <div className="retrieval-config">
        <div className="form-group">
          <label className="form-label">Similarity Metric</label>
          <select className="form-control" value={similarityMetric} onChange={(e) => setSimilarityMetric(e.target.value)}>
            <option value="cosine">Cosine</option>
            <option value="dot">Dot</option>
            <option value="euclidean">Euclidean</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Top K</label>
          <input type="number" className="form-control" value={topK} min="1" max="50" onChange={(e) => setTopK(Number(e.target.value))} />
        </div>
        <div className="form-group">
          <label className="form-label">Search Query</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter your search query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          />
        </div>
        <div className="action-group">
          <button className="btn btn-primary" onClick={onSearch}>Search</button>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-success" onClick={onComplete}>Complete Process</button>
      </div>
    </div>
  );
}


