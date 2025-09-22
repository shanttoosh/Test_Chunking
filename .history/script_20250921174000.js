// Global Variables
let currentLayer = 0;
let layerSelected = false;
let isProcessing = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('CSV Chunking Optimizer initialized');
});

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
    
    // Hide file upload section
    const fileUploadSection = document.getElementById('file-upload-section');
    if (fileUploadSection) {
        fileUploadSection.style.display = 'none';
    }
    
    // Show processing pipeline based on current layer
    showProcessingPipelineAfterUpload();
    
    // Update file size in sidebar
    updateFileSize(file.size);
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
    } else if (currentLayer === 3) {
        const pipelineSectionLayer3 = document.getElementById('processing-pipeline-section-layer3');
        if (pipelineSectionLayer3) {
            pipelineSectionLayer3.classList.add('show');
            console.log('Layer 3 pipeline shown after upload');
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

// Start Processing Layer 1
function startProcessingLayer1() {
    if (isProcessing) return;
    
    isProcessing = true;
    const processingIndicator = document.getElementById('processing-indicator');
    if (processingIndicator) {
        processingIndicator.classList.add('processing');
    }
    
    // Simulate processing
    setTimeout(() => {
        if (processingIndicator) {
            processingIndicator.classList.remove('processing');
        }
        
        // Show query section
        setTimeout(() => {
            showQuerySection();
        }, 500);
        
        isProcessing = false;
    }, 3000);
    
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
    
    // Simulate processing
    setTimeout(() => {
        if (processingIndicator) {
            processingIndicator.classList.remove('processing');
        }
        
        // Show query section
        setTimeout(() => {
            showQuerySectionLayer2();
        }, 500);
        
        isProcessing = false;
    }, 3000);
    
    console.log('Layer 2 processing started');
}

// Start Processing Layer 3
function startProcessingLayer3() {
    if (isProcessing) return;
    
    isProcessing = true;
    const processingIndicator = document.getElementById('processing-indicator-layer3');
    if (processingIndicator) {
        processingIndicator.classList.add('processing');
    }
    
    // Simulate processing
    setTimeout(() => {
        if (processingIndicator) {
            processingIndicator.classList.remove('processing');
        }
        
        // Show query section
        setTimeout(() => {
            showQuerySectionLayer3();
        }, 500);
        
        isProcessing = false;
    }, 3000);
    
    console.log('Layer 3 processing started');
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

// Show Query Section Layer 3
function showQuerySectionLayer3() {
    const querySection = document.getElementById('query-section-layer3');
    if (querySection) {
        querySection.style.display = 'block';
        querySection.classList.add('popup-show');
        console.log('Layer 3 query section shown');
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
}

// Perform Query Layer 2
function performQueryLayer2() {
    const queryInput = document.getElementById('query-input-layer2');
    const queryResults = document.getElementById('query-results-layer2');
    
    if (!queryInput || !queryResults) return;
    
    const query = queryInput.value.trim();
    if (!query) return;
    
    console.log('Layer 2 query performed:', query);
    
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
}

// Perform Query Layer 3
function performQueryLayer3() {
    const queryInput = document.getElementById('query-input-layer3');
    const queryResults = document.getElementById('query-results-layer3');
    
    if (!queryInput || !queryResults) return;
    
    const query = queryInput.value.trim();
    if (!query) return;
    
    console.log('Layer 3 query performed:', query);
    
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
}

// Reset Processing
function resetProcessing() {
    console.log('Reset processing called');
    
    // Reset variables
    currentLayer = 0;
    layerSelected = false;
    isProcessing = false;
    
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
            overlap: document.getElementById('chunk-overlap')?.value
        };
        config.embedding = {
            model: document.getElementById('embedding-model')?.value,
            dimensions: document.getElementById('embedding-dims')?.value
        };
        config.storage = {
            backend: document.getElementById('storage-backend')?.value,
            similarity: document.getElementById('similarity-search')?.value
        };
    }
    
    // Save to localStorage (in real app, this would be sent to server)
    localStorage.setItem('csvChunkingConfig', JSON.stringify(config));
    
    console.log('Config saved:', config);
    
    // Show success message (you could add a toast notification here)
    alert('Configuration saved successfully!');
}
