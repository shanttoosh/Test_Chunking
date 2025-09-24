import React, { useState } from 'react';

export default function L2ChunkingRecursive({ onApply }) {
  const [chunkSize, setChunkSize] = useState(5000);
  const [overlap, setOverlap] = useState(500);

  return (
    <div className="config-step" data-l2="chunking-recursive">
      <div className="step-header">
        <h3>Chunking - Recursive</h3>
        <p>Character budget and overlap</p>
      </div>
      <div className="form-grid two">
        <label>Target characters per chunk
          <input type="number" value={chunkSize} min={100} onChange={e=>setChunkSize(parseInt(e.target.value||'0',10))} />
        </label>
        <label>Overlap (characters)
          <input type="number" value={overlap} min={0} onChange={e=>setOverlap(parseInt(e.target.value||'0',10))} />
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=>onApply && onApply({ method:'recursive', textChunkChars: chunkSize, overlapChars: overlap })}>Apply</button>
      </div>
    </div>
  );
}


