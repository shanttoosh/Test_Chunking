import React from 'react';

export default function Step2TypeConversion({ previewColumns, setPreviewColumns, csvPreviewData, setCsvPreviewData, onBack, onNext }) {
  const handleTypeChange = (columnName, newType) => {
    setPreviewColumns(prev => prev.map(col => 
      col.name === columnName ? { ...col, type: newType } : col
    ));
  };

  return (
    <div className="config-step" data-step="2">
      <div className="step-header">
        <h3>🔄 Data Type Conversion</h3>
        <p>Convert column data types for better processing</p>
      </div>
      
      <div className="type-conversion-grid">
        {previewColumns.map((column, index) => (
          <div key={index} className="type-conversion-item">
            <div className="column-info">
              <h4>{column.name}</h4>
              <span className="current-type">Current: {column.type}</span>
            </div>
            <select 
              value={column.type} 
              onChange={(e) => handleTypeChange(column.name, e.target.value)}
              className="type-select"
            >
              <option value="object">Text</option>
              <option value="int64">Integer</option>
              <option value="float64">Float</option>
              <option value="datetime64">DateTime</option>
              <option value="bool">Boolean</option>
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


