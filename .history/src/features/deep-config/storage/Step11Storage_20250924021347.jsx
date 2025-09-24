import React from 'react';

export default function Step11Storage({ 
  storageBackend, setStorageBackend,
  persistDir, setPersistDir,
  collectionName, setCollectionName,
  resetBeforeStore, setResetBeforeStore,
  similarityMetric, setSimilarityMetric,
  onBack, onStore, onOpenRetrieval 
}) {
  return (
    <div className="config-step" data-step="11">
      <div className="step-header">
        <h3>💾 Vector Storage Configuration</h3>
        <p>Configure vector database storage options</p>
      </div>
      
      <div className="storage-config">
        <div className="backend-selection">
          <h4>Storage Backend</h4>
          <div className="backend-options">
            <label className="backend-option">
              <input 
                type="radio" 
                name="storage-backend" 
                value="chroma" 
                checked={storageBackend === 'chroma'}
                onChange={(e) => setStorageBackend(e.target.value)}
              />
              <div className="backend-info">
                <span className="backend-name">ChromaDB</span>
                <span className="backend-desc">Persistent vector database with metadata support</span>
              </div>
            </label>
            <label className="backend-option">
              <input 
                type="radio" 
                name="storage-backend" 
                value="faiss" 
                checked={storageBackend === 'faiss'}
                onChange={(e) => setStorageBackend(e.target.value)}
              />
              <div className="backend-info">
                <span className="backend-name">FAISS</span>
                <span className="backend-desc">High-performance similarity search</span>
              </div>
            </label>
          </div>
        </div>

        <div className="storage-settings">
          <h4>Storage Settings</h4>
          <div className="settings-grid">
            <label>
              Persist Directory
              <input 
                type="text" 
                value={persistDir} 
                onChange={(e) => setPersistDir(e.target.value)}
                placeholder=".chroma"
              />
            </label>
            <label>
              Collection Name
              <input 
                type="text" 
                value={collectionName} 
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="csv_chunks"
              />
            </label>
            <label>
              Similarity Metric
              <select 
                value={similarityMetric} 
                onChange={(e) => setSimilarityMetric(e.target.value)}
              >
                <option value="cosine">Cosine</option>
                <option value="dot">Dot Product</option>
                <option value="euclidean">Euclidean</option>
              </select>
            </label>
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={resetBeforeStore} 
                onChange={(e) => setResetBeforeStore(e.target.checked)}
              />
              Reset collection before storing
            </label>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onStore}>Store Vectors</button>
        <button className="btn btn-success" onClick={onOpenRetrieval}>Test Retrieval</button>
      </div>
    </div>
  );
}


