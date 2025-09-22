// Global variables
let currentLayer = 1;
let isProcessing = false;
let uploadedFile = null;
let processedData = null;
let processingStartTime = null;
let stepTimers = {};
let stepStartTimes = {};
let layerSelected = true; // Default to true for Fast Mode
let fileUploaded = false;

// File upload handling
function handleFileUpload(event) {
    console.log('handleFileUpload called');
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
    }

    uploadedFile = file;
    const uploadArea = document.getElementById('file-upload-area');
    
    // Update upload area to show success with tick
    uploadArea.classList.add('uploaded');
    uploadArea.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 20px; height: 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">✓</div>
            <h3 style="font-size: 20px; font-weight: 700; margin: 0; color: var(--text-primary);">File Uploaded Successfully!</h3>
        </div>
        <p style="color: var(--text-secondary); margin-top: 8px; font-size: 14px;">${file.name}</p>
        <input type="file" id="csvFile" accept=".csv" style="display: none;" onchange="handleFileUpload(event)">
    `;

    // Update sidebar stats
    document.getElementById('file-size').textContent = `${(file.size / 1024 / 1024).toFixed(1)}MB`;
    
    // Mark file as uploaded
    fileUploaded = true;
    
    // Hide layer selection and file upload after file upload
    hideLayerSelection();
    hideFileUploadSection();
    
    // Show sidebar immediately after file upload
    showSidebarAfterUpload();
    
    // Show processing pipeline immediately after file upload
    showProcessingPipelineAfterUpload();
    
    // Mark upload step as completed
    updateStepStatus('step-upload', 'completed');
    
    // Check if we should show processing pipeline
    checkAndShowProcessingPipeline();
}


// Drag and drop functionality
function setupDragDrop() {
    const uploadArea = document.getElementById('file-upload-area');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.name.toLowerCase().endsWith('.csv')) {
                document.getElementById('csvFile').files = files;
                handleFileUpload({ target: { files: [file] } });
            } else {
                alert('Please upload a CSV file.');
            }
        }
    });
}

// Hide layer selection after file upload
function hideLayerSelection() {
    const layerSelection = document.querySelector('.layer-selection');
    if (layerSelection) {
        layerSelection.style.display = 'none';
    }
}

// Hide file upload section after file upload
function hideFileUploadSection() {
    const fileUploadSection = document.querySelector('.file-upload-section');
    if (fileUploadSection) {
        fileUploadSection.style.display = 'none';
    }
}

// Show sidebar immediately after file upload
function showSidebarAfterUpload() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('show');
    }
}

// Show processing pipeline immediately after file upload
function showProcessingPipelineAfterUpload() {
    const pipelineSection = document.getElementById('processing-pipeline-section');
    if (pipelineSection) {
        pipelineSection.classList.add('show');
    }
}

// Check if we should show processing pipeline
function checkAndShowProcessingPipeline() {
    if (layerSelected && fileUploaded) {
        // Show sidebar first
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            sidebar.classList.add('show');
        }
        
        // Show processing pipeline based on current layer
        if (currentLayer === 1) {
            // Layer 1 (Fast Mode)
            const pipelineSection = document.getElementById('processing-pipeline-section');
            if (pipelineSection) {
                pipelineSection.classList.add('show');
            }
        } else if (currentLayer === 2) {
            // Layer 2
            const pipelineSectionLayer2 = document.getElementById('processing-pipeline-section-layer2');
            if (pipelineSectionLayer2) {
                pipelineSectionLayer2.classList.add('show');
            }
        }
    }
}

// Layer selection
function selectLayer(layer) {
    console.log('selectLayer called with layer:', layer);
    currentLayer = layer;
    layerSelected = true;
    
    // Update layer cards
    document.querySelectorAll('.layer-card').forEach((card, index) => {
        card.classList.toggle('active', index + 1 === layer);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach((section, index) => {
        section.classList.toggle('active', index + 1 === layer);
    });
    
    // Check if we should show processing pipeline
    checkAndShowProcessingPipeline();
}

// Update range slider values
function updateRangeValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueSpan = document.getElementById(valueId);
    
    let value = slider.value;
    
    // Format value based on the slider type
    if (sliderId.includes('overlap')) {
        value += '%';
    } else if (sliderId.includes('threshold') || sliderId.includes('temperature')) {
        value = parseFloat(value).toFixed(2);
    } else if (sliderId.includes('cache-size')) {
        value += 'MB';
    }
    
    valueSpan.textContent = value;
}

// Step status management
function updateStepStatus(stepId, status) {
    const step = document.getElementById(stepId);
    const statusElement = step.querySelector('.step-status');
    const timingElement = document.getElementById(`timing-${stepId.replace('step-', '')}`);
    
    // Remove all status classes
    step.classList.remove('active', 'completed', 'error');
    
    switch (status) {
        case 'active':
            step.classList.add('active');
            statusElement.textContent = '';
            startStepTimer(stepId);
            break;
        case 'completed':
            step.classList.add('completed');
            statusElement.textContent = '';
            stopStepTimer(stepId);
            break;
        case 'error':
            step.classList.add('error');
            statusElement.textContent = '';
            stopStepTimer(stepId, true);
            break;
        default:
            statusElement.textContent = '';
            timingElement.textContent = '';
    }
}

// Timer management functions
function startStepTimer(stepId) {
    const stepName = stepId.replace('step-', '');
    const timingElement = document.getElementById(`timing-${stepName}`);
    
    stepStartTimes[stepId] = Date.now();
    timingElement.textContent = 'Executing...';
    
    // Clear any existing timer
    if (stepTimers[stepId]) {
        clearInterval(stepTimers[stepId]);
    }
    
    // Start live timer
    stepTimers[stepId] = setInterval(() => {
        const elapsed = Math.floor((Date.now() - stepStartTimes[stepId]) / 1000);
        timingElement.textContent = `Executing... ${elapsed}s`;
    }, 1000);
}

function stopStepTimer(stepId, isError = false) {
    const stepName = stepId.replace('step-', '');
    const timingElement = document.getElementById(`timing-${stepName}`);
    
    if (stepTimers[stepId]) {
        clearInterval(stepTimers[stepId]);
        delete stepTimers[stepId];
    }
    
    if (stepStartTimes[stepId]) {
        const elapsed = Math.floor((Date.now() - stepStartTimes[stepId]) / 1000);
        timingElement.textContent = isError ? `Failed in ${elapsed}s` : `Completed in ${elapsed}s`;
        delete stepStartTimes[stepId];
    }
}

// Reset all step timers
function resetAllTimers() {
    Object.keys(stepTimers).forEach(stepId => {
        clearInterval(stepTimers[stepId]);
        delete stepTimers[stepId];
    });
    stepStartTimes = {};
    
    // Reset all timing displays
    const stepNames = ['upload', 'analyze', 'preprocess', 'chunking', 'embedding', 'storage', 'retrieval'];
    stepNames.forEach(stepName => {
        const timingElement = document.getElementById(`timing-${stepName}`);
        if (timingElement) {
            timingElement.textContent = '';
        }
    });
}

// Start processing
async function startProcessing() {
    if (!uploadedFile) {
        alert('Please upload a CSV file first!');
        return;
    }

    if (isProcessing) {
        alert('Processing is already in progress!');
        return;
    }

    isProcessing = true;
    processingStartTime = Date.now();
    
    // Reset all timers
    resetAllTimers();
    
    // Show processing indicator
    const processBtn = document.getElementById('process-btn');
    
    processBtn.disabled = true;
    processBtn.textContent = 'Processing...';

    // Hide search section if it exists
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
        searchSection.classList.remove('show');
    }

    try {
        await runProcessingPipeline();
    } catch (error) {
        console.error('Processing error:', error);
        alert('An error occurred during processing. Please check your configuration and try again.');
        
        // Mark current step as error
        const activeStep = document.querySelector('.process-step.active');
        if (activeStep) {
            updateStepStatus(activeStep.id, 'error');
        }
    } finally {
        isProcessing = false;
        processBtn.disabled = false;
        // Don't reset text here - let runProcessingPipeline handle it
    }
}

// Processing pipeline
async function runProcessingPipeline() {
    const steps = [
        { id: 'step-analyze', name: 'Data Analysis', duration: 1000 },
        { id: 'step-preprocess', name: 'Preprocessing', duration: 2000 },
        { id: 'step-chunking', name: 'Chunking', duration: 3000 },
        { id: 'step-embedding', name: 'Embeddings', duration: 4000 },
        { id: 'step-storage', name: 'Vector Storage', duration: 1500 },
        { id: 'step-retrieval', name: 'Retrieval Setup', duration: 1000 }
    ];

    let progress = 0;
    const progressBar = document.getElementById('overall-progress');
    const progressText = document.getElementById('progress-text');

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Update step status
        updateStepStatus(step.id, 'active');
        progressText.textContent = `Processing: ${step.name}`;

        // Simulate processing with variable duration based on layer complexity
        let duration = step.duration;
        if (currentLayer === 2) duration *= 1.3;
        if (currentLayer === 3) duration *= 1.6;

        await simulateProcessing(duration, (stepProgress) => {
            const totalProgress = ((i + stepProgress) / steps.length) * 100;
            progressBar.style.width = totalProgress + '%';
        });

        // Mark step as completed
        updateStepStatus(step.id, 'completed');
        progress = ((i + 1) / steps.length) * 100;
        progressBar.style.width = progress + '%';
    }

            // Processing completed
            progressText.textContent = 'Processing Complete!';
            await generateResults();
            
            // Change Start Processing button text to Processed
            const processBtn = document.getElementById('process-btn');
            if (processBtn) {
                processBtn.textContent = 'Processed';
                processBtn.disabled = true;
            }
            
            // Show search section after processing is complete
            setTimeout(() => {
                showQuerySection();
            }, 1000);
}

// Simulate processing step
function simulateProcessing(duration, onProgress) {
    return new Promise((resolve) => {
        let elapsed = 0;
        const interval = 50;
        
        const timer = setInterval(() => {
            elapsed += interval;
            const progress = Math.min(elapsed / duration, 1);
            onProgress(progress);
            
            if (progress >= 1) {
                clearInterval(timer);
                resolve();
            }
        }, interval);
    });
}

// Generate mock results based on configuration
async function generateResults() {
    const fileSize = uploadedFile.size;
    const processingTime = Date.now() - processingStartTime;
    
    // Generate realistic results based on layer and file size
    let baseChunks = Math.floor(fileSize / 1000) + Math.floor(Math.random() * 200) + 100;
    let efficiency = 85 + Math.floor(Math.random() * 10);
    let memoryUsage = Math.floor(fileSize / 1024 / 1024 * 2.5) + Math.floor(Math.random() * 100);
    
    // Adjust based on layer complexity
    switch (currentLayer) {
        case 1: // Fast mode
            efficiency += Math.floor(Math.random() * 5);
            break;
        case 2: // Config mode
            baseChunks = Math.floor(baseChunks * 1.2);
            efficiency += Math.floor(Math.random() * 8);
            memoryUsage = Math.floor(memoryUsage * 1.1);
            break;
        case 3: // Deep config
            baseChunks = Math.floor(baseChunks * 1.4);
            efficiency += Math.floor(Math.random() * 12);
            memoryUsage = Math.floor(memoryUsage * 1.3);
            break;
    }

    processedData = {
        chunks: baseChunks,
        embeddings: baseChunks,
        processingTime: Math.floor(processingTime / 1000),
        efficiency: Math.min(efficiency, 98),
        memoryUsage: memoryUsage,
        throughput: Math.floor(baseChunks / (processingTime / 1000)),
        semanticCoherence: 78 + Math.floor(Math.random() * 15),
        chunkDiversity: 65 + Math.floor(Math.random() * 20),
        cpuUsage: 45 + Math.floor(Math.random() * 30),
        gpuUsage: document.getElementById('gpu-acceleration')?.checked ? 60 + Math.floor(Math.random() * 25) : 0
    };

    // Update sidebar stats
    document.getElementById('total-chunks').textContent = processedData.chunks.toLocaleString();
    document.getElementById('processing-time').textContent = processedData.processingTime + 's';
    document.getElementById('memory-usage').textContent = processedData.memoryUsage + 'MB';
}

// Show query section after processing is complete
function showQuerySection() {
    const querySection = document.getElementById('query-section');
    if (querySection) {
        querySection.style.display = 'block';
        // Trigger popup animation
        setTimeout(() => {
            querySection.classList.add('popup-show');
        }, 100);
    }
}

// Perform query search
function performQuery() {
    const queryInput = document.getElementById('query-input');
    const queryResults = document.getElementById('query-results');
    const query = queryInput.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
            // Mock query results (3 chunks)
            const mockResults = [
                {
                    title: "Chunk 1",
                    content: `Customer data analysis showing purchasing patterns across different demographics and regions. This chunk contains detailed information about customer behavior, preferences, and buying trends that can help optimize marketing strategies and product development.`
                },
                {
                    title: "Chunk 2", 
                    content: `Product performance metrics including sales figures, customer satisfaction ratings, and return rates. This data provides insights into which products are performing well and which may need improvement or discontinuation.`
                },
                {
                    title: "Chunk 3",
                    content: `Market trend analysis covering seasonal variations, competitor analysis, and growth projections. This information helps businesses understand market dynamics and make informed strategic decisions.`
                }
            ];
    
    // Display query results
    queryResults.innerHTML = mockResults.map((result, index) => `
        <div class="query-result-item">
            <div class="query-result-title">${result.title}</div>
            <div class="query-result-content">${result.content}</div>
        </div>
    `).join('');
    
    // Ensure action buttons remain visible
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.style.display = 'flex';
        actionButtons.style.visibility = 'visible';
        actionButtons.style.opacity = '1';
        actionButtons.style.position = 'fixed';
        actionButtons.style.bottom = '40px';
        actionButtons.style.right = '40px';
        actionButtons.style.zIndex = '1000';
    }
        }

        // Reset processing function
        function resetProcessing() {
            // Reset all variables
            currentLayer = 1;
            isProcessing = false;
            uploadedFile = null;
            processedData = null;
            processingStartTime = null;
            stepTimers = {};
            stepStartTimes = {};
            fileUploaded = false;
            layerSelected = false; // Reset layer selection state
            
            // Reset UI
            const querySection = document.getElementById('query-section');
            if (querySection) {
                querySection.style.display = 'none';
                querySection.classList.remove('popup-show');
            }
            
            const queryInput = document.getElementById('query-input');
            if (queryInput) {
                queryInput.value = '';
            }
            
            const queryResults = document.getElementById('query-results');
            if (queryResults) {
                queryResults.innerHTML = '';
            }
            
            // Reset Layer 2 UI
            const querySectionLayer2 = document.getElementById('query-section-layer2');
            if (querySectionLayer2) {
                querySectionLayer2.style.display = 'none';
                querySectionLayer2.classList.remove('popup-show');
            }
            
            const queryInputLayer2 = document.getElementById('query-input-layer2');
            if (queryInputLayer2) {
                queryInputLayer2.value = '';
            }
            
            const queryResultsLayer2 = document.getElementById('query-results-layer2');
            if (queryResultsLayer2) {
                queryResultsLayer2.innerHTML = '';
            }
            
            // Reset Layer 2 processing pipeline
            const pipelineSectionLayer2 = document.getElementById('processing-pipeline-section-layer2');
            if (pipelineSectionLayer2) {
                pipelineSectionLayer2.classList.remove('show');
            }
            
            // Reset Layer 1 processing pipeline
            const pipelineSection = document.getElementById('processing-pipeline-section');
            if (pipelineSection) {
                pipelineSection.classList.remove('show');
            }
            
            // Reset sidebar
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.remove('show');
            }
            
            // Reset processing pipeline (already done above)
            
            // Show layer selection and file upload again
            const layerSelection = document.querySelector('.layer-selection');
            if (layerSelection) {
                layerSelection.style.display = 'flex';
            }
            
            const fileUploadSection = document.querySelector('.file-upload-section');
            if (fileUploadSection) {
                fileUploadSection.style.display = 'block';
            }
            
            // Reset file upload area
            const uploadArea = document.getElementById('file-upload-area');
            if (uploadArea) {
                uploadArea.classList.remove('uploaded');
                uploadArea.innerHTML = `
                    <div class="upload-icon">📁</div>
                    <h3>Upload CSV File</h3>
                    <p>Drag and drop your CSV file here or click to browse</p>
                    <input type="file" id="csvFile" accept=".csv" onchange="handleFileUpload(event)">
                `;
            }
            
            // Reset all step statuses
            const steps = ['step-upload', 'step-analyze', 'step-preprocess', 'step-chunking', 'step-embedding', 'step-storage', 'step-retrieval'];
            steps.forEach(stepId => {
                updateStepStatus(stepId, 'pending');
            });
            
            // Reset Start Processing button text
            const processBtn = document.getElementById('process-btn');
            if (processBtn) {
                processBtn.textContent = 'Start Processing';
                processBtn.disabled = false;
            }
            
            // Reset Layer 2 Start Processing button text
            const processBtnLayer2 = document.getElementById('process-btn-layer2');
            if (processBtnLayer2) {
                processBtnLayer2.textContent = 'Start Processing';
                processBtnLayer2.disabled = false;
            }
            
            // Reset Layer 2 processing indicator
            const processingIndicatorLayer2 = document.getElementById('processing-indicator-layer2');
            if (processingIndicatorLayer2) {
                processingIndicatorLayer2.classList.remove('processing');
                processingIndicatorLayer2.style.display = 'none';
            }
            
            // Reset layer selection visual state
            const layerCards = document.querySelectorAll('.layer-card');
            layerCards.forEach(card => {
                card.classList.remove('selected');
            });
            
            // Show main content (title, description, layers)
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.style.display = 'block';
            }
            
            // Reset all timers
            resetAllTimers();
            
            console.log('Application has been reset to starting page');
        }

        // Main reset function with confirmation dialog
        function resetEntireProcess() {
            if (confirm('Do you want to reset the entire process?\n\nThis will:\n• Clear all processing data\n• Remove uploaded files\n• Reset to the starting page\n• Clear all results\n\nClick OK to reset or Cancel to keep current progress.')) {
                resetProcessing();
                alert('Process has been reset successfully!\n\nYou are now back to the starting page with the three layers.');
            }
        }

        // Save config function
        function saveConfig() {
            alert('Configuration saved successfully!');
        }

// Handle Enter key in query input
document.addEventListener('DOMContentLoaded', function() {
    const queryInput = document.getElementById('query-input');
    if (queryInput) {
        queryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performQuery();
            }
        });
    }
});

// Show search section
function showSearchSection() {
    const searchSection = document.getElementById('search-section');
    if (searchSection) {
        searchSection.classList.add('show');
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const query = searchInput.value.trim();
    
    if (!query) {
        alert('Please enter a search query');
        return;
    }
    
    // Mock search results (5 chunks)
    const mockResults = [
        {
            title: "Chunk 1",
            content: `Customer data analysis showing purchasing patterns across different demographics and regions. This chunk contains detailed information about customer behavior, preferences, and buying trends that can help optimize marketing strategies and product development.`
        },
        {
            title: "Chunk 2", 
            content: `Product performance metrics including sales figures, customer satisfaction ratings, and return rates. This data provides insights into which products are performing well and which may need improvement or discontinuation.`
        },
        {
            title: "Chunk 3",
            content: `Market trend analysis covering seasonal variations, competitor analysis, and growth projections. This information helps businesses understand market dynamics and make informed strategic decisions.`
        },
        {
            title: "Chunk 4",
            content: `Financial performance data including revenue streams, cost analysis, and profitability metrics. This chunk contains crucial financial information for business planning and investment decisions.`
        },
        {
            title: "Chunk 5",
            content: `Operational efficiency metrics covering production processes, supply chain management, and resource utilization. This data helps identify areas for operational improvement and cost optimization.`
        }
    ];
    
    // Display search results
    searchResults.innerHTML = mockResults.map((result, index) => `
        <div class="search-result-item">
            <div class="search-result-title">${result.title}</div>
            <div class="search-result-content">${result.content}</div>
        </div>
    `).join('');
}

// Handle Enter key in search input
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// Show results
function showResults() {
    // Results panel removed - no longer needed
}

// Generate sample chunks for display
function generateSampleChunks() {
    const sampleChunks = [
        "Chunk 1: Customer data analysis showing purchasing patterns across different demographics and regions...",
        "Chunk 2: Product performance metrics including sales figures, customer satisfaction ratings, and return rates...",
        "Chunk 3: Market trend analysis covering seasonal variations, competitor analysis, and growth projections...",
        "Chunk 4: Financial performance indicators including revenue growth, profit margins, and cost analysis...",
        "Chunk 5: Operational efficiency metrics covering supply chain optimization and process improvements..."
    ];

    const sampleOutput = document.getElementById('sample-chunks');
    sampleOutput.innerHTML = sampleChunks.map((chunk, index) => 
        `<div style="margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #667eea;">
            <strong>Chunk ${index + 1}:</strong><br>
            <span style="color: var(--text-secondary);">${chunk}</span>
        </div>`
    ).join('');
}

// Configuration management
function saveConfiguration() {
    const config = gatherConfiguration();
    const configJson = JSON.stringify(config, null, 2);
    
    // Create download link
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv_chunking_config_layer_${currentLayer}.json`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Configuration saved successfully!');
}

