import React from 'react';

export default function Sidebar({
  show,
  steps = [],
  progress = 0,
  progressText = '',
  stats = { totalChunks: 0, processTime: 0, memoryUsage: 0 },
  fileSizeMB = '0MB',
  currentLayer = 1
}) {
  if (!show) return null;
  return (
    <div className="sidebar show">
      <div className="logo">
        <div className="logo-text">CSV Chunking Optimizer</div>
      </div>

      <div className="process-steps">
        <div className="steps-title">Processing Pipeline</div>
        {steps.map((step) => (
          <div key={step.id} className={`process-step ${step.status}`}>
            <div className="step-content">
              <div className="step-details">
                <div className="step-title">{step.name}</div>
                <div className="step-description">
                  {step.id === 'upload' && 'Load CSV data'}
                  {step.id === 'analyze' && 'Analyze structure'}
                  {step.id === 'preprocess' && 'Clean & prepare'}
                  {step.id === 'chunking' && 'Split into chunks'}
                  {step.id === 'embedding' && 'Generate vectors'}
                  {step.id === 'storage' && 'Save to database'}
                  {step.id === 'retrieval' && 'Test retrieval'}
                </div>
              </div>
              <div className="step-timing">{step.duration}</div>
              <div className="step-status"></div>
            </div>
          </div>
        ))}
      </div>

      <div className="progress-section">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="progress-text">{progressText}</div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalChunks}</div>
          <div className="stat-label">Total Chunks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.processTime}s</div>
          <div className="stat-label">Process Time</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{fileSizeMB}</div>
          <div className="stat-label">File Size</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.memoryUsage}MB</div>
          <div className="stat-label">Memory Usage</div>
        </div>
      </div>
    </div>
  );
}


