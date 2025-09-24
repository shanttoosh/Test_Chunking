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

export const uploadAndProcessCSV = async (file, layer = 1) => {
  const formData = new FormData();
  formData.append('file', file);
  const apiUrl = layer === 1 ? API_CONFIG.layer1 : layer === 2 ? API_CONFIG.layer2 : API_CONFIG.layer3;
  const response = await fetch(`${apiUrl}/process`, { method: 'POST', body: formData });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const searchAPI = async (query, layer = 1, nResults = 5) => {
  const apiUrl = layer === 1 ? API_CONFIG.layer1 : layer === 2 ? API_CONFIG.layer2 : API_CONFIG.layer3;
  const collectionName = layer === 1 ? 'fast_mode_chunks' : layer === 2 ? 'config_mode_chunks' : 'deep_config_chunks';
  return apiCall(`${apiUrl}/search`, {
    method: 'POST',
    body: JSON.stringify({ query, n_results: nResults, collection_name: collectionName })
  });
};


