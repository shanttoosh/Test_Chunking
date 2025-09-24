import React, { useState } from 'react';

export default function L2Preprocess({ onNext }) {
  const [nullStrategy, setNullStrategy] = useState('skip');
  const [typeMap, setTypeMap] = useState({});

  return (
    <div className="config-step" data-l2="preprocess">
      <div className="step-header">
        <h3>Default Preprocessing</h3>
        <p>Null handling and data type assignment</p>
      </div>

      <div className="option-group">
        <h4>Null Handling</h4>
        <div className="radio-list">
          <label><input type="radio" name="null" value="skip" checked={nullStrategy==='skip'} onChange={()=>setNullStrategy('skip')} /> Skip</label>
          <label><input type="radio" name="null" value="drop_rows" checked={nullStrategy==='drop_rows'} onChange={()=>setNullStrategy('drop_rows')} /> Drop rows</label>
          <label><input type="radio" name="null" value="mode" checked={nullStrategy==='mode'} onChange={()=>setNullStrategy('mode')} /> Fill with mode</label>
        </div>
      </div>

      <div className="option-group">
        <h4>Data Types</h4>
        <p>Configure per-column types in backend-connected mode.</p>
      </div>

      <div className="step-actions">
        <button className="btn btn-primary" onClick={onNext}>Apply</button>
      </div>
    </div>
  );
}


