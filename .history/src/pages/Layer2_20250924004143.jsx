import React from 'react';
import QueryBar from '../components/QueryBar';

export default function Layer2({
  show,
  showConfigBoxes,
  showQuerySection,
  performQuery,
  queryLayer2,
  setQueryLayer2,
  queryResultsLayer2,
  startProcessingLayer2,
  isProcessing,
  showConfigBoxesLayer2
}) {
  if (!show) return null;
  return (
    <div className="content-section active">
      {showConfigBoxes && (
        <div className="config-grid">{/* existing config JSX remains in App for now */}</div>
      )}

      {showQuerySection && (
        <div className="query-section show">
          <QueryBar value={queryLayer2} onChange={setQueryLayer2} onSubmit={performQuery} />
          <div className="query-results">
            {queryResultsLayer2.map((result, index) => (
              <div key={index} className="query-result-item">
                <div className="query-result-title">{result.title}</div>
                <div className="query-result-content">{result.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="action-buttons">
        <button className="btn btn-success" onClick={startProcessingLayer2} disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Start Processing'}
        </button>
        {showQuerySection && (
          <button className="btn btn-secondary" onClick={showConfigBoxesLayer2}>← Back to Config</button>
        )}
      </div>
    </div>
  );
}


