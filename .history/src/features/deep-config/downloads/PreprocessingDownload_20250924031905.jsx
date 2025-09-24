import React from 'react';

export default function PreprocessingDownload({ 
  csvPreviewData, 
  previewColumns, 
  uploadedFileName,
  onDownload 
}) {
  const handleDownload = () => {
    if (!csvPreviewData || !previewColumns) return;
    
    // Convert data to CSV format
    const headers = previewColumns.map(col => col.name).join(',');
    const rows = csvPreviewData.map(row => 
      previewColumns.map(col => {
        const value = row[col.name];
        // Handle null values and escape commas
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `preprocessed_${uploadedFileName || 'data'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    if (onDownload) onDownload();
  };

  return (
    <div className="download-section">
      <div className="download-header">
        <h4>📁 Download Preprocessed Data</h4>
        <p>Download your cleaned and processed CSV data</p>
      </div>
      
      <div className="download-info">
        <div className="download-stats">
          <span>Rows: {csvPreviewData?.length || 0}</span>
          <span>Columns: {previewColumns?.length || 0}</span>
          <span>Format: CSV</span>
        </div>
      </div>
      
      <div className="download-actions">
        <button 
          className="btn btn-download" 
          onClick={handleDownload}
          disabled={!csvPreviewData || !previewColumns}
        >
          📥 Download Preprocessed CSV
        </button>
        <button 
          className="btn btn-primary" 
          onClick={onDownload}
        >
          Continue to Next Step →
        </button>
      </div>
    </div>
  );
}
