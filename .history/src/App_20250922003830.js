import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileUploaded, setFileUploaded] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProcessingPipeline, setShowProcessingPipeline] = useState(false);
  const [showQuerySection, setShowQuerySection] = useState(false);
  const [showQuerySectionLayer2, setShowQuerySectionLayer2] = useState(false);
  const [showConfigBoxes, setShowConfigBoxes] = useState(true);
  const [queryResults, setQueryResults] = useState([]);
  const [queryResultsLayer2, setQueryResultsLayer2] = useState([]);
  
  // Layer 3 Deep Config states
  const [deepConfigStep, setDeepConfigStep] = useState(0);
  const [preprocessingData, setPreprocessingData] = useState(null);
  const [chunkingResult, setChunkingResult] = useState(null);
  const [embeddingResult, setEmbeddingResult] = useState(null);
  const [showRetrievalPopup, setShowRetrievalPopup] = useState(false);
  const [retrievalResults, setRetrievalResults] = useState([]);
  
  // Live CSV preview data
  const [csvPreviewData, setCsvPreviewData] = useState([
    { column_1: "Sample text data", column_2: 123.45, column_3: "2023-01-01" },
    { column_1: "Another sample", column_2: 67.89, column_3: "2023-01-02" },
    { column_1: "More data here", column_2: null, column_3: "2023-01-03" },
    { column_1: "Final sample", column_2: 234.56, column_3: null }
  ]);
  const [previewColumns, setPreviewColumns] = useState([
    { name: "column_1", type: "object", nulls: 0 },
    { name: "column_2", type: "float64", nulls: 1 },
    { name: "column_3", type: "object", nulls: 1 }
  ]);
  
  const [processingSteps, setProcessingSteps] = useState([
    { id: 'upload', name: 'File Upload', status: 'pending', duration: '' },
    { id: 'analyze', name: 'Data Analysis', status: 'pending', duration: '' },
    { id: 'preprocess', name: 'Preprocessing', status: 'pending', duration: '' },
    { id: 'chunking', name: 'Chunking', status: 'pending', duration: '' },
    { id: 'embedding', name: 'Embedding', status: 'pending', duration: '' },
    { id: 'storage', name: 'Storing', status: 'pending', duration: '' },
    { id: 'retrieval', name: 'Retrieval', status: 'pending', duration: '' }
  ]);

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    setUploadedFile(file);
    setFileUploaded(true);
    setShowSidebar(true);
    setShowProcessingPipeline(true);
    
    // Mark upload step as completed
    updateStepStatus('upload', 'completed', '1s');
  };

  // Update step status
  const updateStepStatus = (stepId, status, duration = '') => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, duration } : step
    ));
  };

  // Start processing for Layer 1
  const startProcessing = async () => {
    if (!uploadedFile) {
      alert('Please upload a CSV file first!');
      return;
    }

    if (isProcessing) {
      alert('Processing is already in progress!');
      return;
    }

    setIsProcessing(true);
    
    const steps = [
      { id: 'analyze', duration: 1000 },
      { id: 'preprocess', duration: 2000 },
      { id: 'chunking', duration: 3000 },
      { id: 'embedding', duration: 4000 },
      { id: 'storage', duration: 1500 },
      { id: 'retrieval', duration: 1000 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      updateStepStatus(step.id, 'active');
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      updateStepStatus(step.id, 'completed', `${Math.floor(step.duration / 1000)}s`);
    }

    setIsProcessing(false);
    setShowQuerySection(true);
  };

  // Start processing for Layer 2
  const startProcessingLayer2 = async () => {
    if (!uploadedFile) {
      alert('Please upload a CSV file first!');
      return;
    }

    if (isProcessing) {
      alert('Processing is already in progress!');
      return;
    }

    setIsProcessing(true);
    
    const steps = [
      { id: 'analyze', duration: 1000 },
      { id: 'preprocess', duration: 2000 },
      { id: 'chunking', duration: 3000 },
      { id: 'embedding', duration: 4000 },
      { id: 'storage', duration: 2000 },
      { id: 'retrieval', duration: 1500 }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      updateStepStatus(step.id, 'active');
      
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      updateStepStatus(step.id, 'completed', `${Math.floor(step.duration / 1000)}s`);
    }

    setIsProcessing(false);
    // Hide config boxes and show query section
    setShowConfigBoxes(false);
    setShowQuerySectionLayer2(true);
  };

  // Show query section for Layer 2
  const showQuerySectionLayer2Handler = () => {
    setShowConfigBoxes(false);
    setShowQuerySectionLayer2(true);
  };

  // Show config boxes for Layer 2
  const showConfigBoxesLayer2 = () => {
    setShowQuerySectionLayer2(false);
    setShowConfigBoxes(true);
  };

  // Perform query for Layer 1
  const performQuery = () => {
    const mockResults = [
      {
        title: "Chunk 1",
        content: "Customer data analysis showing purchasing patterns across different demographics and regions. This chunk contains detailed information about customer behavior, preferences, and buying trends that can help optimize marketing strategies and product development."
      },
      {
        title: "Chunk 2",
        content: "Product performance metrics including sales figures, customer satisfaction ratings, and return rates. This data provides insights into which products are performing well and which may need improvement or discontinuation."
      },
      {
        title: "Chunk 3",
        content: "Market trend analysis covering seasonal variations, competitor analysis, and growth projections. This information helps businesses understand market dynamics and make informed strategic decisions."
      }
    ];
    setQueryResults(mockResults);
  };

  // Perform query for Layer 2
  const performQueryLayer2 = () => {
    const mockResults = [
      {
        title: "Chunk 1: Preprocessing Results",
        content: "Data preprocessing completed successfully with null value handling and data type conversion as configured. The data has been cleaned and prepared for chunking with optimal quality."
      },
      {
        title: "Chunk 2: Chunking Analysis",
        content: "Semantic chunking performed using the selected method with configured chunk size and overlap. The data has been intelligently segmented into meaningful chunks for better processing."
      },
      {
        title: "Chunk 3: Vector Storage",
        content: "Embeddings generated using the selected model and stored in the configured vector database. The data is now ready for similarity search and retrieval operations."
      }
    ];
    setQueryResultsLayer2(mockResults);
  };

  // Reset processing
  const resetProcessing = () => {
    setCurrentLayer(1);
    setIsProcessing(false);
    setUploadedFile(null);
    setFileUploaded(false);
    setShowSidebar(false);
    setShowProcessingPipeline(false);
    setShowQuerySection(false);
    setShowQuerySectionLayer2(false);
    setShowConfigBoxes(true);
    setQueryResults([]);
    setQueryResultsLayer2([]);
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending', duration: '' })));
  };

  // Save configuration
  const saveConfiguration = () => {
    alert('Configuration saved successfully!');
  };

  // Reset configuration
  const resetConfiguration = () => {
    setDeepConfigStep(0);
    setPreprocessingData(null);
    setChunkingResult(null);
    setEmbeddingResult(null);
    setShowRetrievalPopup(false);
    setRetrievalResults([]);
    alert('Configuration reset successfully!');
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar show">
          <div className="logo">
            <div className="logo-icon">🚀</div>
            <div className="logo-text">CSV Chunker Pro</div>
          </div>

          <div className="process-steps">
            <div className="steps-title">Processing Pipeline</div>
            
            {processingSteps.map((step) => (
              <div key={step.id} className={`process-step ${step.status}`}>
                <div className="step-content">
                  <div className="step-details">
                    <div className="step-title">{step.name}</div>
                    <div className="step-description">
                      {step.id === 'upload' && 'Load CSV data'}
                      {step.id === 'analyze' && 'Analyze structure'}
                      {step.id === 'preprocess' && 'Clean & prepare'}
                      {step.id === 'chunking' && 'Split into chunks'}
                      {step.id === 'embedding' && 'Generate vectors'}
                      {step.id === 'storage' && 'Save to database'}
                      {step.id === 'retrieval' && 'Test retrieval'}
                    </div>
                  </div>
                  <div className="step-timing">{step.duration}</div>
                  <div className="step-status"></div>
                </div>
              </div>
            ))}
          </div>

          <div className="progress-section">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '100%' }}></div>
            </div>
            <div className="progress-text">
              {isProcessing ? 'Processing...' : 'Processing Complete!'}
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">580</div>
              <div className="stat-label">Total Chunks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">16s</div>
              <div className="stat-label">Process Time</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)}MB` : '0MB'}</div>
              <div className="stat-label">File Size</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">83MB</div>
              <div className="stat-label">Memory Usage</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <div>
            <h1 className="header-title">CSV Chunking Optimizer</h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '5px' }}>
              Transform your CSV data into optimized chunks for better processing
            </p>
          </div>
        </div>

        {!fileUploaded && (
          <>
            {/* Layer Selection */}
            <div className="layer-selection">
              <div className={`layer-card ${currentLayer === 1 ? 'active' : ''}`} onClick={() => setCurrentLayer(1)}>
                <div className="layer-header">
                  <div className="layer-icon">⚡</div>
                  <div className="layer-title">Fast Mode</div>
                </div>
                <div className="layer-description">
                  Auto-optimized processing with best-practice defaults. Perfect for quick results without manual configuration.
                </div>
                <ul className="layer-features">
                  <li>Automatic parameter optimization</li>
                  <li>One-click processing</li>
                  <li>Fastest execution time</li>
                </ul>
              </div>

              <div className={`layer-card ${currentLayer === 2 ? 'active' : ''}`} onClick={() => setCurrentLayer(2)}>
                <div className="layer-header">
                  <div className="layer-icon">⚙️</div>
                  <div className="layer-title">Config Mode</div>
                </div>
                <div className="layer-description">
                  High-level configuration options for customized processing. Balance between ease-of-use and control.
                </div>
                <ul className="layer-features">
                  <li>Preprocessing options</li>
                  <li>Model selection</li>
                  <li>Storage configuration</li>
                </ul>
              </div>

              <div className={`layer-card ${currentLayer === 3 ? 'active' : ''}`} onClick={() => setCurrentLayer(3)}>
                <div className="layer-header">
                  <div className="layer-icon">🔬</div>
                  <div className="layer-title">Deep Config</div>
                </div>
                <div className="layer-description">
                  Advanced parameter tuning for maximum control and optimization. Perfect for expert users and specific use cases.
                </div>
                <ul className="layer-features">
                  <li>Full parameter control</li>
                  <li>Advanced algorithms</li>
                  <li>Custom optimization</li>
                </ul>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="file-upload-section">
              <div className="file-upload" onClick={() => document.getElementById('csvFile').click()}>
                <h3 className="upload-title">Upload Your CSV File</h3>
                <p className="upload-subtitle">Drop your file here or click to browse</p>
                <input 
                  type="file" 
                  id="csvFile" 
                  accept=".csv" 
                  style={{ display: 'none' }} 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </>
        )}

        {/* Processing Pipeline Section */}
        {showProcessingPipeline && (
          <div className="processing-pipeline-section show">
            {/* Layer 1: Fast Mode */}
            {currentLayer === 1 && (
              <div className="content-section active">
                <div className="simple-processing">
                  {/* Query Section */}
                  {showQuerySection && (
                    <div className="query-section show">
                      <div className="query-bar">
                        <input 
                          type="text" 
                          className="query-input" 
                          placeholder="Enter your search query..."
                          onKeyPress={(e) => e.key === 'Enter' && performQuery()}
                        />
                        <div className="query-icon" onClick={performQuery}>🔍</div>
                      </div>
                      <div className="query-results">
                        {queryResults.map((result, index) => (
                          <div key={index} className="query-result-item">
                            <div className="query-result-title">{result.title}</div>
                            <div className="query-result-content">{result.content}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Layer 2: Config Mode */}
            {currentLayer === 2 && (
              <div className="content-section active">
                {/* Configuration Boxes */}
                {showConfigBoxes && (
                  <div className="config-grid">
                    <div className="config-card">
                      <div className="config-card-header">
                        <div className="config-icon">🔧</div>
                        <div className="config-title">Preprocessing Options</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Null Value Handling</label>
                        <select className="form-control">
                          <option value="leave">Leave as it is</option>
                          <option value="fill-mode">Fill with mode</option>
                          <option value="remove">Remove null rows</option>
                          <option value="fill-mean">Fill with mean</option>
                          <option value="forward-fill">Forward fill</option>
                          <option value="custom">Custom value</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Data Type Conversion</label>
                        <select className="form-control">
                          <option value="leave">Leave as it is</option>
                          <option value="numeric">To numeric</option>
                          <option value="boolean">To boolean</option>
                          <option value="object">To object</option>
                          <option value="datetime">To datetime</option>
                        </select>
                      </div>
                    </div>

                    <div className="config-card">
                      <div className="config-card-header">
                        <div className="config-icon">✂️</div>
                        <div className="config-title">Chunking Strategy</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Chunking Method</label>
                        <select className="form-control">
                          <option value="semantic">Semantic Chunking</option>
                          <option value="fixed">Fixed Size</option>
                          <option value="recursive">Recursive Text Splitter</option>
                          <option value="document">Document-based</option>
                          <option value="agentic">Agentic Chunking</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Chunk Size</label>
                        <select className="form-control">
                          <option value="auto">Auto-optimize</option>
                          <option value="128">Small (128 tokens)</option>
                          <option value="512">Medium (512 tokens)</option>
                          <option value="1024">Large (1024 tokens)</option>
                          <option value="2048">X-Large (2048 tokens)</option>
                        </select>
                      </div>
                      <div className="range-group">
                        <label className="form-label">Overlap Percentage</label>
                        <input type="range" className="range-slider" min="0" max="50" defaultValue="10" />
                        <div className="range-labels">
                          <span>0%</span>
                          <span className="range-value">10%</span>
                          <span>50%</span>
                        </div>
                      </div>
                    </div>

                    <div className="config-card">
                      <div className="config-card-header">
                        <div className="config-icon">🧠</div>
                        <div className="config-title">Embedding Model</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Model Selection</label>
                        <select className="form-control">
                          <option value="openai-large">OpenAI text-embedding-3-large</option>
                          <option value="openai-small">OpenAI text-embedding-3-small</option>
                          <option value="sentence-bert">Sentence-BERT</option>
                          <option value="cohere">Cohere Embed v3</option>
                          <option value="huggingface">HuggingFace Models</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Embedding Dimensions</label>
                        <select className="form-control">
                          <option value="1536">1536 (Recommended)</option>
                          <option value="1024">1024 (Balanced)</option>
                          <option value="512">512 (Fast)</option>
                          <option value="256">256 (Fastest)</option>
                        </select>
                      </div>
                    </div>

                    <div className="config-card">
                      <div className="config-card-header">
                        <div className="config-icon">💾</div>
                        <div className="config-title">Vector Storage</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Storage Backend</label>
                        <select className="form-control">
                          <option value="chroma">Chroma DB</option>
                          <option value="faiss">FAISS</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Index Type</label>
                        <select className="form-control">
                          <option value="flat">Exact Search (Flat)</option>
                          <option value="ivf">Approximate (IVF)</option>
                          <option value="hnsw">Graph-based (HNSW)</option>
                        </select>
                      </div>
                      <div className="toggle-group">
                        <label className="form-label">Enable Compression</label>
                        <label className="toggle-switch">
                          <input type="checkbox" />
                          <span className="toggle-slider"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Query Section for Layer 2 */}
                {showQuerySectionLayer2 && (
                  <div className="query-section show">
                    <div className="query-bar">
                      <input 
                        type="text" 
                        className="query-input" 
                        placeholder="Enter your search query..."
                        onKeyPress={(e) => e.key === 'Enter' && performQueryLayer2()}
                      />
                      <div className="query-icon" onClick={performQueryLayer2}>🔍</div>
                    </div>
                    <div className="query-results">
                      {queryResultsLayer2.map((result, index) => (
                        <div key={index} className="query-result-item">
                          <div className="query-result-title">{result.title}</div>
                          <div className="query-result-content">{result.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Layer 3: Deep Config */}
            {currentLayer === 3 && (
              <div className="content-section active">
                <div className="deep-config-container">
                  <div className="config-grid">
                    <div className="config-card">
                      <div className="config-card-header">
                        <div className="config-icon">🔧</div>
                        <div className="config-title">Advanced Preprocessing</div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Null Handling Strategy</label>
                        <select className="form-control">
                          <option value="drop-any">Drop rows with any null</option>
                          <option value="drop-all">Drop rows with all nulls</option>
                          <option value="interpolate">Interpolate values</option>
                          <option value="knn-impute">KNN Imputation</option>
                          <option value="custom-fill">Custom fill value</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Section */}
        {showProcessingPipeline && (
          <div className="action-section">
            <div className="processing-indicator">
              <div className="spinner" style={{ display: isProcessing ? 'block' : 'none' }}></div>
            </div>
            <div className="action-buttons">
              <button className="btn btn-secondary" onClick={resetProcessing}>
                Reset
              </button>
              <button className="btn btn-secondary" onClick={saveConfiguration}>
                Save Config
              </button>
              {currentLayer === 1 && (
                <button 
                  className="btn btn-success" 
                  onClick={startProcessing}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Start Processing'}
                </button>
              )}
              {currentLayer === 2 && (
                <>
                  <button 
                    className="btn btn-success" 
                    onClick={startProcessingLayer2}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Start Processing'}
                  </button>
                  {showQuerySectionLayer2 && (
                    <button 
                      className="btn btn-secondary" 
                      onClick={showConfigBoxesLayer2}
                    >
                      ← Back to Config
                    </button>
                  )}
                </>
              )}
              {currentLayer === 3 && (
                <>
                  <button 
                    className="btn btn-secondary" 
                    onClick={resetConfiguration}
                  >
                    Reset
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={saveConfiguration}
                  >
                    Save Config
                  </button>
                  <button 
                    className="btn btn-success" 
                    onClick={() => setDeepConfigStep(0)}
                  >
                    Start Deep Config
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Layer 3: Deep Config Mode */}
        {currentLayer === 3 && (
          <div className="content-section active">
            {/* Live CSV Preview Panel */}
            <div className="live-preview-panel">
              <div className="preview-header">
                <h3>📊 Live CSV Preview</h3>
                <div className="preview-stats">
                  <span>Rows: {csvPreviewData.length}</span>
                  <span>Columns: {previewColumns.length}</span>
                  <span>Nulls: {previewColumns.reduce((sum, col) => sum + col.nulls, 0)}</span>
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
                            {col.nulls > 0 && <span className="null-count">{col.nulls} nulls</span>}
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
            
            <div className="deep-config-container">
              {/* Step 0: File Upload and Data Preview */}
              {deepConfigStep === 0 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>📊 Data Preview & Analysis</h3>
                    <p>Review your uploaded data and proceed with preprocessing</p>
                  </div>
                  
                  {uploadedFile && (
                    <div className="data-preview">
                      <div className="preview-header">
                        <h4>File: {uploadedFile.name}</h4>
                        <div className="file-stats">
                          <span>Size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>Type: CSV</span>
                        </div>
                      </div>
                      
                      <div className="preview-content">
                        <div className="preview-table">
                          <table>
                            <thead>
                              <tr>
                                <th>Column</th>
                                <th>Type</th>
                                <th>Sample Value</th>
                                <th>Null Count</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>column_1</td>
                                <td>object</td>
                                <td>Sample data...</td>
                                <td>0</td>
                              </tr>
                              <tr>
                                <td>column_2</td>
                                <td>float64</td>
                                <td>123.45</td>
                                <td>5</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="step-actions">
                        <button 
                          className="btn btn-primary" 
                          onClick={() => setDeepConfigStep(1)}
                        >
                          Start Preprocessing
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Default Preprocessing */}
              {deepConfigStep === 1 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🔧 Default Preprocessing</h3>
                    <p>Apply initial data cleaning and validation</p>
                  </div>
                  
                  <div className="preprocessing-options">
                    <div className="option-group">
                      <h4>Data Validation</h4>
                      <div className="checkbox-list">
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Validate headers and normalize column names</span>
                        </label>
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Detect and handle encoding issues</span>
                        </label>
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Remove empty rows and columns</span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="option-group">
                      <h4>Data Types</h4>
                      <div className="checkbox-list">
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Auto-detect numeric columns</span>
                        </label>
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Auto-detect datetime columns</span>
                        </label>
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Convert text to appropriate types</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setPreprocessingData({ step: 1, completed: true });
                        setDeepConfigStep(2);
                      }}
                    >
                      Run Default Preprocessing
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Type Conversion */}
              {deepConfigStep === 2 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🔄 Data Type Conversion</h3>
                    <p>Manually specify data types for each column</p>
                  </div>
                  
                  <div className="type-conversion-grid">
                    {previewColumns.map((col, index) => (
                      <div key={index} className="conversion-item">
                        <div className="column-info">
                          <h4>{col.name}</h4>
                          <span className="current-type">Current: {col.type}</span>
                        </div>
                        <select 
                          className="form-control"
                          defaultValue="no-change"
                          onChange={(e) => {
                            const newType = e.target.value;
                            if (newType !== "no-change") {
                              setPreviewColumns(prev => 
                                prev.map((c, i) => 
                                  i === index ? { ...c, type: newType } : c
                                )
                              );
                              
                              // Update preview data based on type conversion
                              setCsvPreviewData(prev => 
                                prev.map(row => {
                                  const newRow = { ...row };
                                  if (newType === "numeric") {
                                    newRow[col.name] = typeof row[col.name] === 'number' ? row[col.name] : 
                                      row[col.name] === null ? null : parseFloat(row[col.name]) || 0;
                                  } else if (newType === "datetime") {
                                    newRow[col.name] = row[col.name] === null ? null : 
                                      new Date(row[col.name]).toISOString().split('T')[0];
                                  } else if (newType === "text") {
                                    newRow[col.name] = row[col.name] === null ? null : String(row[col.name]);
                                  }
                                  return newRow;
                                })
                              );
                            }
                          }}
                        >
                          <option value="no-change">No change</option>
                          <option value="text">Text</option>
                          <option value="numeric">Numeric</option>
                          <option value="datetime">DateTime</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(1)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(3)}
                    >
                      Apply Type Conversion
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Null Handling */}
              {deepConfigStep === 3 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🔍 Null Value Handling</h3>
                    <p>Handle missing values in your dataset</p>
                  </div>
                  
                  <div className="null-summary">
                    <h4>Null Values Summary</h4>
                    <div className="summary-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Column</th>
                            <th>Null Count</th>
                            <th>Null %</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>column_1</td>
                            <td>0</td>
                            <td>0%</td>
                            <td>No action needed</td>
                          </tr>
                          <tr>
                            <td>column_2</td>
                            <td>5</td>
                            <td>2.5%</td>
                            <td>Needs handling</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="null-handling-options">
                    <h4>Handle Null Values per Column</h4>
                    <div className="form-group">
                      <label className="form-label">Select Column</label>
                      <select 
                        className="form-control"
                        onChange={(e) => {
                          const selectedCol = e.target.value;
                          const col = previewColumns.find(c => c.name === selectedCol);
                          if (col) {
                            // Update the radio buttons based on column type
                            const strategyRadios = document.querySelectorAll('input[name="strategy"]');
                            strategyRadios.forEach(radio => {
                              if (col.type.includes('float') || col.type.includes('int')) {
                                // Numeric column - enable all options
                                radio.disabled = false;
                              } else if (col.type.includes('datetime')) {
                                // Datetime column - disable mean/median
                                if (['mean', 'median'].includes(radio.value)) {
                                  radio.disabled = true;
                                } else {
                                  radio.disabled = false;
                                }
                              } else {
                                // Text column - disable mean/median
                                if (['mean', 'median'].includes(radio.value)) {
                                  radio.disabled = true;
                                } else {
                                  radio.disabled = false;
                                }
                              }
                            });
                          }
                        }}
                      >
                        {previewColumns.filter(col => col.nulls > 0).map((col, index) => (
                          <option key={index} value={col.name}>
                            {col.name} ({col.nulls} nulls)
                          </option>
                        ))}
                        {previewColumns.filter(col => col.nulls === 0).length > 0 && (
                          <option value="" disabled>
                            --- No columns with nulls ---
                          </option>
                        )}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Handling Strategy</label>
                      <div className="radio-group">
                        <label className="radio-item">
                          <input type="radio" name="strategy" value="skip" defaultChecked />
                          <span>Skip / Leave as is</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="strategy" value="drop" />
                          <span>Drop Rows</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="strategy" value="mean" />
                          <span>Fill with Mean</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="strategy" value="mode" />
                          <span>Fill with Mode</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="strategy" value="custom" />
                          <span>Fill with Custom Value</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(2)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        const selectedStrategy = document.querySelector('input[name="strategy"]:checked')?.value;
                        const selectedColumn = document.querySelector('select').value;
                        
                        if (selectedStrategy && selectedColumn) {
                          setCsvPreviewData(prev => {
                            const newData = [...prev];
                            const col = previewColumns.find(c => c.name === selectedColumn);
                            
                            if (selectedStrategy === 'drop') {
                              // Remove rows with nulls
                              return newData.filter(row => row[selectedColumn] !== null);
                            } else if (selectedStrategy === 'mean' && col?.type.includes('float')) {
                              // Fill with mean
                              const values = newData.map(row => row[selectedColumn]).filter(val => val !== null);
                              const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
                              return newData.map(row => ({
                                ...row,
                                [selectedColumn]: row[selectedColumn] === null ? mean : row[selectedColumn]
                              }));
                            } else if (selectedStrategy === 'mode') {
                              // Fill with mode
                              const values = newData.map(row => row[selectedColumn]).filter(val => val !== null);
                              const mode = values.reduce((a, b, i, arr) => 
                                arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
                              );
                              return newData.map(row => ({
                                ...row,
                                [selectedColumn]: row[selectedColumn] === null ? mode : row[selectedColumn]
                              }));
                            } else if (selectedStrategy === 'custom') {
                              // Fill with custom value (example: 0 for numeric, 'N/A' for text)
                              const customValue = col?.type.includes('float') ? 0 : 'N/A';
                              return newData.map(row => ({
                                ...row,
                                [selectedColumn]: row[selectedColumn] === null ? customValue : row[selectedColumn]
                              }));
                            }
                            
                            return newData;
                          });
                          
                          // Update column null counts
                          setPreviewColumns(prev => 
                            prev.map(c => {
                              if (c.name === selectedColumn) {
                                const newNullCount = selectedStrategy === 'drop' ? 0 : 
                                  selectedStrategy === 'skip' ? c.nulls : 0;
                                return { ...c, nulls: newNullCount };
                              }
                              return c;
                            })
                          );
                        }
                        
                        setDeepConfigStep(4);
                      }}
                    >
                      Apply Null Handling
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Duplicate Handling */}
              {deepConfigStep === 4 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🔄 Duplicate Handling</h3>
                    <p>Remove or keep duplicate rows in your dataset</p>
                  </div>
                  
                  <div className="duplicate-info">
                    <div className="info-card">
                      <h4>Duplicate Analysis</h4>
                      <div className="metric">
                        <span className="metric-value">{
                          (() => {
                            const duplicates = csvPreviewData.filter((row, index) => 
                              csvPreviewData.findIndex(r => JSON.stringify(r) === JSON.stringify(row)) !== index
                            );
                            return duplicates.length;
                          })()
                        }</span>
                        <span className="metric-label">Duplicate Rows Found</span>
                      </div>
                      <p>{
                        (() => {
                          const duplicates = csvPreviewData.filter((row, index) => 
                            csvPreviewData.findIndex(r => JSON.stringify(r) === JSON.stringify(row)) !== index
                          );
                          return duplicates.length > 0 ? 
                            `${duplicates.length} duplicate rows detected.` : 
                            'No duplicate rows detected in your dataset.';
                        })()
                      }</p>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(3)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        // Remove duplicates if any exist
                        const uniqueData = csvPreviewData.filter((row, index) => 
                          csvPreviewData.findIndex(r => JSON.stringify(r) === JSON.stringify(row)) === index
                        );
                        setCsvPreviewData(uniqueData);
                        setDeepConfigStep(5);
                      }}
                    >
                      Remove Duplicates & Proceed
                    </button>
                  </div>
                </div>
              )}

              {/* Step 5: Text Processing */}
              {deepConfigStep === 5 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>📝 Text Processing</h3>
                    <p>Apply text normalization and cleaning</p>
                  </div>
                  
                  <div className="text-processing-options">
                    <div className="option-group">
                      <h4>Stop Words Removal</h4>
                      <label className="checkbox-item">
                        <input type="checkbox" />
                        <span>Remove common stop words from text columns</span>
                      </label>
                    </div>
                    
                    <div className="option-group">
                      <h4>Text Normalization</h4>
                      <div className="radio-group">
                        <label className="radio-item">
                          <input type="radio" name="normalization" value="lemmatize" defaultChecked />
                          <span>Lemmatization (Recommended)</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="normalization" value="stem" />
                          <span>Stemming</span>
                        </label>
                        <label className="radio-item">
                          <input type="radio" name="normalization" value="skip" />
                          <span>Skip normalization</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(4)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(6)}
                    >
                      Apply Text Processing
                    </button>
                  </div>
                </div>
              )}

              {/* Step 6: Metadata Selection */}
              {deepConfigStep === 6 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>📊 Metadata Selection</h3>
                    <p>Select columns to store as metadata in ChromaDB</p>
                  </div>
                  
                  <div className="metadata-options">
                    <div className="option-group">
                      <label className="checkbox-item">
                        <input type="checkbox" defaultChecked />
                        <span>Store metadata in ChromaDB for filtering and retrieval</span>
                      </label>
                    </div>
                    
                    <div className="metadata-selection">
                      <div className="selection-group">
                        <h4>Numeric Columns</h4>
                        <div className="multiselect-container">
                          <label className="checkbox-item">
                            <input type="checkbox" defaultChecked />
                            <span>column_2 (min/mean/max per chunk)</span>
                          </label>
                        </div>
                      </div>
                      
                      <div className="selection-group">
                        <h4>Categorical Columns</h4>
                        <div className="multiselect-container">
                          <label className="checkbox-item">
                            <input type="checkbox" defaultChecked />
                            <span>column_1 (mode per chunk)</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(5)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(7)}
                    >
                      Start Chunking Process
                    </button>
                  </div>
                </div>
              )}

              {/* Step 7: Chunking Method Selection */}
              {deepConfigStep === 7 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>✂️ Chunking Method Selection</h3>
                    <p>Choose how to split your data into chunks</p>
                  </div>
                  
                  <div className="chunking-methods">
                    <div className="method-grid">
                      <div className="method-card">
                        <div className="method-header">
                          <input type="radio" name="chunking-method" value="fixed" id="fixed" />
                          <label htmlFor="fixed">
                            <h4>Fixed Size Chunking</h4>
                            <p>Splits data into fixed-size chunks with optional overlap</p>
                          </label>
                        </div>
                        <div className="method-options">
                          <div className="form-group">
                            <label className="form-label">Chunk Size (rows)</label>
                            <input type="number" className="form-control" defaultValue="100" min="1" max="100000" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Overlap (rows)</label>
                            <input type="number" className="form-control" defaultValue="0" min="0" max="99" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="method-card">
                        <div className="method-header">
                          <input type="radio" name="chunking-method" value="document" id="document" />
                          <label htmlFor="document">
                            <h4>Document Based Chunking</h4>
                            <p>Groups rows by a key column and splits large groups by token count</p>
                          </label>
                        </div>
                        <div className="method-options">
                          <div className="form-group">
                            <label className="form-label">Key Column</label>
                            <select className="form-control">
                              <option value="column_1">column_1</option>
                              <option value="column_2">column_2</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Token Limit</label>
                            <input type="number" className="form-control" defaultValue="2000" min="100" max="10000" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="method-card">
                        <div className="method-header">
                          <input type="radio" name="chunking-method" value="semantic" id="semantic" defaultChecked />
                          <label htmlFor="semantic">
                            <h4>Semantic Chunking</h4>
                            <p>AI-powered semantic chunking that groups rows by meaning</p>
                          </label>
                        </div>
                        <div className="method-options">
                          <div className="form-group">
                            <label className="form-label">Batch Size</label>
                            <input type="number" className="form-control" defaultValue="100" min="50" max="500" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Similarity Threshold</label>
                            <input type="range" className="range-slider" min="0.3" max="0.9" step="0.1" defaultValue="0.6" />
                            <div className="range-labels">
                              <span>0.3</span>
                              <span className="range-value">0.6</span>
                              <span>0.9</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="method-card">
                        <div className="method-header">
                          <input type="radio" name="chunking-method" value="recursive" id="recursive" />
                          <label htmlFor="recursive">
                            <h4>Recursive Chunking</h4>
                            <p>Semantic text-recursive chunking with character budget</p>
                          </label>
                        </div>
                        <div className="method-options">
                          <div className="form-group">
                            <label className="form-label">Target Characters</label>
                            <input type="number" className="form-control" defaultValue="5000" min="500" max="20000" />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Overlap (characters)</label>
                            <input type="number" className="form-control" defaultValue="500" min="0" max="5000" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(6)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setChunkingResult({ method: 'semantic', totalChunks: 45 });
                        setDeepConfigStep(8);
                      }}
                    >
                      Apply Chunking Method
                    </button>
                  </div>
                </div>
              )}

              {/* Step 8: Chunking Results */}
              {deepConfigStep === 8 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>📊 Chunking Results</h3>
                    <p>Review your chunking results and quality assessment</p>
                  </div>
                  
                  <div className="results-summary">
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-value">45</div>
                        <div className="metric-label">Total Chunks</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">Semantic</div>
                        <div className="metric-label">Method Used</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">PASS</div>
                        <div className="metric-label">Quality</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="quality-report">
                    <h4>Quality Assessment</h4>
                    <div className="report-content">
                      <pre>{`{
  "overall_quality": "PASS",
  "chunk_size_distribution": "Good",
  "overlap_consistency": "Excellent",
  "semantic_coherence": "High"
}`}</pre>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(7)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(9)}
                    >
                      Generate Embeddings
                    </button>
                  </div>
                </div>
              )}

              {/* Step 9: Embedding Generation */}
              {deepConfigStep === 9 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🧠 Embedding Generation</h3>
                    <p>Generate vector embeddings for your chunks</p>
                  </div>
                  
                  <div className="embedding-options">
                    <div className="model-selection">
                      <h4>Select Embedding Model</h4>
                      <div className="model-grid">
                        <div className="model-card">
                          <input type="radio" name="embedding-model" value="all-MiniLM-L6-v2" id="mini" defaultChecked />
                          <label htmlFor="mini">
                            <h5>all-MiniLM-L6-v2</h5>
                            <p>Fast and efficient, 384 dimensions</p>
                          </label>
                        </div>
                        <div className="model-card">
                          <input type="radio" name="embedding-model" value="all-mpnet-base-v2" id="mpnet" />
                          <label htmlFor="mpnet">
                            <h5>all-mpnet-base-v2</h5>
                            <p>High quality, 768 dimensions</p>
                          </label>
                        </div>
                        <div className="model-card">
                          <input type="radio" name="embedding-model" value="sentence-transformers" id="sentence" />
                          <label htmlFor="sentence">
                            <h5>sentence-transformers</h5>
                            <p>General purpose, 384 dimensions</p>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="embedding-config">
                      <div className="form-group">
                        <label className="form-label">Batch Size</label>
                        <input type="number" className="form-control" defaultValue="32" min="1" max="128" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(8)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => {
                        setEmbeddingResult({ model: 'all-MiniLM-L6-v2', dimensions: 384, processingTime: 12.5 });
                        setDeepConfigStep(10);
                      }}
                    >
                      Generate Embeddings
                    </button>
                  </div>
                </div>
              )}

              {/* Step 10: Embedding Results */}
              {deepConfigStep === 10 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>📈 Embedding Results</h3>
                    <p>Review your embedding generation results</p>
                  </div>
                  
                  <div className="embedding-summary">
                    <div className="metrics-grid">
                      <div className="metric-card">
                        <div className="metric-value">45</div>
                        <div className="metric-label">Total Chunks</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">all-MiniLM-L6-v2</div>
                        <div className="metric-label">Model Used</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">384</div>
                        <div className="metric-label">Vector Dimension</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-value">12.5s</div>
                        <div className="metric-label">Processing Time</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(9)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(11)}
                    >
                      Store in ChromaDB
                    </button>
                  </div>
                </div>
              )}

              {/* Step 11: Vector Storage */}
              {deepConfigStep === 11 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>💾 Vector Storage & Retrieval</h3>
                    <p>Store embeddings in ChromaDB and test retrieval</p>
                  </div>
                  
                  <div className="storage-config">
                    <div className="config-group">
                      <div className="form-group">
                        <label className="form-label">ChromaDB Persist Directory</label>
                        <input type="text" className="form-control" defaultValue=".chroma" />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Collection Name</label>
                        <input type="text" className="form-control" defaultValue="csv_chunks" />
                      </div>
                      <div className="form-group">
                        <label className="checkbox-item">
                          <input type="checkbox" defaultChecked />
                          <span>Reset collection before storing (clears previous data)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="storage-actions">
                    <div className="action-group">
                      <button 
                        className="btn btn-success" 
                        onClick={() => {
                          // Simulate storage
                          setDeepConfigStep(12);
                        }}
                      >
                        Store Embeddings to ChromaDB
                      </button>
                    </div>
                    
                    <div className="action-group">
                      <div className="retrieval-section">
                        <h4>Test Retrieval</h4>
                        <div className="form-group">
                          <label className="form-label">Search Query</label>
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Enter your search query..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                setShowRetrievalPopup(true);
                                setRetrievalResults([
                                  {
                                    id: 1,
                                    content: "Customer data analysis showing purchasing patterns across different demographics and regions. This chunk contains detailed information about customer behavior, preferences, and buying trends that can help optimize marketing strategies and product development.",
                                    score: 0.89,
                                    metadata: { chunk_id: "chunk_001", source: "customer_data.csv" }
                                  },
                                  {
                                    id: 2,
                                    content: "Product performance metrics including sales figures, customer satisfaction ratings, and return rates. This data provides insights into which products are performing well and which may need improvement or discontinuation.",
                                    score: 0.85,
                                    metadata: { chunk_id: "chunk_002", source: "customer_data.csv" }
                                  },
                                  {
                                    id: 3,
                                    content: "Market trend analysis covering seasonal variations, competitor analysis, and growth projections. This information helps businesses understand market dynamics and make informed strategic decisions.",
                                    score: 0.82,
                                    metadata: { chunk_id: "chunk_003", source: "customer_data.csv" }
                                  }
                                ]);
                              }
                            }}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Top K Results</label>
                          <input type="number" className="form-control" defaultValue="3" min="1" max="20" />
                        </div>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => {
                            setShowRetrievalPopup(true);
                            setRetrievalResults([
                              {
                                id: 1,
                                content: "Customer data analysis showing purchasing patterns across different demographics and regions. This chunk contains detailed information about customer behavior, preferences, and buying trends that can help optimize marketing strategies and product development.",
                                score: 0.89,
                                metadata: { chunk_id: "chunk_001", source: "customer_data.csv" }
                              },
                              {
                                id: 2,
                                content: "Product performance metrics including sales figures, customer satisfaction ratings, and return rates. This data provides insights into which products are performing well and which may need improvement or discontinuation.",
                                score: 0.85,
                                metadata: { chunk_id: "chunk_002", source: "customer_data.csv" }
                              },
                              {
                                id: 3,
                                content: "Market trend analysis covering seasonal variations, competitor analysis, and growth projections. This information helps businesses understand market dynamics and make informed strategic decisions.",
                                score: 0.82,
                                metadata: { chunk_id: "chunk_003", source: "customer_data.csv" }
                              }
                            ]);
                          }}
                        >
                          Search ChromaDB
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-secondary" 
                      onClick={() => setDeepConfigStep(10)}
                    >
                      ← Back
                    </button>
                    <button 
                      className="btn btn-success" 
                      onClick={() => {
                        // Complete the process
                        setDeepConfigStep(12);
                      }}
                    >
                      Complete Process
                    </button>
                  </div>
                </div>
              )}

              {/* Step 12: Process Complete */}
              {deepConfigStep === 12 && (
                <div className="config-step">
                  <div className="step-header">
                    <h3>🎉 Process Complete!</h3>
                    <p>Your CSV has been successfully processed and stored in ChromaDB</p>
                  </div>
                  
                  <div className="completion-summary">
                    <div className="summary-card">
                      <h4>Processing Summary</h4>
                      <div className="summary-list">
                        <div className="summary-item">
                          <span className="checkmark">✅</span>
                          <span>Data preprocessing completed</span>
                        </div>
                        <div className="summary-item">
                          <span className="checkmark">✅</span>
                          <span>45 chunks created using semantic chunking</span>
                        </div>
                        <div className="summary-item">
                          <span className="checkmark">✅</span>
                          <span>Embeddings generated with all-MiniLM-L6-v2</span>
                        </div>
                        <div className="summary-item">
                          <span className="checkmark">✅</span>
                          <span>Data stored in ChromaDB collection</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setDeepConfigStep(0)}
                    >
                      Start New Process
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Retrieval Results Popup */}
        {showRetrievalPopup && (
          <div className="retrieval-popup-overlay" onClick={() => setShowRetrievalPopup(false)}>
            <div className="retrieval-popup" onClick={(e) => e.stopPropagation()}>
              <div className="popup-header">
                <h3>🔍 Search Results</h3>
                <button 
                  className="close-btn" 
                  onClick={() => setShowRetrievalPopup(false)}
                >
                  ×
                </button>
              </div>
              
              <div className="popup-content">
                <div className="results-header">
                  <p>Found {retrievalResults.length} relevant chunks:</p>
                </div>
                
                <div className="results-list">
                  {retrievalResults.map((result, index) => (
                    <div key={result.id} className="result-item">
                      <div className="result-header">
                        <span className="result-score">Score: {result.score.toFixed(3)}</span>
                        <span className="result-id">Chunk {result.id}</span>
                      </div>
                      <div className="result-content">
                        {result.content}
                      </div>
                      <div className="result-metadata">
                        <small>Source: {result.metadata.source} | ID: {result.metadata.chunk_id}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="popup-actions">
                <button 
                  className="btn btn-secondary" 
                  onClick={() => setShowRetrievalPopup(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
