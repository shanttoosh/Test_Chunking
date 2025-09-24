import React, { useState, useEffect } from 'react';
import './App.css';
import QueryBar from './components/QueryBar';
import Sidebar from './components/Sidebar';
import ProgressBar from './components/ProgressBar';
import StatsPanel from './components/StatsPanel';
import Layer1 from './pages/Layer1';
import Layer2 from './pages/Layer2';
import Layer3 from './pages/Layer3';
import { LivePreviewPanel, Step0Preview, Step1DefaultPreprocess, Step7Chunking, Step9Embedding, Step11Storage, Step12Retrieval, PreprocessingDownload, ChunkingDownload, EmbeddingDownload } from './features/deep-config';
import { API_CONFIG, apiCall, uploadAndProcessCSV, searchAPI } from './api/index';

// API moved to src/api/index.js and Query UI to components/QueryBar

function App() {
  const [currentLayer, setCurrentLayer] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [processingStats, setProcessingStats] = useState({
    totalChunks: 0,
    processTime: 0,
    memoryUsage: 0
  });
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

  // Layer 3 Form States
  const [selectedNullColumn, setSelectedNullColumn] = useState('');
  const [nullHandlingStrategy, setNullHandlingStrategy] = useState('skip');
  const [customNullValue, setCustomNullValue] = useState('');
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [removeStopwords, setRemoveStopwords] = useState(false);
  const [normalizeMethod, setNormalizeMethod] = useState('lemmatize');
  const [selectedNumericCols, setSelectedNumericCols] = useState([]);
  const [selectedCategoricalCols, setSelectedCategoricalCols] = useState([]);
  const [selectedChunkingMethod, setSelectedChunkingMethod] = useState('semantic');
  const [chunkSize, setChunkSize] = useState(100);
  const [overlap, setOverlap] = useState(0);
  const [keyColumn, setKeyColumn] = useState('');
  const [tokenLimit, setTokenLimit] = useState(2000);
  const [modelName, setModelName] = useState('gpt-4');
  const [preserveHeaders, setPreserveHeaders] = useState(true);
  const [useMultipleKeys, setUseMultipleKeys] = useState(false);
  const [batchSize, setBatchSize] = useState(100);
  const [similarityThreshold, setSimilarityThreshold] = useState(0.6);
  const [useFastModel, setUseFastModel] = useState(true);
  const [textChunkChars, setTextChunkChars] = useState(5000);
  const [overlapChars, setOverlapChars] = useState(500);
  const [embeddingModelChoice, setEmbeddingModelChoice] = useState('all-MiniLM-L6-v2');
  const [embeddingBatchSize, setEmbeddingBatchSize] = useState(32);
  const [persistDir, setPersistDir] = useState('.chroma');
  const [collectionName, setCollectionName] = useState('csv_chunks');
  const [resetBeforeStore, setResetBeforeStore] = useState(true);
  const [storageBackend, setStorageBackend] = useState('chroma');
  const [similarityMetric, setSimilarityMetric] = useState('cosine');
  const [nClusters, setNClusters] = useState(null);
  const [selectedKeyColumns, setSelectedKeyColumns] = useState([]);
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);
  const [useMetadataFilters, setUseMetadataFilters] = useState(false);
  const [numericFilters, setNumericFilters] = useState({});
  const [categoricalFilters, setCategoricalFilters] = useState({});
  const [textLenFilter, setTextLenFilter] = useState(null);
  const [wordCountFilter, setWordCountFilter] = useState(null);
  
  const [processingSteps, setProcessingSteps] = useState([
    { id: 'upload', name: 'File Upload', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'analyze', name: 'Data Analysis', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'preprocess', name: 'Preprocessing', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'chunking', name: 'Chunking', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'embedding', name: 'Embedding', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'storage', name: 'Storing', status: 'pending', duration: '', stepText: '', liveSeconds: 0 },
    { id: 'retrieval', name: 'Retrieval', status: 'pending', duration: '', stepText: '', liveSeconds: 0 }
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
    updateStepStatus('upload', 'completed', 'Completed in 1s', '', 0);
  };

  // Update step status
  const updateStepStatus = (stepId, status, duration = '', stepText = '', liveSeconds = 0) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, duration, stepText, liveSeconds } : step
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
    setProcessingProgress(0);
    setProcessingStep('Starting...');
    
    try {
      const steps = [
        { id: 'upload', duration: 500, name: 'Uploading File' },
        { id: 'chunking', duration: 1000, name: 'Chunking' },
        { id: 'embedding', duration: 1000, name: 'Generating Embeddings' },
        { id: 'storage', duration: 500, name: 'Storing Vectors' }
      ];

      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progress = Math.round(((i + 1) / steps.length) * 100);
        const totalSeconds = Math.floor(step.duration / 1000);
        
        // Set step to executing with live seconds
        updateStepStatus(step.id, 'active', 'Executing... 0s', '', 0);
        setProcessingStep(step.name);
        setProcessingProgress(progress);
        
        // Live countup
        for (let second = 0; second < totalSeconds; second++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          updateStepStatus(step.id, 'active', `Executing... ${second + 1}s`, '', 0);
        }
        
        // Set step to completed
        updateStepStatus(step.id, 'completed', `Completed in ${totalSeconds}s`, '', 0);
      }

      // Make the actual API call
      setProcessingStep('Processing with Layer 1 API...');
      const result = await uploadAndProcessCSV(uploadedFile, 1);
      
      if (result.success) {
        // Update stats with real data
        setProcessingStats({
          totalChunks: result.data.summary.total_chunks,
          processTime: result.data.embedding.stats.processing_time,
          memoryUsage: result.data.storage.stats.storage_stats?.total_embedding_size || 0
        });
        
        setShowQuerySection(true);
        alert('Processing completed successfully!');
      } else {
        throw new Error(result.error || 'Processing failed');
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      alert(`Processing failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProcessingProgress(100);
    }
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
    setProcessingProgress(0);
    setProcessingStep('Starting...');
    
    const steps = [
      { id: 'analyze', duration: 1000, name: 'Analyzing Data' },
      { id: 'preprocess', duration: 2000, name: 'Preprocessing' },
      { id: 'chunking', duration: 3000, name: 'Chunking' },
      { id: 'embedding', duration: 4000, name: 'Generating Embeddings' },
      { id: 'storage', duration: 2000, name: 'Storing Vectors' },
      { id: 'retrieval', duration: 1500, name: 'Testing Retrieval' }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const progress = Math.round(((i + 1) / steps.length) * 100);
      const totalSeconds = Math.floor(step.duration / 1000);
      
      // Set step to executing with live seconds
      updateStepStatus(step.id, 'active', 'Executing... 0s', '', 0);
      setProcessingStep(step.name);
      setProcessingProgress(progress);
      
      // Live countup
      for (let second = 0; second < totalSeconds; second++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateStepStatus(step.id, 'active', `Executing... ${second + 1}s`, '', 0);
      }
      
      // Set step to completed
      updateStepStatus(step.id, 'completed', `Completed in ${totalSeconds}s`, '', 0);
    }

    setProcessingStep('Completed!');
    setProcessingProgress(100);
    setIsProcessing(false);
    setProcessingStats({
      totalChunks: Math.floor(Math.random() * 500) + 100, // Random between 100-600
      processTime: Math.floor(Math.random() * 20) + 5, // Random between 5-25 seconds
      memoryUsage: Math.floor(Math.random() * 50) + 30 // Random between 30-80MB
    });
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
  const performQuery = async () => {
    if (!query.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      const result = await searchAPI(query, 1, 5);
      
      if (result.success) {
        // Format results for display
        const formattedResults = result.results.map((item, index) => ({
          title: `Chunk ${index + 1}`,
          content: item.content,
          similarity: item.similarity,
          metadata: item.metadata
        }));
        
        setQueryResults(formattedResults);
      } else {
        throw new Error(result.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert(`Search failed: ${error.message}`);
    }
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
    setProcessingProgress(0);
    setProcessingStep('');
    setProcessingStats({
      totalChunks: 0,
      processTime: 0,
      memoryUsage: 0
    });
    setUploadedFile(null);
    setFileUploaded(false);
    setShowSidebar(false);
    setShowProcessingPipeline(false);
    setShowQuerySection(false);
    setShowQuerySectionLayer2(false);
    setShowConfigBoxes(true);
    setQueryResults([]);
    setQueryResultsLayer2([]);
    setProcessingSteps(prev => prev.map(step => ({ ...step, status: 'pending', duration: '', stepText: '', liveSeconds: 0 })));
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

  // Auto-scroll to next step
  const scrollToNextStep = (stepNumber) => {
    setTimeout(() => {
      const nextStepElement = document.querySelector(`[data-step="${stepNumber}"]`);
      if (nextStepElement) {
        nextStepElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
        // Add active class for visual feedback
        nextStepElement.classList.add('active');
        setTimeout(() => {
          nextStepElement.classList.remove('active');
        }, 2000);
      }
    }, 500);
  };

  // Layer 3 Processing Functions
  const handleNullColumnChange = (column) => {
    setSelectedNullColumn(column);
  };

  const applyNullHandling = (strategy, customValue) => {
    // Mock null handling logic
    console.log(`Applying ${strategy} to ${selectedNullColumn}`, customValue);
    setDeepConfigStep(4);
    scrollToNextStep(4);
  };

  const applyDuplicateHandling = () => {
    // Mock duplicate handling logic
    console.log('Applying duplicate handling');
    setDeepConfigStep(5);
    scrollToNextStep(5);
  };

  const applyStopWordsRemoval = () => {
    // Mock stop words removal logic
    console.log('Applying stop words removal');
    setDeepConfigStep(6);
    scrollToNextStep(6);
  };

  const applyNormalization = (method) => {
    // Mock normalization logic
    console.log(`Applying ${method} normalization`);
    setDeepConfigStep(7);
    scrollToNextStep(7);
  };

  const startChunkingProcess = () => {
    // Mock chunking process
    console.log('Starting chunking process');
    setDeepConfigStep(7);
    scrollToNextStep(7);
  };

  const applyChunkingMethod = (method, params) => {
    // Mock chunking method application
    console.log(`Applying ${method} chunking`, params);
    setChunkingResult({ method, totalChunks: 45, chunks: [] });
    setDeepConfigStep(7.5);
    scrollToNextStep(7.5);
  };

  const startEmbeddingProcess = () => {
    // Mock embedding process
    console.log('Starting embedding process');
    setEmbeddingResult({ model_used: embeddingModelChoice, vector_dimension: 384, processing_time: 12.5, total_chunks: 45, embedded_chunks: [] });
    setDeepConfigStep(10);
    scrollToNextStep(10);
  };

  const generateEmbeddings = (model, batchSize) => {
    // Mock embedding generation
    console.log(`Generating embeddings with ${model}`, batchSize);
    setEmbeddingResult({ model_used: model, vector_dimension: 384, processing_time: 12.5, total_chunks: 45, embedded_chunks: [] });
    setDeepConfigStep(9.5);
    scrollToNextStep(9.5);
  };

  const storeEmbeddings = (backend, collection) => {
    // Mock embedding storage
    console.log(`Storing embeddings in ${backend}`, collection);
    setDeepConfigStep(11);
    scrollToNextStep(11);
  };

  const searchChromaDB = (query, topK) => {
    // Mock search functionality
    console.log(`Searching with query: ${query}`, topK);
    const mockResults = [
      {
        id: '1',
        content: 'Sample search result 1',
        score: 0.95,
        metadata: { source: 'chunk_1' }
      },
      {
        id: '2', 
        content: 'Sample search result 2',
        score: 0.87,
        metadata: { source: 'chunk_2' }
      },
      {
        id: '3',
        content: 'Sample search result 3', 
        score: 0.82,
        metadata: { source: 'chunk_3' }
      }
    ];
    setRetrievalResults(mockResults);
    setShowRetrievalPopup(true);
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        show={showSidebar}
        steps={currentLayer === 1 ? processingSteps.filter(s => s.id !== 'preprocess') : processingSteps}
        progress={processingProgress}
        progressText={isProcessing ? (processingStep || 'Processing...') : 'Processing Complete!'}
        stats={processingStats}
        fileSizeMB={uploadedFile ? `${(uploadedFile.size / 1024 / 1024).toFixed(1)}MB` : '0MB'}
      />

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
                  <div className="layer-icon">
                    <div className="icon-circle">
                      <div className="icon-content">⚡</div>
                    </div>
                  </div>
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
                  <div className="layer-icon">
                    <div className="icon-circle">
                      <div className="icon-content">⚙️</div>
                    </div>
                  </div>
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
                  <div className="layer-icon">
                    <div className="icon-circle">
                      <div className="icon-content">🔬</div>
                    </div>
                  </div>
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
              <Layer1
                show
                showQuerySection={showQuerySection}
                query={query}
                setQuery={setQuery}
                performQuery={performQuery}
                queryResults={queryResults}
              />
            )}

            {/* Layer 2: Config Mode */}
            {currentLayer === 2 && (
              <div className="content-section active">
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
                      <div className="query-icon" onClick={performQueryLayer2}>
                        <div className="search-icon-circle">
                          <div className="search-icon-content">🔍</div>
                        </div>
                      </div>
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

          </div>
        )}

        {/* Action Section for Layer 1 and Layer 2 */}
        {showProcessingPipeline && (currentLayer === 1 || currentLayer === 2) && (
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

        {/* Layer 3: Deep Config Mode */}
        {currentLayer === 3 && (
          <Layer3
            show
            fileUploaded={fileUploaded}
            render={() => (
              <>
            <LivePreviewPanel csvPreviewData={csvPreviewData} previewColumns={previewColumns} />
            
            <div className="deep-config-container">
              {/* Step 0: File Upload and Data Preview */}
              {deepConfigStep === 0 && (
                <Step0Preview
                  uploadedFile={uploadedFile}
                  onNext={() => { setDeepConfigStep(1); scrollToNextStep(1); }}
                />
              )}

              {/* Step 1: Default Preprocessing */}
              {deepConfigStep === 1 && (
                <Step1DefaultPreprocess onNext={() => { setPreprocessingData({ step: 1, completed: true }); setDeepConfigStep(2); }} />
              )}

              {/* Step 2: Type Conversion */}
              {deepConfigStep === 2 && (
                <div className="config-step" data-step="2">
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
                      onClick={() => {
                        setDeepConfigStep(3);
                        scrollToNextStep(3);
                      }}
                    >
                      Apply Type Conversion
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Null Handling */}
              {deepConfigStep === 3 && (
                <div className="config-step" data-step="3">
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
                          {previewColumns.map((col, index) => (
                            <tr key={index}>
                              <td>{col.name}</td>
                              <td>{col.nulls}</td>
                              <td>{((col.nulls / csvPreviewData.length) * 100).toFixed(1)}%</td>
                              <td>{col.nulls > 0 ? 'Needs handling' : 'No action needed'}</td>
                            </tr>
                          ))}
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
                <div className="config-step" data-step="4">
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
                <div className="config-step" data-step="5">
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
                      onClick={() => {
                        const removeStopwords = document.querySelector('input[type="checkbox"]')?.checked;
                        const normalizationMethod = document.querySelector('input[name="normalization"]:checked')?.value;
                        
                        setCsvPreviewData(prev => 
                          prev.map(row => {
                            const newRow = { ...row };
                            
                            // Apply text processing to text columns
                            previewColumns.forEach(col => {
                              if (col.type === 'object' && row[col.name] !== null) {
                                let processedText = String(row[col.name]);
                                
                                // Remove stop words (simple example)
                                if (removeStopwords) {
                                  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
                                  processedText = processedText.split(' ').filter(word => 
                                    !stopWords.includes(word.toLowerCase())
                                  ).join(' ');
                                }
                                
                                // Apply normalization
                                if (normalizationMethod === 'lemmatize') {
                                  // Simple lemmatization example
                                  processedText = processedText.toLowerCase();
                                } else if (normalizationMethod === 'stem') {
                                  // Simple stemming example
                                  processedText = processedText.toLowerCase().replace(/ing$|ed$|s$/, '');
                                }
                                
                                newRow[col.name] = processedText;
                              }
                            });
                            
                            return newRow;
                          })
                        );
                        
                        setDeepConfigStep(5.5);
                      }}
                    >
                      Apply Text Processing
                    </button>
                  </div>
                </div>
              )}

              {/* Preprocessing Download - After Step 5 */}
              {deepConfigStep === 5.5 && (
                <PreprocessingDownload
                  csvPreviewData={csvPreviewData}
                  previewColumns={previewColumns}
                  uploadedFileName={uploadedFile?.name}
                  onDownload={() => setDeepConfigStep(6)}
                />
              )}

              {/* Step 6: Metadata Selection */}
              {deepConfigStep === 6 && (
                <div className="config-step" data-step="6">
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
                      onClick={() => {
                        startChunkingProcess();
                      }}
                    >
                      Start Chunking Process
                    </button>
                  </div>
                </div>
              )}

              {/* Step 7: Chunking Method Selection */}
              {deepConfigStep === 7 && (
                <Step7Chunking
                  selectedChunkingMethod={selectedChunkingMethod} setSelectedChunkingMethod={setSelectedChunkingMethod}
                  chunkSize={chunkSize} setChunkSize={setChunkSize} overlap={overlap} setOverlap={setOverlap}
                  textChunkChars={textChunkChars} setTextChunkChars={setTextChunkChars} overlapChars={overlapChars} setOverlapChars={setOverlapChars}
                  batchSize={batchSize} setBatchSize={setBatchSize} similarityThreshold={similarityThreshold} setSimilarityThreshold={setSimilarityThreshold}
                  nClusters={nClusters ?? null} setNClusters={setNClusters}
                  previewColumns={previewColumns}
                  keyColumn={keyColumn} setKeyColumn={setKeyColumn}
                  useMultipleKeys={useMultipleKeys} setUseMultipleKeys={setUseMultipleKeys}
                  keyColumns={selectedKeyColumns || []} setKeyColumns={setSelectedKeyColumns}
                  tokenLimit={tokenLimit} setTokenLimit={setTokenLimit}
                  modelName={modelName} setModelName={setModelName}
                  preserveHeaders={preserveHeaders} setPreserveHeaders={setPreserveHeaders}
                  onBack={() => setDeepConfigStep(6)}
                  onApply={() => { setChunkingResult({ method: selectedChunkingMethod, totalChunks: 45, chunks: [] }); setDeepConfigStep(7.5); }}
                />
              )}

              {/* Chunking Download - After Step 7 */}
              {deepConfigStep === 7.5 && (
                <ChunkingDownload
                  chunkingResult={chunkingResult}
                  uploadedFileName={uploadedFile?.name}
                  onDownload={() => setDeepConfigStep(8)}
                />
              )}

              {/* Step 8: Chunking Results */}
              {deepConfigStep === 8 && (
                <div className="config-step" data-step="8">
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
                      onClick={() => {
                        setDeepConfigStep(9);
                        scrollToNextStep(9);
                      }}
                    >
                      Generate Embeddings
                    </button>
                  </div>
                </div>
              )}

              {/* Step 9: Embedding Generation */}
              {deepConfigStep === 9 && (
                <Step9Embedding
                  model={embeddingModelChoice}
                  setModel={setEmbeddingModelChoice}
                  batchSize={embeddingBatchSize}
                  setBatchSize={setEmbeddingBatchSize}
                  onBack={() => setDeepConfigStep(8)}
                  onNext={() => { setEmbeddingResult({ model_used: embeddingModelChoice, vector_dimension: 384, processing_time: 12.5, total_chunks: 45, embedded_chunks: [] }); setDeepConfigStep(10); }}
                />
              )}

              {/* Embedding Download - After Step 9 */}
              {deepConfigStep === 9.5 && (
                <EmbeddingDownload
                  embeddingResult={embeddingResult}
                  uploadedFileName={uploadedFile?.name}
                  onDownload={() => setDeepConfigStep(10)}
                />
              )}

              {/* Step 10: Embedding Results */}
              {deepConfigStep === 10 && (
                <div className="config-step" data-step="10">
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
                      onClick={() => {
                        storeEmbeddings('ChromaDB', collectionName);
                      }}
                    >
                      Store in ChromaDB
                    </button>
                  </div>
                </div>
              )}

              {/* Step 11: Vector Storage */}
              {deepConfigStep === 11 && (
                <Step11Storage
                  storageBackend={storageBackend}
                  setStorageBackend={setStorageBackend}
                  persistDir={persistDir}
                  setPersistDir={setPersistDir}
                  collectionName={collectionName}
                  setCollectionName={setCollectionName}
                  resetBeforeStore={resetBeforeStore}
                  setResetBeforeStore={setResetBeforeStore}
                  similarityMetric={similarityMetric}
                  setSimilarityMetric={setSimilarityMetric}
                  onBack={() => setDeepConfigStep(10)}
                  onStore={() => setDeepConfigStep(12)}
                  onOpenRetrieval={() => setDeepConfigStep(12)}
                />
              )}

              {/* Step 12: Retrieval */}
              {deepConfigStep === 12 && (
                <Step12Retrieval
                  similarityMetric={similarityMetric}
                  setSimilarityMetric={setSimilarityMetric}
                  topK={topK}
                  setTopK={setTopK}
                  query={query}
                  setQuery={setQuery}
                  onBack={() => setDeepConfigStep(11)}
                  onSearch={() => { setShowRetrievalPopup(true); }}
                  onComplete={() => setDeepConfigStep(0)}
                />
              )}
            </div>
            </>
            )}
          />
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
