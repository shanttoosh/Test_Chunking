import React from 'react';

export default function Step2TypeConversion({ previewColumns = [], setPreviewColumns, setCsvPreviewData, onBack, onNext }) {
  return (
    <div className="config-step" data-step="2">
      <div className="step-header">
        <h3>🔄 Data Type Conversion</h3>
        <p>Manually specify data types for each column</p>
      </div>

      <div className="type-conversion-grid">
        {previewColumns.map((col, index) => (
          <div key={index} className="conversion-item">
            <div className="column-info">
              <h4>{col.name}</h4>
              <span className="current-type">Current: {col.type}</span>
            </div>
            <select
              className="form-control"
              defaultValue="no-change"
              onChange={(e) => {
                const newType = e.target.value;
                if (newType !== 'no-change') {
                  setPreviewColumns((prev) => prev.map((c, i) => (i === index ? { ...c, type: newType } : c)));
                  setCsvPreviewData((prev) =>
                    prev.map((row) => {
                      const newRow = { ...row };
                      if (newType === 'numeric') {
                        newRow[col.name] = typeof row[col.name] === 'number' ? row[col.name] : row[col.name] === null ? null : parseFloat(row[col.name]) || 0;
                      } else if (newType === 'datetime') {
                        newRow[col.name] = row[col.name] === null ? null : new Date(row[col.name]).toISOString().split('T')[0];
                      } else if (newType === 'text') {
                        newRow[col.name] = row[col.name] === null ? null : String(row[col.name]);
                      }
                      return newRow;
                    })
                  );
                }
              }}
            >
              <option value="no-change">No change</option>
              <option value="text">Text</option>
              <option value="numeric">Numeric</option>
              <option value="datetime">DateTime</option>
            </select>
          </div>
        ))}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Apply Type Conversion</button>
      </div>
    </div>
  );
}


