import React from 'react';

export default function Step3NullHandling({ previewColumns, setPreviewColumns, csvPreviewData, setCsvPreviewData, selectedNullColumn, setSelectedNullColumn, onBack, onNext }) {
  const columnsWithNulls = previewColumns.filter(col => col.nulls > 0);

  return (
    <div className="config-step" data-step="3">
      <div className="step-header">
        <h3>🚫 Null Value Handling</h3>
        <p>Handle missing values in your data</p>
      </div>
      
      <div className="null-handling-section">
        <div className="null-summary">
          <h4>Columns with Null Values</h4>
          {columnsWithNulls.length > 0 ? (
            <div className="null-columns-list">
              {columnsWithNulls.map((col, index) => (
                <div key={index} className="null-column-item">
                  <span className="column-name">{col.name}</span>
                  <span className="null-count">{col.nulls} nulls</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-nulls">No null values detected in your data.</p>
          )}
        </div>

        {columnsWithNulls.length > 0 && (
          <div className="null-strategy">
            <h4>Handling Strategy</h4>
            <select 
              value={selectedNullColumn} 
              onChange={(e) => setSelectedNullColumn(e.target.value)}
              className="column-select"
            >
              <option value="">Select column to handle</option>
              {columnsWithNulls.map((col, index) => (
                <option key={index} value={col.name}>{col.name}</option>
              ))}
            </select>
            
            {selectedNullColumn && (
              <div className="strategy-options">
                <label><input type="radio" name="strategy" value="skip" defaultChecked /> Skip (leave as is)</label>
                <label><input type="radio" name="strategy" value="drop" /> Drop rows with nulls</label>
                <label><input type="radio" name="strategy" value="fill" /> Fill with default value</label>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Apply Null Handling</button>
      </div>
    </div>
  );
}


