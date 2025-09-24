import React from 'react';

export default function EmbeddingDownload({ 
  embeddingResult, 
  uploadedFileName,
  onDownload 
}) {
  const handleDownload = () => {
    if (!embeddingResult || !embeddingResult.embedded_chunks) return;
    
    // Check if JSZip is available
    if (!window.JSZip) {
      alert('JSZip library not loaded. Please refresh the page and try again.');
      return;
    }
    
    // Create ZIP file with embeddings
    const JSZip = window.JSZip;
    const zip = new JSZip();
    
    // Prepare embeddings data for export
    const embeddingsData = {
      model_info: {
        model_used: embeddingResult.model_used,
        vector_dimension: embeddingResult.vector_dimension,
        total_chunks: embeddingResult.total_chunks,
        processing_time: embeddingResult.processing_time
      },
      quality_report: embeddingResult.quality_report,
      embedded_chunks: embeddingResult.embedded_chunks.map(chunk => ({
        id: chunk.id,
        embedding: Array.isArray(chunk.embedding) ? chunk.embedding : chunk.embedding.tolist(),
        document: chunk.document,
        metadata: {
          chunk_id: chunk.metadata.chunk_id,
          source_file: chunk.metadata.source_file,
          chunk_number: chunk.metadata.chunk_number,
          embedding_model: chunk.metadata.embedding_model,
          vector_dimension: chunk.metadata.vector_dimension,
          text_length: chunk.metadata.text_length,
          additional_metadata: chunk.metadata.additional_metadata
        }
      }))
    };
    
    // Add main embeddings JSON file
    zip.file('embeddings.json', JSON.stringify(embeddingsData, null, 2));
    
    // Add individual chunk files for easier access
    embeddingResult.embedded_chunks.forEach((chunk, index) => {
      const chunkData = {
        id: chunk.id,
        embedding: Array.isArray(chunk.embedding) ? chunk.embedding : chunk.embedding.tolist(),
        document: chunk.document,
        metadata: chunk.metadata
      };
      zip.file(`chunk_${index + 1}_embedding.json`, JSON.stringify(chunkData, null, 2));
    });
    
    // Add summary file
    const summary = {
      total_chunks: embeddingResult.total_chunks,
      model_used: embeddingResult.model_used,
      vector_dimension: embeddingResult.vector_dimension,
      processing_time: embeddingResult.processing_time,
      download_timestamp: new Date().toISOString()
    };
    zip.file('embedding_summary.json', JSON.stringify(summary, null, 2));
    
    // Generate and download ZIP
    zip.generateAsync({ type: 'blob' }).then((content) => {
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `embeddings_${uploadedFileName || 'data'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (onDownload) onDownload();
    });
  };

  return (
    <div className="download-section">
      <div className="download-header">
        <h4>🧠 Download Embeddings</h4>
        <p>Download all embeddings as a ZIP file with JSON format</p>
      </div>
      
      <div className="download-info">
        <div className="download-stats">
          <span>Total Chunks: {embeddingResult?.total_chunks || 0}</span>
          <span>Model: {embeddingResult?.model_used || 'Unknown'}</span>
          <span>Dimensions: {embeddingResult?.vector_dimension || 0}</span>
          <span>Format: ZIP (JSON files)</span>
        </div>
      </div>
      
      <div className="download-actions">
        <button 
          className="btn btn-download" 
          onClick={handleDownload}
          disabled={!embeddingResult || !embeddingResult.embedded_chunks}
        >
          📥 Download Embeddings ZIP
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
