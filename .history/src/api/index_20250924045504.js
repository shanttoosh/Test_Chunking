// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    PREPROCESS: '/api/preprocess',
    CHUNK: '/api/chunk',
    EMBED: '/api/embed',
    STORE: '/api/store',
    SEARCH: '/api/search',
    MODELS: '/api/models',
    SESSION: '/api/session'
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      if (method === 'POST' && data instanceof FormData) {
        // Remove Content-Type header for FormData to let browser set it with boundary
        delete options.headers['Content-Type'];
        options.body = data;
      } else {
        options.body = JSON.stringify(data);
      }
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Upload and process CSV file
export const uploadAndProcessCSV = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.UPLOAD, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Upload failed:', error);
    throw error;
  }
};

// Preprocess data
export const preprocessData = async (sessionId, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    
    if (options.fill_null_strategy) {
      formData.append('fill_null_strategy', options.fill_null_strategy);
    }
    if (options.type_conversions) {
      formData.append('type_conversions', JSON.stringify(options.type_conversions));
    }
    if (options.drop_duplicates_cols) {
      formData.append('drop_duplicates_cols', options.drop_duplicates_cols);
    }
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.PREPROCESS, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Preprocessing failed:', error);
    throw error;
  }
};

// Chunk data
export const chunkData = async (sessionId, chunkingMethod, options = {}) => {
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('chunking_method', chunkingMethod);
    
    // Add method-specific options
    Object.keys(options).forEach(key => {
      if (options[key] !== null && options[key] !== undefined) {
        formData.append(key, options[key]);
      }
    });
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.CHUNK, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Chunking failed:', error);
    throw error;
  }
};

// Generate embeddings
export const generateEmbeddings = async (sessionId, modelName, batchSize = 32) => {
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('model_name', modelName);
    formData.append('batch_size', batchSize.toString());
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.EMBED, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Embedding generation failed:', error);
    throw error;
  }
};

// Store embeddings
export const storeEmbeddings = async (sessionId, persistDir = '.chroma', collectionName = 'csv_chunks', resetBeforeStore = true) => {
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('persist_dir', persistDir);
    formData.append('collection_name', collectionName);
    formData.append('reset_before_store', resetBeforeStore.toString());
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.STORE, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Storage failed:', error);
    throw error;
  }
};

// Search embeddings
export const searchAPI = async (sessionId, query, topK = 5, persistDir = '.chroma', collectionName = 'csv_chunks') => {
  try {
    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('query', query);
    formData.append('top_k', topK.toString());
    formData.append('persist_dir', persistDir);
    formData.append('collection_name', collectionName);
    
    const result = await apiCall(API_CONFIG.ENDPOINTS.SEARCH, 'POST', formData);
    return result;
  } catch (error) {
    console.error('Search failed:', error);
    throw error;
  }
};

// Get available models
export const getAvailableModels = async () => {
  try {
    const result = await apiCall(API_CONFIG.ENDPOINTS.MODELS);
    return result;
  } catch (error) {
    console.error('Failed to get models:', error);
    throw error;
  }
};

// Get session data
export const getSessionData = async (sessionId) => {
  try {
    const result = await apiCall(`${API_CONFIG.ENDPOINTS.SESSION}/${sessionId}`);
    return result;
  } catch (error) {
    console.error('Failed to get session data:', error);
    throw error;
  }
};


