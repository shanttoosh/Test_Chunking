import React, { useState } from 'react';

export default function L2ChunkingDocument({ columns = [], onApply }) {
  const [useMultipleKeys, setUseMultipleKeys] = useState(false);
  const [keyColumn, setKeyColumn] = useState('');
  const [keyColumns, setKeyColumns] = useState([]);
  const [tokenLimit, setTokenLimit] = useState(2000);
  const [modelName, setModelName] = useState('gpt-4');

  return (
    <div className="config-step" data-l2="chunking-document">
      <div className="step-header">
        <h3>Chunking - Document Based</h3>
        <p>Group by key column(s) and split by token limit</p>
      </div>
      <div className="option-group">
        <label><input type="checkbox" checked={useMultipleKeys} onChange={e=>setUseMultipleKeys(e.target.checked)} /> Use multiple key columns</label>
      </div>
      <div className="form-grid two">
        {!useMultipleKeys ? (
          <label>Key Column
            <select value={keyColumn} onChange={e=>setKeyColumn(e.target.value)}>
              <option value="">Select...</option>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        ) : (
          <label>Key Columns
            <select multiple value={keyColumns} onChange={e=> setKeyColumns(Array.from(e.target.selectedOptions).map(o=>o.value))}>
              {columns.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        )}
        <label>Token Limit per chunk
          <input type="number" value={tokenLimit} min={100} onChange={e=>setTokenLimit(parseInt(e.target.value||'0',10))} />
        </label>
        <label>Token Model
          <select value={modelName} onChange={e=>setModelName(e.target.value)}>
            <option value="gpt-4">gpt-4</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
            <option value="cl100k_base">cl100k_base</option>
          </select>
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=> onApply && onApply({ method:'document', useMultipleKeys, keyColumn, keyColumns, tokenLimit, modelName })}>Apply</button>
      </div>
    </div>
  );
}



