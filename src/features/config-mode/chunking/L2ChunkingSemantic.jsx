import React, { useState } from 'react';

export default function L2ChunkingSemantic({ onApply }) {
  const [nClusters, setNClusters] = useState('');
  const [threshold, setThreshold] = useState(0.6);

  return (
    <div className="config-step" data-l2="chunking-semantic">
      <div className="step-header">
        <h3>Chunking - Semantic</h3>
        <p>Group rows by meaning using embeddings</p>
      </div>
      <div className="form-grid two">
        <label>nClusters (optional)
          <input type="number" value={nClusters} min={1} onChange={e=>setNClusters(e.target.value)} placeholder="auto" />
        </label>
        <label>Similarity Threshold
          <input type="number" step="0.05" min={0.1} max={0.95} value={threshold} onChange={e=>setThreshold(parseFloat(e.target.value||'0'))} />
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=>onApply && onApply({ method:'semantic', nClusters: nClusters?parseInt(nClusters,10):null, similarityThreshold: threshold })}>Apply</button>
      </div>
    </div>
  );
}



