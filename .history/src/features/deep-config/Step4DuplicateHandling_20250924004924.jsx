import React from 'react';

export default function Step4DuplicateHandling({ csvPreviewData = [], setCsvPreviewData, onBack, onNext }) {
  const duplicateCount = (() => {
    const dups = csvPreviewData.filter((row, index) => csvPreviewData.findIndex((r) => JSON.stringify(r) === JSON.stringify(row)) !== index);
    return dups.length;
  })();

  return (
    <div className="config-step" data-step="4">
      <div className="step-header">
        <h3>🔄 Duplicate Handling</h3>
        <p>Remove or keep duplicate rows in your dataset</p>
      </div>

      <div className="duplicate-info">
        <div className="info-card">
          <h4>Duplicate Analysis</h4>
          <div className="metric">
            <span className="metric-value">{duplicateCount}</span>
            <span className="metric-label">Duplicate Rows Found</span>
          </div>
          <p>{duplicateCount > 0 ? `${duplicateCount} duplicate rows detected.` : 'No duplicate rows detected in your dataset.'}</p>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const uniqueData = csvPreviewData.filter((row, index) => csvPreviewData.findIndex((r) => JSON.stringify(r) === JSON.stringify(row)) === index);
            setCsvPreviewData(uniqueData);
            onNext();
          }}
        >
          Remove Duplicates & Proceed
        </button>
      </div>
    </div>
  );
}


