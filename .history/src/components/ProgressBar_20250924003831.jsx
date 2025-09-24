import React from 'react';

export default function ProgressBar({ progress = 0, text = '' }) {
  return (
    <div className="progress-section">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div className="progress-text">{text}</div>
    </div>
  );
}


