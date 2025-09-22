// Frontend Integration Example for CSV Chunking Optimizer
// This file shows how to integrate the React frontend with the backend APIs

// API Configuration
const API_CONFIG = {
  layer1: 'http://localhost:8001',  // Fast Mode
  layer2: 'http://localhost:8002',  // Config Mode  
  layer3: 'http://localhost:8003'   // Deep Config
};

// Layer 1 (Fast Mode) API Integration
class FastModeAPI {
  constructor(baseURL = API_CONFIG.layer1) {
    this.baseURL = baseURL;
  }

  // Upload and process CSV with fast mode defaults
  async processCSV(file, options = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    // Add processing options
    if (options.chunk_size) formData.append('chunk_size', options.chunk_size);
    if (options.overlap) formData.append('overlap', options.overlap);
    if (options.model_name) formData.append('model_name', options.model_name);
    if (options.batch_size) formData.append('batch_size', options.batch_size);
    if (options.collection_name) formData.append('collection_name', options.collection_name);
    if (options.reset_collection !== undefined) formData.append('reset_collection', options.reset_collection);

    try {
      const response = await fetch(`${this.baseURL}/process`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing CSV:', error);
      throw error;
    }
  }

  // Search the processed data
  async search(query, nResults = 5, collectionName = 'fast_mode_chunks') {
    try {
      const response = await fetch(`${this.baseURL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          n_results: nResults,
          collection_name: collectionName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  // Get collection information
  async getCollectionInfo(collectionName = 'fast_mode_chunks') {
    try {
      const response = await fetch(`${this.baseURL}/collections/${collectionName}`);
      return await response.json();
    } catch (error) {
      console.error('Error getting collection info:', error);
      throw error;
    }
  }

  // List all collections
  async listCollections() {
    try {
      const response = await fetch(`${this.baseURL}/collections`);
      return await response.json();
    } catch (error) {
      console.error('Error listing collections:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Error checking health:', error);
      throw error;
    }
  }
}

// React Hook for Layer 1 Integration
import { useState, useCallback } from 'react';

export const useFastModeAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = new FastModeAPI();

  const processCSV = useCallback(async (file, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.processCSV(file, options);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const search = useCallback(async (query, nResults = 5, collectionName = 'fast_mode_chunks') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.search(query, nResults, collectionName);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getCollectionInfo = useCallback(async (collectionName = 'fast_mode_chunks') => {
    try {
      return await api.getCollectionInfo(collectionName);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [api]);

  const listCollections = useCallback(async () => {
    try {
      return await api.listCollections();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [api]);

  const healthCheck = useCallback(async () => {
    try {
      return await api.healthCheck();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [api]);

  return {
    processCSV,
    search,
    getCollectionInfo,
    listCollections,
    healthCheck,
    isLoading,
    error
  };
};

// React Component Example
import React, { useState } from 'react';

const CSVChunkingComponent = () => {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [processingResult, setProcessingResult] = useState(null);
  
  const { processCSV, search, isLoading, error } = useFastModeAPI();

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a CSV file');
    }
  };

  const handleProcess = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    try {
      const result = await processCSV(file, {
        chunk_size: 100,
        overlap: 10,
        model_name: 'all-MiniLM-L6-v2',
        batch_size: 32,
        collection_name: 'fast_mode_chunks',
        reset_collection: true
      });
      
      setProcessingResult(result);
      alert('Processing completed successfully!');
    } catch (err) {
      alert(`Processing failed: ${err.message}`);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      const result = await search(query, 5, 'fast_mode_chunks');
      setResults(result.results);
    } catch (err) {
      alert(`Search failed: ${err.message}`);
    }
  };

  return (
    <div className="csv-chunking-component">
      <h2>CSV Chunking Optimizer - Fast Mode</h2>
      
      {/* File Upload */}
      <div className="upload-section">
        <h3>Upload CSV File</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
        <button onClick={handleProcess} disabled={!file || isLoading}>
          {isLoading ? 'Processing...' : 'Process CSV'}
        </button>
      </div>

      {/* Processing Results */}
      {processingResult && (
        <div className="processing-results">
          <h3>Processing Results</h3>
          <div className="stats">
            <p>Original Rows: {processingResult.data.summary.original_rows}</p>
            <p>Processed Rows: {processingResult.data.summary.processed_rows}</p>
            <p>Total Chunks: {processingResult.data.summary.total_chunks}</p>
            <p>Embeddings Generated: {processingResult.data.summary.embeddings_generated}</p>
            <p>Chunks Stored: {processingResult.data.summary.chunks_stored}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-section">
        <h3>Search</h3>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your search query..."
        />
        <button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          {results.map((result, index) => (
            <div key={index} className="result-item">
              <h4>Result {result.rank}</h4>
              <p><strong>ID:</strong> {result.id}</p>
              <p><strong>Similarity:</strong> {result.similarity?.toFixed(4)}</p>
              <p><strong>Content:</strong> {result.content}</p>
              <div className="metadata">
                <p><strong>Section:</strong> {result.metadata.section}</p>
                <p><strong>Chunk Size:</strong> {result.metadata.chunk_size}</p>
                <p><strong>Text Length:</strong> {result.metadata.text_length}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default CSVChunkingComponent;

// Integration with existing React app
// Add this to your App.js or create a new component

// Example of how to integrate with your existing React app:
/*
import { useFastModeAPI } from './frontend-integration-example';

// In your existing App.js component:
const { processCSV, search, isLoading, error } = useFastModeAPI();

// Update your existing startProcessing function:
const startProcessing = async () => {
  if (!uploadedFile) {
    alert('Please upload a CSV file first!');
    return;
  }

  try {
    const result = await processCSV(uploadedFile, {
      chunk_size: 100,
      overlap: 10,
      model_name: 'all-MiniLM-L6-v2',
      batch_size: 32,
      collection_name: 'fast_mode_chunks',
      reset_collection: true
    });
    
    // Update your state with the results
    setProcessingStats({
      totalChunks: result.data.summary.total_chunks,
      processTime: result.data.embedding.stats.processing_time,
      memoryUsage: result.data.storage.stats.storage_stats.total_embedding_size
    });
    
    setShowQuerySection(true);
  } catch (err) {
    alert(`Processing failed: ${err.message}`);
  }
};

// Update your existing performQuery function:
const performQuery = async () => {
  if (!query.trim()) {
    alert('Please enter a search query');
    return;
  }

  try {
    const result = await search(query, 5, 'fast_mode_chunks');
    setQueryResults(result.results);
  } catch (err) {
    alert(`Search failed: ${err.message}`);
  }
};
*/