function exportConfig() {
    saveConfiguration();
}

function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const config = JSON.parse(e.target.result);
                    loadConfiguration(config);
                    alert('Configuration loaded successfully!');
                } catch (error) {
                    alert('Invalid configuration file!');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function resetConfiguration() {
    if (confirm('Are you sure you want to reset all configuration settings and go back to the first page?')) {
        // Call the main reset function to go back to first page
        resetEntireProcess();
        
        // Reset all form elements to defaults
        document.querySelectorAll('select, input[type="number"], input[type="range"]').forEach(element => {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else if (element.type === 'number') {
                element.value = element.getAttribute('value') || element.min || 0;
            } else if (element.type === 'range') {
                element.value = element.getAttribute('value') || element.min || 0;
                const valueId = element.id.replace('-range', '-value').replace('range', 'value');
                const valueElement = document.getElementById(valueId);
                if (valueElement) {
                    updateRangeValue(element.id, valueId);
                }
            }
        });

        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = checkbox.hasAttribute('checked');
        });

        alert('Configuration reset to defaults!');
    }
}

function gatherConfiguration() {
    const config = {
        layer: currentLayer,
        timestamp: new Date().toISOString(),
        preprocessing: {},
        chunking: {},
        embedding: {},
        storage: {},
        retrieval: {},
        performance: {}
    };

    // Gather all form values
    document.querySelectorAll('select, input').forEach(element => {
        if (element.type === 'file') return;
        
        const section = element.id.split('-')[0];
        const key = element.id;
        
        if (element.type === 'checkbox') {
            config[section] = config[section] || {};
            config[section][key] = element.checked;
        } else {
            config[section] = config[section] || {};
            config[section][key] = element.value;
        }
    });

    return config;
}

