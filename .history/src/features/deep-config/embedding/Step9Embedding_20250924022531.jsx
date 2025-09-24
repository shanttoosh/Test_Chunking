import React from 'react';

export default function Step9Embedding({ 
  model, setModel,
  batchSize, setBatchSize,
  onBack, onNext 
}) {
  return (
    <div className="config-step" data-step="9">
      <div className="step-header">
        <h3>🧠 Embedding Configuration</h3>
        <p>Select embedding model and batch size</p>
      </div>
      
      <div className="embedding-config">
        <div className="model-selection">
          <h4>Embedding Model</h4>
          <div className="model-options">
            <label className="model-option">
              <input 
                type="radio" 
                name="embedding-model" 
                value="all-MiniLM-L12-v2" 
                checked={embeddingModelChoice === 'all-MiniLM-L12-v2'}
                onChange={(e) => setEmbeddingModelChoice(e.target.value)}
              />
              <div className="model-info">
                <span className="model-name">SBERT: all-MiniLM-L12-v2</span>
                <span className="model-desc">Fast and efficient for general use</span>
              </div>
            </label>
            <label className="model-option">
              <input 
                type="radio" 
                name="embedding-model" 
                value="BGE-BAAI/bge-small-en-v1.5" 
                checked={embeddingModelChoice === 'BGE-BAAI/bge-small-en-v1.5'}
                onChange={(e) => setEmbeddingModelChoice(e.target.value)}
              />
              <div className="model-info">
                <span className="model-name">BGE: BGE-BAAI/bge-small-en-v1.5</span>
                <span className="model-desc">High quality embeddings for better accuracy</span>
              </div>
            </label>
          </div>
        </div>

        <div className="batch-config">
          <h4>Batch Configuration</h4>
          <div className="batch-options">
            <label>
              Batch Size
              <select 
                value={embeddingBatchSize} 
                onChange={(e) => setEmbeddingBatchSize(parseInt(e.target.value))}
              >
                <option value={32}>32</option>
                <option value={64}>64</option>
                <option value={128}>128</option>
              </select>
            </label>
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


