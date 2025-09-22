// Global variables
let currentLayer = 1;
let isProcessing = false;
let uploadedFile = null;
let processedData = null;
let processingStartTime = null;
let stepTimers = {};
let stepStartTimes = {};

// File upload handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
        alert('Please upload a CSV file.');
        return;
    }

    uploadedFile = file;
    const uploadArea = document.getElementById('file-upload-area');
    const fileInfo = document.getElementById('file-info');
    const fileDetails = document.getElementById('file-details');

    // Update upload area
    uploadArea.classList.add('uploaded');
    uploadArea.innerHTML = `
        <div class="upload-icon">✅</div>
        <h3 class="upload-title">File Uploaded Successfully!</h3>
        <p class="upload-subtitle">${file.name}</p>
        <div class="upload-info">
            <span>📊 ${file.size} bytes</span>
            <span>📅 ${new Date(file.lastModified).toLocaleDateString()}</span>
            <span>✅ Ready to process</span>
        </div>
    `;

    // Show file details
    analyzeFile(file).then(analysis => {
        fileDetails.innerHTML = `
            <div class="file-detail">
                <div class="file-detail-value">${analysis.rows.toLocaleString()}</div>
                <div class="file-detail-label">Estimated Rows</div>
            </div>
            <div class="file-detail">
                <div class="file-detail-value">${analysis.columns}</div>
                <div class="file-detail-label">Columns</div>
            </div>
            <div class="file-detail">
                <div class="file-detail-value">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
                <div class="file-detail-label">File Size</div>
            </div>
            <div class="file-detail">
                <div class="file-detail-value">${analysis.encoding}</div>
                <div class="file-detail-label">Encoding</div>
            </div>
        `;
        fileInfo.classList.add('show');

        // Update sidebar stats
        document.getElementById('file-size').textContent = `${(file.size / 1024 / 1024).toFixed(1)}MB`;
        
        // Mark upload step as completed
        updateStepStatus('step-upload', 'completed');
    });
}

// Analyze CSV file
async function analyzeFile(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const lines = text.split('\n');
            const firstLine = lines[0];
            const columns = firstLine.split(',').length;
            
            resolve({
                rows: lines.length - 1, // Subtract header
                columns: columns,
                encoding: 'UTF-8',
                delimiter: ',',
                hasHeader: true
            });
        };
        reader.readAsText(file.slice(0, 10000)); // Read first 10KB for analysis
    });
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

// Layer selection
function selectLayer(layer) {
    currentLayer = layer;
    
    // Update layer cards
    document.querySelectorAll('.layer-card').forEach((card, index) => {
        card.classList.toggle('active', index + 1 === layer);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach((section, index) => {
        section.classList.toggle('active', index + 1 === layer);
    });
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
            timingElement.textContent = 'Ready';
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
            timingElement.textContent = 'Ready';
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
    const indicator = document.getElementById('processing-indicator');
    const processBtn = document.getElementById('process-btn');
    
    indicator.classList.add('show');
    processBtn.disabled = true;
    processBtn.textContent = '⏳ Processing...';

    // Hide results panel
    document.getElementById('results-panel').classList.remove('show');

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
        indicator.classList.remove('show');
        processBtn.disabled = false;
        processBtn.textContent = '🚀 Start Processing';
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
    showResults();
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
    let accuracy = 85 + Math.floor(Math.random() * 10);
    let memoryUsage = Math.floor(fileSize / 1024 / 1024 * 2.5) + Math.floor(Math.random() * 100);
    
    // Adjust based on layer complexity
    switch (currentLayer) {
        case 1: // Fast mode
            accuracy += Math.floor(Math.random() * 5);
            break;
        case 2: // Config mode
            baseChunks = Math.floor(baseChunks * 1.2);
            accuracy += Math.floor(Math.random() * 8);
            memoryUsage = Math.floor(memoryUsage * 1.1);
            break;
        case 3: // Deep config
            baseChunks = Math.floor(baseChunks * 1.4);
            accuracy += Math.floor(Math.random() * 12);
            memoryUsage = Math.floor(memoryUsage * 1.3);
            break;
    }

    processedData = {
        chunks: baseChunks,
        embeddings: baseChunks,
        processingTime: Math.floor(processingTime / 1000),
        accuracy: Math.min(accuracy, 98),
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
    document.getElementById('efficiency-score').textContent = processedData.efficiency + '%';
}

// Show results
function showResults() {
    const resultsPanel = document.getElementById('results-panel');
    
    // Update result values
    document.getElementById('result-chunks').textContent = processedData.chunks.toLocaleString();
    document.getElementById('result-embeddings').textContent = processedData.embeddings.toLocaleString();
    document.getElementById('result-time').textContent = processedData.processingTime + 's';
    document.getElementById('result-accuracy').textContent = processedData.accuracy + '%';
    document.getElementById('result-memory').textContent = processedData.memoryUsage + 'MB';
    document.getElementById('result-throughput').textContent = processedData.throughput + '/s';

    // Update detailed metrics
    document.getElementById('semantic-coherence').textContent = processedData.semanticCoherence + '%';
    document.getElementById('chunk-diversity').textContent = processedData.chunkDiversity + '%';
    document.getElementById('cpu-usage').textContent = processedData.cpuUsage + '%';
    document.getElementById('gpu-usage').textContent = processedData.gpuUsage + '%';

    // Generate sample chunks
    generateSampleChunks();

    // Show results panel with animation
    resultsPanel.classList.add('show');
    resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    if (confirm('Are you sure you want to reset all configuration settings?')) {
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

// Initialize the application
function initializeApp() {
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
