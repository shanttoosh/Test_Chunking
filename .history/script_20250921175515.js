// Global Variables
let currentLayer = 0;
let layerSelected = false;
let isProcessing = false;
let processingSteps = [];
let currentStep = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('CSV Chunking Optimizer initialized');
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize processing steps
    initializeProcessingSteps();
    
    // Load saved configuration if available
    loadSavedConfig();
    
    console.log('Application initialized successfully');
}

// Set up event listeners
function setupEventListeners() {
    // File input change event
    const fileInput = document.getElementById('csvFile');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
    
    // Drag and drop events
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Window resize event
    window.addEventListener('resize', handleWindowResize);
    
    // Before unload event
    window.addEventListener('beforeunload', handleBeforeUnload);
}

// Initialize processing steps
function initializeProcessingSteps() {
    processingSteps = [
        { id: 'step-upload', name: 'File Upload', completed: false },
        { id: 'step-analysis', name: 'Data Analysis', completed: false },
        { id: 'step-preprocessing', name: 'Preprocessing', completed: false },
        { id: 'step-chunking', name: 'Chunking', completed: false },
        { id: 'step-embedding', name: 'Embedding', completed: false },
        { id: 'step-storing', name: 'Storing', completed: false },
        { id: 'step-retrieval', name: 'Retrieval', completed: false }
    ];
    
    updateProcessingSteps();
}

// Update processing steps visual state
function updateProcessingSteps() {
    processingSteps.forEach((step, index) => {
        const stepElement = document.getElementById(step.id);
        if (stepElement) {
            stepElement.classList.remove('active', 'completed');
            
            if (index < currentStep) {
                stepElement.classList.add('completed');
            } else if (index === currentStep) {
                stepElement.classList.add('active');
            }
        }
    });
}

// Load saved configuration
function loadSavedConfig() {
    try {
        const savedConfig = localStorage.getItem('csvChunkingConfig');
        if (savedConfig) {
            const config = JSON.parse(savedConfig);
            console.log('Loaded saved configuration:', config);
            
            // Apply saved configuration
            applyConfiguration(config);
        }
    } catch (error) {
        console.error('Error loading saved configuration:', error);
    }
}

// Apply configuration to form elements
function applyConfiguration(config) {
    if (config.preprocessing) {
        const nullHandling = document.getElementById('null-handling');
        const dataType = document.getElementById('dtype-conversion');
        
        if (nullHandling && config.preprocessing.nullHandling) {
            nullHandling.value = config.preprocessing.nullHandling;
        }
        
        if (dataType && config.preprocessing.dataType) {
            dataType.value = config.preprocessing.dataType;
        }
    }
    
    if (config.chunking) {
        const method = document.getElementById('chunking-method');
        const size = document.getElementById('chunk-size');
        const overlap = document.getElementById('overlap-range');
        
        if (method && config.chunking.method) {
            method.value = config.chunking.method;
        }
        
        if (size && config.chunking.size) {
            size.value = config.chunking.size;
        }
        
        if (overlap && config.chunking.overlap) {
            overlap.value = config.chunking.overlap;
            updateRangeValue('overlap-range', 'overlap-value');
        }
    }
    
    if (config.embedding) {
        const model = document.getElementById('embedding-model');
        const dimensions = document.getElementById('embedding-dims');
        
        if (model && config.embedding.model) {
            model.value = config.embedding.model;
        }
        
        if (dimensions && config.embedding.dimensions) {
            dimensions.value = config.embedding.dimensions;
        }
    }
    
    if (config.storage) {
        const backend = document.getElementById('storage-backend');
        const indexType = document.getElementById('index-type');
        const compression = document.getElementById('enable-compression');
        
        if (backend && config.storage.backend) {
            backend.value = config.storage.backend;
        }
        
        if (indexType && config.storage.indexType) {
            indexType.value = config.storage.indexType;
        }
        
        if (compression && config.storage.compression !== undefined) {
            compression.checked = config.storage.compression;
        }
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S to save config
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveConfig();
    }
    
    // Ctrl/Cmd + R to reset
    if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        resetProcessing();
    }
    
    // Escape to close modals or go back
    if (event.key === 'Escape') {
        // Add escape functionality here
    }
}

