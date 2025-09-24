import React, { useState } from 'react';

export default function L2Embedding({ onNext }) {
  const [model, setModel] = useState('all-MiniLM-L12-v2');
  const [batchSize, setBatchSize] = useState(32);

  return (
    <div className="config-step" data-l2="embedding">
      <div className="step-header">
        <h3>Embedding</h3>
        <p>Select model and batch size</p>
      </div>
      <div className="form-grid two">
        <label>Model
          <select value={model} onChange={e=>setModel(e.target.value)}>
            <option value="all-MiniLM-L12-v2">SBERT: all-MiniLM-L12-v2</option>
            <option value="BGE-BAAI/bge-small-en-v1.5">BGE: BGE-BAAI/bge-small-en-v1.5</option>
          </select>
        </label>
        <label>Batch Size
          <select value={batchSize} onChange={e=>setBatchSize(parseInt(e.target.value,10))}>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
          </select>
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=>onNext && onNext({ model, batchSize })}>Next</button>
      </div>
    </div>
  );
}



