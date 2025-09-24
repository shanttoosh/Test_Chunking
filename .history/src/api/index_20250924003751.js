// API helper module

export const API_CONFIG = {
  layer1: 'http://localhost:8001',
  layer2: 'http://localhost:8002',
  layer3: 'http://localhost:8003'
};

export const apiCall = async (url, options = {}) => {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// -------- Mock helpers (no-backend mode) ---------
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

const mockProcessingResponse = async (file) => {
  // Simulate processing delay
  await delay(600);
  return {
    success: true,
    message: 'Mock pipeline completed',
    data: {
      preprocessing: {
        success: true,
        message: 'Mock preprocessing ok',
        stats: { original_rows: 1000, processed_rows: 980 },
        sample_data: [
          { column_1: 'Sample text data', column_2: 123.45, column_3: '2023-01-01' },
          { column_1: 'Another sample', column_2: 67.89, column_3: '2023-01-02' },
          { column_1: 'More data here', column_2: null, column_3: '2023-01-03' }
        ]
      },
      chunking: {
        success: true,
        message: 'Mock chunking ok',
        stats: { total_chunks: 83 }
      },
      embedding: {
        success: true,
        message: 'Mock embedding ok',
        stats: { total_chunks: 83, processing_time: 16 }
      },
      storage: {
        success: true,
        message: 'Mock storage ok',
        stored_count: 83,
        stats: { storage_stats: { total_embedding_size: 42 } }
      },
      summary: {
        original_rows: 1000,
        processed_rows: 980,
        total_chunks: 83,
        embeddings_generated: 83,
        chunks_stored: 83,
        collection_name: 'mock_collection'
      }
    }
  };
};

const mockSearchResponse = async (query, nResults) => {
  await delay(300);
  const base = [
    {
      id: 'chunk_001',
      content: `Mock result for "${query}": Customer data analysis ...`,
      similarity: 0.91,
      metadata: { source_file: 'mock.csv', method: 'semantic' }
    },
    {
      id: 'chunk_002',
      content: `Mock result for "${query}": Product metrics ...`,
      similarity: 0.87,
      metadata: { source_file: 'mock.csv', method: 'semantic' }
    },
    {
      id: 'chunk_003',
      content: `Mock result for "${query}": Market trend analysis ...`,
      similarity: 0.84,
      metadata: { source_file: 'mock.csv', method: 'semantic' }
    }
  ];
  return {
    success: true,
    query,
    results: base.slice(0, Math.max(1, Math.min(nResults || 5, base.length)))
  };
};

export const uploadAndProcessCSV = async (file, layer = 1) => {
  const formData = new FormData();
  formData.append('file', file);
  const apiUrl = layer === 1 ? API_CONFIG.layer1 : layer === 2 ? API_CONFIG.layer2 : API_CONFIG.layer3;
  try {
    const response = await fetch(`${apiUrl}/process`, { method: 'POST', body: formData });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (e) {
    // Fallback to mock if backend is unavailable
    return mockProcessingResponse(file);
  }
};

export const searchAPI = async (query, layer = 1, nResults = 5) => {
  const apiUrl = layer === 1 ? API_CONFIG.layer1 : layer === 2 ? API_CONFIG.layer2 : API_CONFIG.layer3;
  const collectionName = layer === 1 ? 'fast_mode_chunks' : layer === 2 ? 'config_mode_chunks' : 'deep_config_chunks';
  try {
    return await apiCall(`${apiUrl}/search`, {
      method: 'POST',
      body: JSON.stringify({ query, n_results: nResults, collection_name: collectionName })
    });
  } catch (e) {
    // Fallback to mock if backend is unavailable
    return mockSearchResponse(query, nResults);
  }
};


