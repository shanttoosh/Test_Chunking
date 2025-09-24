import React from 'react';

export default function Step5TextProcessing({ previewColumns, csvPreviewData, setCsvPreviewData, onBack, onNext }) {
  const textColumns = previewColumns.filter(col => col.type === 'object');

  return (
    <div className="config-step" data-step="5">
      <div className="step-header">
        <h3>📝 Text Processing</h3>
        <p>Clean and normalize text data</p>
      </div>
      
      <div className="text-processing-section">
        <div className="text-columns">
          <h4>Text Columns Found</h4>
          {textColumns.length > 0 ? (
            <div className="text-columns-list">
              {textColumns.map((col, index) => (
                <div key={index} className="text-column-item">
                  <span className="column-name">{col.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-text">No text columns detected.</p>
          )}
        </div>

        <div className="text-options">
          <h4>Processing Options</h4>
          <div className="checkbox-group">
            <label className="checkbox-item">
              <input type="checkbox" />
              <span>Remove stop words</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" />
              <span>Apply lemmatization</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" />
              <span>Convert to lowercase</span>
            </label>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Apply Text Processing</button>
      </div>
    </div>
  );
}