// Handle window resize
function handleWindowResize() {
    // Adjust layout for mobile/desktop
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // Mobile-specific adjustments
        document.body.classList.add('mobile');
    } else {
        document.body.classList.remove('mobile');
    }
}

// Handle before unload
function handleBeforeUnload(event) {
    if (isProcessing) {
        event.preventDefault();
        event.returnValue = 'Processing is in progress. Are you sure you want to leave?';
        return event.returnValue;
    }
}

// Layer Selection
function selectLayer(layer) {
    currentLayer = layer;
    layerSelected = true;
    
    // Hide layer selection
    const layerSelection = document.getElementById('layer-selection');
    if (layerSelection) {
        layerSelection.style.display = 'none';
    }
    
    // Show file upload section
    const fileUploadSection = document.getElementById('file-upload-section');
    if (fileUploadSection) {
        fileUploadSection.style.display = 'block';
    }
    
    // Show sidebar
    showSidebarAfterUpload();
    
    // Update layer cards
    document.querySelectorAll('.layer-card').forEach((card, index) => {
        card.classList.toggle('active', index + 1 === layer);
    });

    // Update content sections
    document.querySelectorAll('.content-section').forEach((section, index) => {
        section.classList.toggle('active', index + 1 === layer);
    });
    
    console.log(`Layer ${layer} selected`);
}

// Show sidebar after upload
function showSidebarAfterUpload() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('show');
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.add('sidebar-open');
    }
}

// File Upload Handler
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    console.log('File uploaded:', file.name);
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showError('Please select a CSV file.');
        return;
    }
    
    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
        showError('File size too large. Maximum size is 100MB.');
        return;
    }
    
    // Hide file upload section
    const fileUploadSection = document.getElementById('file-upload-section');
    if (fileUploadSection) {
        fileUploadSection.style.display = 'none';
    }
    
    // Show processing pipeline based on current layer
    showProcessingPipelineAfterUpload();
    
    // Update file size in sidebar
    updateFileSize(file.size);
    
    // Mark upload step as completed
    currentStep = 1;
    updateProcessingSteps();
    
    // Show success message
    showSuccess('File uploaded successfully!');
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// Handle drag leave
function handleDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const fileInput = document.getElementById('csvFile');
        if (fileInput) {
            fileInput.files = files;
            handleFileUpload({ target: { files: files } });
        }
    }
}

// Show processing pipeline after upload
function showProcessingPipelineAfterUpload() {
    console.log('showProcessingPipelineAfterUpload called, currentLayer:', currentLayer);

    if (currentLayer === 1) {
        const pipelineSection = document.getElementById('processing-pipeline-section');
        if (pipelineSection) {
            pipelineSection.classList.add('show');
            console.log('Layer 1 pipeline shown after upload');
        }
    } else if (currentLayer === 2) {
        const pipelineSectionLayer2 = document.getElementById('processing-pipeline-section-layer2');
        if (pipelineSectionLayer2) {
            pipelineSectionLayer2.classList.add('show');
            console.log('Layer 2 pipeline shown after upload');
        }
    }
}

// Update file size in sidebar
function updateFileSize(size) {
    const fileSizeElement = document.getElementById('file-size');
    if (fileSizeElement) {
        const sizeInMB = (size / (1024 * 1024)).toFixed(1);
        fileSizeElement.textContent = `${sizeInMB}MB`;
    }
}

// Update range slider values
function updateRangeValue(sliderId, valueId) {
    const slider = document.getElementById(sliderId);
    const valueDisplay = document.getElementById(valueId);
    
    if (slider && valueDisplay) {
        valueDisplay.textContent = slider.value + '%';
    }
}

// Start Processing Layer 1
function startProcessingLayer1() {
    if (isProcessing) return;
    
    isProcessing = true;
    const processingIndicator = document.getElementById('processing-indicator');
    if (processingIndicator) {
        processingIndicator.classList.add('processing');
    }
    
    // Start processing steps
    startProcessingSteps();
    
    console.log('Layer 1 processing started');
}

// Start Processing Layer 2
function startProcessingLayer2() {
    if (isProcessing) return;
    
    isProcessing = true;
    const processingIndicator = document.getElementById('processing-indicator-layer2');
    if (processingIndicator) {
        processingIndicator.classList.add('processing');
    }
    
    // Start processing steps
    startProcessingSteps();
    
    console.log('Layer 2 processing started');
}

