import React from 'react';

export default function QueryBar({ value, onChange, onSubmit, placeholder = 'Enter your search query...' }) {
  return (
    <div className="query-bar">
      <input
        type="text"
        className="query-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
      />
      <div className="query-icon" onClick={onSubmit}>
        <div className="search-icon-circle">
          <div className="search-icon-content">🔍</div>
        </div>
      </div>
    </div>
  );
}


