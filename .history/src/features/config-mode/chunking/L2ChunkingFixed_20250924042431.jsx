import React, { useState } from 'react';

export default function L2ChunkingFixed({ onApply }) {
  const [chunkSize, setChunkSize] = useState(100);
  const [overlap, setOverlap] = useState(0);

  return (
    <div className="config-step" data-l2="chunking-fixed">
      <div className="step-header">
        <h3>Chunking - Fixed Size</h3>
        <p>Split rows by size and overlap</p>
      </div>
      <div className="form-grid two">
        <label>Chunk Size (rows)
          <input type="number" value={chunkSize} min={1} onChange={e=>setChunkSize(parseInt(e.target.value||'0',10))} />
        </label>
        <label>Overlap (rows)
          <input type="number" value={overlap} min={0} max={Math.max(chunkSize-1,0)} onChange={e=>setOverlap(parseInt(e.target.value||'0',10))} />
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=>onApply && onApply({ method:'fixed', chunkSize, overlap })}>Apply</button>
      </div>
    </div>
  );
}


