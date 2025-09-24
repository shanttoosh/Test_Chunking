import React from 'react';

export default function Step11Storage({
  storageBackend, setStorageBackend,
  persistDir, setPersistDir,
  collectionName, setCollectionName,
  resetBeforeStore, setResetBeforeStore,
  onBack, onStore, onOpenRetrieval
}) {
  return (
    <div className="config-step" data-step="11">
      <div className="step-header">
        <h3>💾 Vector Storage & Retrieval</h3>
        <p>Choose storage backend and persist your vectors</p>
      </div>

      <div className="storage-config">
        <div className="config-group">
          <div className="form-group">
            <label className="form-label">Storage Backend</label>
            <select className="form-control" value={storageBackend} onChange={(e) => setStorageBackend(e.target.value)}>
              <option value="chroma">ChromaDB</option>
              <option value="faiss">FAISS</option>
            </select>
          </div>

          {storageBackend === 'chroma' && (
            <div className="form-group">
              <label className="form-label">ChromaDB Persist Directory</label>
              <input type="text" className="form-control" value={persistDir} onChange={(e) => setPersistDir(e.target.value)} />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Collection / Index Name</label>
            <input type="text" className="form-control" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="checkbox-item">
              <input type="checkbox" checked={resetBeforeStore} onChange={(e) => setResetBeforeStore(e.target.checked)} />
              <span>Reset collection before storing (clears previous data)</span>
            </label>
          </div>
        </div>
      </div>

      <div className="storage-actions">
        <div className="action-group">
          <button className="btn btn-secondary" onClick={onBack}>← Back</button>
          <button className="btn btn-success" onClick={onStore}>Store Embeddings</button>
        </div>
        <div className="action-group">
          <button className="btn btn-primary" onClick={onOpenRetrieval}>Open Retrieval</button>
        </div>
      </div>
    </div>
  );
}


