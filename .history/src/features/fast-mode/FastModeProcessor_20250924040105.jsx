import React from 'react';

export default function FastModeProcessor({
  uploadedFile,
  onProcess,
  isProcessing
}) {
  if (!uploadedFile) {
    return (
      <div className="fast-mode-container">
        <div className="upload-prompt">
          <h3>📁 Upload CSV File</h3>
          <p>Please upload a CSV file to start Fast Mode processing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fast-mode-container">
      <div className="fast-mode-header">
        <h3>⚡ Fast Mode Processing</h3>
        <p>Automated pipeline with optimized defaults</p>
      </div>

      <div className="fast-mode-config">
        <div className="config-item">
          <div className="config-label">Chunking Method</div>
          <div className="config-value">Semantic Chunking</div>
        </div>
        
        <div className="config-item">
          <div className="config-label">Embedding Model</div>
          <div className="config-value">SBERT all-MiniLM-L6-v2</div>
        </div>
        
        <div className="config-item">
          <div className="config-label">Storage Backend</div>
          <div className="config-value">ChromaDB</div>
        </div>
        
        <div className="config-item">
          <div className="config-label">Similarity Metric</div>
          <div className="config-value">Cosine</div>
        </div>
      </div>

      <div className="fast-mode-actions">
        <button 
          className="btn btn-primary btn-large"
          onClick={onProcess}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Start Fast Mode Processing'}
        </button>
      </div>
    </div>
  );
}
