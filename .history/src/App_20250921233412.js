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
                          <option value="auto">Auto-detect & Handle</option>
                          <option value="remove">Remove null rows</option>
                          <option value="fill-mean">Fill with mean</option>
                          <option value="fill-mode">Fill with mode</option>
                          <option value="forward-fill">Forward fill</option>
                          <option value="custom">Custom value</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Data Type Conversion</label>
                        <select className="form-control">
                          <option value="auto">Auto-infer types</option>
                          <option value="string">Keep as strings</option>
                          <option value="manual">Manual mapping</option>
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
                          <option value="faiss">FAISS (Recommended)</option>
                          <option value="chroma">Chroma DB</option>
                          <option value="pinecone">Pinecone</option>
                          <option value="weaviate">Weaviate</option>
                          <option value="qdrant">Qdrant</option>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
