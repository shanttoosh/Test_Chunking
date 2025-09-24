import React from 'react';

export default function StatsPanel({ totalChunks = 0, processTime = 0, fileSizeMB = '0MB', memoryUsage = 0 }) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-value">{totalChunks}</div>
        <div className="stat-label">Total Chunks</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{processTime}s</div>
        <div className="stat-label">Process Time</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{fileSizeMB}</div>
        <div className="stat-label">File Size</div>
      </div>
      <div className="stat-card">
        <div className="stat-value">{memoryUsage}MB</div>
        <div className="stat-label">Memory Usage</div>
      </div>
    </div>
  );
}