function loadConfiguration(config) {
    // Load configuration values
    Object.keys(config).forEach(section => {
        if (typeof config[section] === 'object' && config[section] !== null) {
            Object.keys(config[section]).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = config[section][key];
                    } else {
                        element.value = config[section][key];
                        
                        // Update range displays
                        if (element.type === 'range') {
                            const valueId = key + '-value';
                            updateRangeValue(key, valueId);
                        }
                    }
                }
            });
        }
    });

    // Switch to the correct layer
    if (config.layer) {
        selectLayer(config.layer);
    }
}

function exportResults() {
    if (!processedData) {
        alert('No results to export. Please run processing first.');
        return;
    }

    const results = {
        ...processedData,
        timestamp: new Date().toISOString(),
        configuration: gatherConfiguration(),
        fileName: uploadedFile?.name
    };

    const resultsJson = JSON.stringify(results, null, 2);
    const blob = new Blob([resultsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `csv_chunking_results_${new Date().toISOString().slice(0, 19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

function startRetrieval() {
    if (!processedData) {
        alert('Please complete processing first before testing retrieval.');
        return;
    }
    
    const query = prompt('Enter a test query for retrieval:');
    if (query) {
        alert(`Testing retrieval with query: "${query}"\n\nThis would return the top ${document.getElementById('top-k-results')?.value || 10} most relevant chunks using ${document.getElementById('similarity-metric')?.value || 'cosine'} similarity.`);
    }
}

// Layer 2 Processing and Query Functions
function startProcessingLayer2() {
    console.log('startProcessingLayer2 called');
    if (isProcessing) return;
    
    isProcessing = true;
    const processBtn = document.getElementById('process-btn-layer2');
    const processingIndicator = document.getElementById('processing-indicator-layer2');
    
    console.log('Process button found:', processBtn ? 'Yes' : 'No');
    console.log('Processing indicator found:', processingIndicator ? 'Yes' : 'No');
    
    // Check if Layer 2 processing pipeline is visible
    const pipelineSection = document.getElementById('processing-pipeline-section-layer2');
    console.log('Layer 2 pipeline section found:', pipelineSection ? 'Yes' : 'No');
    console.log('Layer 2 pipeline section visible:', pipelineSection && pipelineSection.classList.contains('show') ? 'Yes' : 'No');
    
    // Check if we're in Layer 2
    console.log('Current layer:', currentLayer);
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 processing pipeline is in the DOM
    console.log('Layer 2 processing pipeline in DOM:', document.querySelector('#processing-pipeline-section-layer2') ? 'Yes' : 'No');
    
    // Check if Layer 2 query section is in the DOM
    console.log('Layer 2 query section in DOM:', document.querySelector('#query-section-layer2') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is in the DOM
    console.log('Layer 2 content section in DOM:', document.querySelector('#content-layer-2') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is active
    console.log('Layer 2 content section active:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is visible
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is visible
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is visible
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is visible
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Check if Layer 2 content section is visible
    console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
    
    // Reset all timers
    resetAllTimers();
    
    // Hide query section
    const querySection = document.getElementById('query-section-layer2');
    if (querySection) {
        querySection.style.display = 'none';
    }
    
    // Update button state
    processBtn.textContent = 'Processing...';
    processBtn.disabled = true;
    
    // Show processing indicator
    processingIndicator.classList.add('processing');
    processingIndicator.style.display = 'flex';
    
    // Simulate processing steps
    runProcessingPipelineLayer2();
}

function runProcessingPipelineLayer2() {
    const steps = [
        { id: 'step-upload', name: 'File Upload', duration: 1000 },
        { id: 'step-analyze', name: 'Data Analysis', duration: 2000 },
        { id: 'step-preprocess', name: 'Preprocessing', duration: 3000 },
        { id: 'step-chunking', name: 'Chunking', duration: 2500 },
        { id: 'step-embedding', name: 'Embedding', duration: 4000 },
        { id: 'step-storage', name: 'Vector Storage', duration: 2000 },
        { id: 'step-retrieval', name: 'Retrieval Setup', duration: 1500 }
    ];
    
    let currentStep = 0;
    
    function processNextStep() {
        if (currentStep >= steps.length) {
            // All steps completed
            const processBtn = document.getElementById('process-btn-layer2');
            const processingIndicator = document.getElementById('processing-indicator-layer2');
            
            processBtn.textContent = 'Processed';
            processBtn.disabled = true;
            processingIndicator.classList.remove('processing');
            processingIndicator.style.display = 'none';
            
            // Show query section after processing
            console.log('Processing completed, showing query section in 500ms...');
            console.log('Current layer:', currentLayer);
            console.log('isProcessing:', isProcessing);
            console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            console.log('Layer 2 processing pipeline visible:', document.getElementById('processing-pipeline-section-layer2') && document.getElementById('processing-pipeline-section-layer2').classList.contains('show') ? 'Yes' : 'No');
            console.log('Layer 2 query section in DOM:', document.querySelector('#query-section-layer2') ? 'Yes' : 'No');
            console.log('Layer 2 content section in DOM:', document.querySelector('#content-layer-2') ? 'Yes' : 'No');
            console.log('Layer 2 content section active:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            console.log('Layer 2 content section visible:', document.getElementById('content-layer-2') && document.getElementById('content-layer-2').classList.contains('active') ? 'Yes' : 'No');
            setTimeout(() => {
                console.log('About to show query section...');
                showQuerySectionLayer2();
            }, 500);
            
            isProcessing = false;
            return;
        }
        
        const step = steps[currentStep];
        updateStepStatus(step.id, 'active');
        
        setTimeout(() => {
            updateStepStatus(step.id, 'completed');
            currentStep++;
            processNextStep();
        }, step.duration);
    }
    
    processNextStep();
}

function showQuerySectionLayer2() {
    console.log('showQuerySectionLayer2 called');
    const querySection = document.getElementById('query-section-layer2');
    if (querySection) {
        console.log('Query section found, showing...');
        console.log('Query section current display:', querySection.style.display);
        console.log('Query section current classes:', querySection.className);
        console.log('Query section parent element:', querySection.parentElement);
        console.log('Query section parent classes:', querySection.parentElement ? querySection.parentElement.className : 'No parent');
        console.log('Query section parent display:', querySection.parentElement ? window.getComputedStyle(querySection.parentElement).display : 'No parent');
        console.log('Query section parent visible:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        console.log('Query section parent active:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        console.log('Query section parent visible:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        console.log('Query section parent visible:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        console.log('Query section parent visible:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        console.log('Query section parent visible:', querySection.parentElement && querySection.parentElement.classList.contains('active') ? 'Yes' : 'No');
        querySection.style.display = 'block';
        console.log('Query section display set to block');
        // Trigger popup animation
        setTimeout(() => {
            querySection.classList.add('popup-show');
            console.log('Popup animation triggered');
            console.log('Query section classes after popup:', querySection.className);
            console.log('Query section computed style display:', window.getComputedStyle(querySection).display);
        }, 100);
    } else {
        console.log('Query section not found!');
    }
}

function performQueryLayer2() {
    const queryInput = document.getElementById('query-input-layer2');
    const queryResults = document.getElementById('query-results-layer2');
    
    if (!queryInput || !queryResults) return;
    
    const query = queryInput.value.trim();
    if (!query) {
        alert('Please enter a query');
        return;
    }
    
    // Generate mock results for Layer 2
    const mockResults = [
        {
            title: "Chunk 1: Data Processing Results",
            content: "This chunk contains processed data from the CSV file with applied preprocessing techniques including null handling and data type conversion as configured in Layer 2."
        },
        {
            title: "Chunk 2: Chunking Analysis",
            content: "Semantic chunking results showing how the data was split into meaningful segments using the configured chunking method and overlap percentage."
        },
        {
            title: "Chunk 3: Vector Embeddings",
            content: "Generated embeddings using the selected model with specified dimensions, ready for similarity search and retrieval operations."
        }
    ];
    
    // Display results
    queryResults.innerHTML = mockResults.map((result, index) => `
        <div class="query-result-item">
            <div class="query-result-title">${result.title}</div>
            <div class="query-result-content">${result.content}</div>
        </div>
    `).join('');
    
    // Ensure action buttons remain visible
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.style.display = 'flex';
        actionButtons.style.position = 'fixed';
        actionButtons.style.bottom = '40px';
        actionButtons.style.right = '40px';
        actionButtons.style.zIndex = '1000';
    }
}

// Initialize the application
function initializeApp() {
    console.log('initializeApp called');
    console.log('Layer cards found:', document.querySelectorAll('.layer-card').length);
    console.log('File upload area found:', document.getElementById('file-upload-area') ? 'Yes' : 'No');
    setupDragDrop();
    
    // Set default range values
    document.querySelectorAll('input[type="range"]').forEach(slider => {
        const valueId = slider.id.replace('-range', '-value').replace(/.*/, match => match + '-value');
        const valueElement = document.getElementById(valueId) || document.getElementById(slider.id + '-value');
        if (valueElement) {
            updateRangeValue(slider.id, valueElement.id);
        }
    });

    console.log('CSV Chunking Optimizer initialized successfully!');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeApp);

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 's':
                e.preventDefault();
                saveConfiguration();
                break;
            case 'o':
                e.preventDefault();
                importConfig();
                break;
            case 'r':
                if (e.shiftKey) {
                    e.preventDefault();
                    resetConfiguration();
                }
                break;
            case 'Enter':
                if (!isProcessing && uploadedFile) {
                    e.preventDefault();
                    startProcessing();
                }
                break;
        }
    }
});
