import React from 'react';

export default function ChunkingDownload({ 
  chunkingResult, 
  uploadedFileName,
  onDownload 
}) {
  const handleDownload = () => {
    if (!chunkingResult || !chunkingResult.chunks) return;
    
    // Check if JSZip is available
    if (!window.JSZip) {
      alert('JSZip library not loaded. Please refresh the page and try again.');
      return;
    }
    
    // Create ZIP file with all chunks
    const JSZip = window.JSZip;
    const zip = new JSZip();
    
    // Add each chunk as a separate CSV file
    chunkingResult.chunks.forEach((chunk, index) => {
      if (chunk && typeof chunk === 'object') {
        // Convert chunk to CSV format
        const csvContent = convertChunkToCSV(chunk);
        zip.file(`chunk_${index + 1}.csv`, csvContent);
      }
    });
    
    // Add metadata file
    const metadata = {
      total_chunks: chunkingResult.total_chunks,
      method: chunkingResult.method,
      quality_report: chunkingResult.quality_report,
      timestamp: new Date().toISOString()
    };
    zip.file('chunking_metadata.json', JSON.stringify(metadata, null, 2));
    
    // Generate and download ZIP
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chunks_${uploadedFileName || 'data'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (onDownload) onDownload();
    });
  };

  const convertChunkToCSV = (chunk) => {
    if (Array.isArray(chunk)) {
      // If chunk is array of objects
      if (chunk.length === 0) return '';
      const headers = Object.keys(chunk[0]).join(',');
      const rows = chunk.map(row => 
        Object.values(row).map(value => 
          value === null || value === undefined ? '' : 
          String(value).includes(',') ? `"${String(value)}"` : String(value)
        ).join(',')
      );
      return [headers, ...rows].join('\n');
    } else if (typeof chunk === 'object') {
      // If chunk is single object
      const headers = Object.keys(chunk).join(',');
      const values = Object.values(chunk).map(value => 
        value === null || value === undefined ? '' : 
        String(value).includes(',') ? `"${String(value)}"` : String(value)
      ).join(',');
      return [headers, values].join('\n');
    }
    return String(chunk);
  };

  return (
    <div className="download-section">
      <div className="download-header">
        <h4>📦 Download Chunks</h4>
        <p>Download all chunks as a ZIP file with individual CSV files</p>
      </div>
      
      <div className="download-info">
        <div className="download-stats">
          <span>Total Chunks: {chunkingResult?.total_chunks || 0}</span>
          <span>Method: {chunkingResult?.method || 'Unknown'}</span>
          <span>Format: ZIP (CSV files)</span>
        </div>
      </div>
      
      <div className="download-actions">
        <button 
          className="btn btn-download" 
          onClick={handleDownload}
          disabled={!chunkingResult || !chunkingResult.chunks}
        >
          📥 Download Chunks ZIP
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
