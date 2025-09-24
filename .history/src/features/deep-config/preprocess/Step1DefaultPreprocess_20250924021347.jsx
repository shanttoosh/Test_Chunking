import React from 'react';

export default function Step1DefaultPreprocess({ onNext }) {
  return (
    <div className="config-step" data-step="1">
      <div className="step-header">
        <h3>🔧 Default Preprocessing</h3>
        <p>Apply initial data cleaning and validation</p>
      </div>
      <div className="preprocessing-options">
        <div className="option-group">
          <h4>Data Validation</h4>
          <div className="checkbox-list">
            <label className="checkbox-item"><input type="checkbox" defaultChecked /> <span>Validate headers</span></label>
            <label className="checkbox-item"><input type="checkbox" defaultChecked /> <span>Detect encoding issues</span></label>
            <label className="checkbox-item"><input type="checkbox" defaultChecked /> <span>Remove empty rows</span></label>
          </div>
        </div>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={onNext}>Run Default Preprocessing</button>
      </div>
    </div>
  );
}


