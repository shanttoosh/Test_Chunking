import React from 'react';

export default function Step4DuplicateHandling({ csvPreviewData, setCsvPreviewData, onBack, onNext }) {
  const duplicateCount = 0; // This would be calculated from actual data

  return (
    <div className="config-step" data-step="4">
      <div className="step-header">
        <h3>🔄 Duplicate Handling</h3>
        <p>Remove or keep duplicate rows in your data</p>
      </div>
      
      <div className="duplicate-handling-section">
        <div className="duplicate-summary">
          <h4>Duplicate Analysis</h4>
          <div className="duplicate-stats">
            <span className="duplicate-count">Found {duplicateCount} duplicate rows</span>
          </div>
        </div>

        <div className="duplicate-options">
          <h4>Handling Options</h4>
          <div className="radio-group">
            <label className="radio-item">
              <input type="radio" name="duplicate-strategy" value="keep" defaultChecked />
              <span>Keep duplicates (no action)</span>
            </label>
            <label className="radio-item">
              <input type="radio" name="duplicate-strategy" value="remove" />
              <span>Remove duplicate rows</span>
            </label>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Apply Duplicate Handling</button>
      </div>
    </div>
  );
}


