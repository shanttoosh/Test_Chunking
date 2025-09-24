import React from 'react';

export default function LivePreviewPanel({ csvPreviewData = [], previewColumns = [] }) {
  return (
    <div className="live-preview-panel">
      <div className="preview-header">
        <h3>📊 Data Preview</h3>
        <div className="preview-stats">
          <span>Rows: {csvPreviewData.length}</span>
          <span>Columns: {previewColumns.length}</span>
          <span>Nulls: {previewColumns.reduce((sum, col) => sum + (col.nulls || 0), 0)}</span>
        </div>
      </div>
      <div className="preview-table-container">
        <table className="preview-table">
          <thead>
            <tr>
              {previewColumns.map((col, index) => (
                <th key={index}>
                  <div className="column-header">
                    <span className="column-name">{col.name}</span>
                    <span className="column-type">{col.type}</span>
                    {!!col.nulls && col.nulls > 0 && <span className="null-count">{col.nulls} nulls</span>}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvPreviewData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {previewColumns.map((col, colIndex) => (
                  <td key={colIndex} className={row[col.name] === null ? 'null-cell' : ''}>
                    {row[col.name] === null ? '<null>' : String(row[col.name])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