// Start processing steps
function startProcessingSteps() {
    currentStep = 0;
    updateProcessingSteps();
    
    // Simulate processing steps
    const stepInterval = setInterval(() => {
        if (currentStep < processingSteps.length) {
            processingSteps[currentStep].completed = true;
            updateProcessingSteps();
            currentStep++;
            
            // Update stats
            updateProcessingStats();
        } else {
            clearInterval(stepInterval);
            completeProcessing();
        }
    }, 1000);
}

// Complete processing
function completeProcessing() {
    isProcessing = false;
    
    // Hide processing indicators
    document.querySelectorAll('.processing-indicator').forEach(indicator => {
        indicator.classList.remove('processing');
    });
    
    // Show query section based on current layer
    setTimeout(() => {
        if (currentLayer === 1) {
            showQuerySection();
        } else if (currentLayer === 2) {
            showQuerySectionLayer2();
        }
    }, 500);
    
    console.log('Processing completed');
}

// Update processing stats
function updateProcessingStats() {
    const totalChunks = document.getElementById('total-chunks');
    const processTime = document.getElementById('process-time');
    const memoryUsage = document.getElementById('memory-usage');
    
    if (totalChunks) {
        totalChunks.textContent = Math.floor(Math.random() * 1000) + 100;
    }
    
    if (processTime) {
        processTime.textContent = currentStep + 's';
    }
    
    if (memoryUsage) {
        memoryUsage.textContent = (Math.random() * 50 + 10).toFixed(1) + 'MB';
    }
}

// Show Query Section Layer 1
function showQuerySection() {
    const querySection = document.getElementById('query-section');
    if (querySection) {
        querySection.style.display = 'block';
        querySection.classList.add('popup-show');
        console.log('Layer 1 query section shown');
    }
}

// Show Query Section Layer 2
function showQuerySectionLayer2() {
    const querySection = document.getElementById('query-section-layer2');
    if (querySection) {
        querySection.style.display = 'block';
        querySection.classList.add('popup-show');
        console.log('Layer 2 query section shown');
    }
}

