import React from 'react';
import QueryBar from '../components/QueryBar';
import { FastModeProcessor } from '../features/fast-mode';

export default function Layer1({
  show,
  showQuerySection,
  query,
  setQuery,
  performQuery,
  queryResults,
  uploadedFile,
  onProcess,
  isProcessing
}) {
  if (!show) return null;
  return (
    <div className="content-section active">
      {showQuerySection ? (
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
      ) : (
        <FastModeProcessor
          uploadedFile={uploadedFile}
          onProcess={onProcess}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
}


