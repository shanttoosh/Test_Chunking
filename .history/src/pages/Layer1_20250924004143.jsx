import React from 'react';
import QueryBar from '../components/QueryBar';

export default function Layer1({
  show,
  showQuerySection,
  query,
  setQuery,
  performQuery,
  queryResults
}) {
  if (!show) return null;
  return (
    <div className="content-section active">
      <div className="simple-processing">
        {showQuerySection && (
          <div className="query-section show">
            <QueryBar value={query} onChange={setQuery} onSubmit={performQuery} />
            <div className="query-results">
              {queryResults.map((result, index) => (
                <div key={index} className="query-result-item">
                  <div className="query-result-title">{result.title}</div>
                  <div className="query-result-content">{result.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


