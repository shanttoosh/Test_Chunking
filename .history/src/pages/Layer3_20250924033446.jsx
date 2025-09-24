import React from 'react';
import QueryBar from '../components/QueryBar';

export default function Layer3({ 
  show, 
  fileUploaded, 
  showQuerySection, 
  query, 
  setQuery, 
  performQuery, 
  queryResults,
  onCloseQuery,
  render 
}) {
  if (!show || !fileUploaded) return null;
  
  return (
    <div className="content-section active">
      {showQuerySection ? (
        <div className="query-section show">
          <div className="query-header">
            <h3>🔍 Test Retrieval</h3>
            <button 
              className="close-btn" 
              onClick={() => {/* This will be handled by parent */}}
            >
              ×
            </button>
          </div>
          <QueryBar value={query} onChange={setQuery} onSubmit={performQuery} />
          <div className="query-results">
            {queryResults.map((result, index) => (
              <div key={index} className="query-result-item">
                <div className="query-result-title">Chunk {result.id} (Score: {result.score.toFixed(3)})</div>
                <div className="query-result-content">{result.content}</div>
                <div className="query-result-metadata">Source: {result.metadata?.source || 'Unknown'}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="deep-config-container">
          {typeof render === 'function' ? render() : null}
        </div>
      )}
    </div>
  );
}


