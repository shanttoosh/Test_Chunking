import React from 'react';

export default function Step9Embedding({
  model, setModel,
  batchSize, setBatchSize,
  onBack, onNext
}) {
  const MODELS = [
    { id: 'all-MiniLM-L12-v2', label: 'SBERT - all-MiniLM-L12-v2', dims: 384 },
    { id: 'BGE-BAAI/bge-small-en-v1.5', label: 'BGE - bge-small-en-v1.5', dims: 384 }
  ];
  const BATCH_SIZES = [32, 64, 128];

  return (
    <div className="config-step" data-step="9">
      <div className="step-header">
        <h3>🧠 Embedding Generation</h3>
        <p>Select model and batch size</p>
      </div>

      <div className="embedding-options">
        <div className="model-selection">
          <h4>Model</h4>
          <div className="model-grid">
            {MODELS.map((m) => (
              <div className="model-card" key={m.id}>
                <input
                  type="radio"
                  name="embedding-model"
                  value={m.id}
                  id={m.id}
                  checked={model === m.id}
                  onChange={() => setModel(m.id)}
                />
                <label htmlFor={m.id}>
                  <h5>{m.label}</h5>
                  <p>{m.dims} dimensions</p>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="embedding-config">
          <div className="form-group">
            <label className="form-label">Batch Size</label>
            <select className="form-control" value={batchSize} onChange={(e) => setBatchSize(Number(e.target.value))}>
              {BATCH_SIZES.map((bs) => (
                <option key={bs} value={bs}>{bs}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onNext}>Generate Embeddings</button>
      </div>
    </div>
  );
}


