import React from 'react';

export default function Step0Preview({ uploadedFile, onNext }) {
  if (!uploadedFile) return null;
  return (
    <div className="config-step" data-step="0">
      <div className="step-header">
        <h3>📊 Data Preview & Analysis</h3>
        <p>Review your uploaded data and proceed with preprocessing</p>
      </div>
      <div className="data-preview">
        <div className="preview-header">
          <h4>File: {uploadedFile.name}</h4>
          <div className="file-stats">
            <span>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
            <span>Type: CSV</span>
          </div>
        </div>
        <div className="step-actions">
          <button className="btn btn-primary" onClick={onNext}>
            Run Default Preprocessing
          </button>
        </div>
      </div>
    </div>
  );
}


