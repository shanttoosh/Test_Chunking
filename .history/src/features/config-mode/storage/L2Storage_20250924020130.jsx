import React, { useState } from 'react';

export default function L2Storage({ onSearch }) {
  const [backend, setBackend] = useState('chroma');
  const [similarity, setSimilarity] = useState('cosine');

  return (
    <div className="config-step" data-l2="storage">
      <div className="step-header">
        <h3>Storage</h3>
        <p>Choose vector DB and similarity metric</p>
      </div>
      <div className="form-grid two">
        <label>Backend
          <select value={backend} onChange={e=>setBackend(e.target.value)}>
            <option value="chroma">ChromaDB</option>
            <option value="faiss">FAISS</option>
          </select>
        </label>
        <label>Similarity
          <select value={similarity} onChange={e=>setSimilarity(e.target.value)}>
            <option value="cosine">Cosine</option>
            <option value="dot">Dot</option>
            <option value="euclidean">Euclidean</option>
          </select>
        </label>
      </div>
      <div className="step-actions">
        <button className="btn btn-primary" onClick={()=>onSearch && onSearch({ backend, similarity })}>Test Retrieval</button>
      </div>
    </div>
  );
}