// Perform Query Layer 1
function performQuery() {
    const queryInput = document.getElementById('query-input');
    const queryResults = document.getElementById('query-results');
    
    if (!queryInput || !queryResults) return;
    
    const query = queryInput.value.trim();
    if (!query) return;
    
    console.log('Layer 1 query performed:', query);
    
    // Show loading state
    queryResults.innerHTML = '<div class="loading">Searching...</div>';
    
    // Simulate API call
    setTimeout(() => {
        // Mock results
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
        
        // Display results
        queryResults.innerHTML = '';
        mockResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-title">${result.title}</div>
                <div class="result-content">${result.content}</div>
            `;
            queryResults.appendChild(resultItem);
        });
        
        queryResults.classList.add('show');
    }, 1000);
}

// Perform Query Layer 2
function performQueryLayer2() {
    const queryInput = document.getElementById('query-input-layer2');
    const queryResults = document.getElementById('query-results-layer2');
    
    if (!queryInput || !queryResults) return;
    
    const query = queryInput.value.trim();
    if (!query) return;
    
    console.log('Layer 2 query performed:', query);
    
    // Show loading state
    queryResults.innerHTML = '<div class="loading">Searching...</div>';
    
    // Simulate API call
    setTimeout(() => {
        // Mock results
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
        
        // Display results
        queryResults.innerHTML = '';
        mockResults.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            resultItem.innerHTML = `
                <div class="result-title">${result.title}</div>
                <div class="result-content">${result.content}</div>
            `;
            queryResults.appendChild(resultItem);
        });
        
        queryResults.classList.add('show');
    }, 1000);
}

// Reset Processing
function resetProcessing() {
    console.log('Reset processing called');
    
    // Reset variables
    currentLayer = 0;
    layerSelected = false;
    isProcessing = false;
    currentStep = 0;
    
    // Reset processing steps
    processingSteps.forEach(step => {
        step.completed = false;
    });
    updateProcessingSteps();
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Hide processing pipelines
    document.querySelectorAll('.processing-pipeline-section').forEach(section => {
        section.classList.remove('show');
    });
    
    // Hide query sections
    document.querySelectorAll('.query-section').forEach(section => {
        section.style.display = 'none';
        section.classList.remove('popup-show');
    });
    
    // Hide processing indicators
    document.querySelectorAll('.processing-indicator').forEach(indicator => {
        indicator.classList.remove('processing');
    });
    
    // Clear query inputs
    document.querySelectorAll('.query-input').forEach(input => {
        input.value = '';
    });
    
    // Clear query results
    document.querySelectorAll('.query-results').forEach(results => {
        results.innerHTML = '';
        results.classList.remove('show');
    });
    
    // Show layer selection
    const layerSelection = document.getElementById('layer-selection');
    if (layerSelection) {
        layerSelection.style.display = 'block';
    }
    
    // Hide file upload section
    const fileUploadSection = document.getElementById('file-upload-section');
    if (fileUploadSection) {
        fileUploadSection.style.display = 'none';
    }
    
    // Hide sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.remove('show');
    }
    
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.classList.remove('sidebar-open');
    }
    
    // Reset layer cards
    document.querySelectorAll('.layer-card').forEach(card => {
        card.classList.remove('active');
    });
    
    // Reset file input
    const fileInput = document.getElementById('csvFile');
    if (fileInput) {
        fileInput.value = '';
    }
    
    // Reset stats
    document.getElementById('total-chunks').textContent = '0';
    document.getElementById('process-time').textContent = '0s';
    document.getElementById('file-size').textContent = '0.4MB';
    document.getElementById('memory-usage').textContent = '0MB';
    
    console.log('Application reset successfully');
}

// Save Config
function saveConfig() {
    console.log('Save config called for layer:', currentLayer);
    
    // Collect configuration data based on current layer
    let config = {
        layer: currentLayer,
        timestamp: new Date().toISOString()
    };
    
    if (currentLayer === 2) {
        config.preprocessing = {
            nullHandling: document.getElementById('null-handling')?.value,
            dataType: document.getElementById('dtype-conversion')?.value
        };
        config.chunking = {
            method: document.getElementById('chunking-method')?.value,
            size: document.getElementById('chunk-size')?.value,
            overlap: document.getElementById('overlap-range')?.value
        };
        config.embedding = {
            model: document.getElementById('embedding-model')?.value,
            dimensions: document.getElementById('embedding-dims')?.value
        };
        config.storage = {
            backend: document.getElementById('storage-backend')?.value,
            indexType: document.getElementById('index-type')?.value,
            compression: document.getElementById('enable-compression')?.checked
        };
    }
    
    // Save to localStorage (in real app, this would be sent to server)
    try {
        localStorage.setItem('csvChunkingConfig', JSON.stringify(config));
        console.log('Config saved:', config);
        showSuccess('Configuration saved successfully!');
    } catch (error) {
        console.error('Error saving configuration:', error);
        showError('Failed to save configuration. Please try again.');
    }
}

// Utility Functions
function showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.className = 'success';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#22c55e';
    notification.style.background = 'rgba(34, 197, 94, 0.1)';
    notification.style.border = '1px solid rgba(34, 197, 94, 0.3)';
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

function showError(message) {
    // Create error notification
    const notification = document.createElement('div');
    notification.className = 'error';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#ef4444';
    notification.style.background = 'rgba(239, 68, 68, 0.1)';
    notification.style.border = '1px solid rgba(239, 68, 68, 0.3)';
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function showWarning(message) {
    // Create warning notification
    const notification = document.createElement('div');
    notification.className = 'warning';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#f59e0b';
    notification.style.background = 'rgba(245, 158, 11, 0.1)';
    notification.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

function showInfo(message) {
    // Create info notification
    const notification = document.createElement('div');
    notification.className = 'info';
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.style.padding = '15px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = '#3b82f6';
    notification.style.background = 'rgba(59, 130, 246, 0.1)';
    notification.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 4000);
}

// Export functions for global access
window.selectLayer = selectLayer;
window.handleFileUpload = handleFileUpload;
window.startProcessingLayer1 = startProcessingLayer1;
window.startProcessingLayer2 = startProcessingLayer2;
window.performQuery = performQuery;
window.performQueryLayer2 = performQueryLayer2;
window.resetProcessing = resetProcessing;
window.saveConfig = saveConfig;
window.updateRangeValue = updateRangeValue;