import React, { useState } from 'react';

export default function Step7Chunking({ 
  selectedChunkingMethod, setSelectedChunkingMethod,
  chunkSize, setChunkSize, overlap, setOverlap,
  textChunkChars, setTextChunkChars, overlapChars, setOverlapChars,
  batchSize, setBatchSize, similarityThreshold, setSimilarityThreshold,
  nClusters, setNClusters, keyColumn, setKeyColumn, useMultipleKeys, setUseMultipleKeys,
  keyColumns, setKeyColumns, tokenLimit, setTokenLimit, modelName, setModelName,
  preserveHeaders, setPreserveHeaders, onBack, onApply 
}) {
  return (
    <div className="config-step" data-step="7">
      <div className="step-header">
        <h3>✂️ Chunking Method Selection</h3>
        <p>Choose how to split your data into chunks</p>
      </div>
      
      <div className="chunking-methods">
        <div className="method-selection">
          <h4>Select Chunking Method</h4>
          <div className="method-options">
            <label className="method-option">
              <input 
                type="radio" 
                name="chunking-method" 
                value="fixed" 
                checked={selectedChunkingMethod === 'fixed'}
                onChange={(e) => setSelectedChunkingMethod(e.target.value)}
              />
              <span>Fixed Size Chunking</span>
            </label>
            <label className="method-option">
              <input 
                type="radio" 
                name="chunking-method" 
                value="recursive" 
                checked={selectedChunkingMethod === 'recursive'}
                onChange={(e) => setSelectedChunkingMethod(e.target.value)}
              />
              <span>Recursive Chunking</span>
            </label>
            <label className="method-option">
              <input 
                type="radio" 
                name="chunking-method" 
                value="semantic" 
                checked={selectedChunkingMethod === 'semantic'}
                onChange={(e) => setSelectedChunkingMethod(e.target.value)}
              />
              <span>Semantic Chunking</span>
            </label>
            <label className="method-option">
              <input 
                type="radio" 
                name="chunking-method" 
                value="document" 
                checked={selectedChunkingMethod === 'document'}
                onChange={(e) => setSelectedChunkingMethod(e.target.value)}
              />
              <span>Document Based Chunking</span>
            </label>
          </div>
        </div>

        {/* Fixed Size Chunking Parameters */}
        {selectedChunkingMethod === 'fixed' && (
          <div className="method-params">
            <h4>Fixed Size Parameters</h4>
            <div className="param-grid">
              <label>
                Chunk Size (rows)
                <input 
                  type="number" 
                  value={chunkSize} 
                  onChange={(e) => setChunkSize(parseInt(e.target.value))}
                  min="1"
                />
              </label>
              <label>
                Overlap (rows)
                <input 
                  type="number" 
                  value={overlap} 
                  onChange={(e) => setOverlap(parseInt(e.target.value))}
                  min="0"
                  max={chunkSize - 1}
                />
              </label>
            </div>
          </div>
        )}

        {/* Recursive Chunking Parameters */}
        {selectedChunkingMethod === 'recursive' && (
          <div className="method-params">
            <h4>Recursive Parameters</h4>
            <div className="param-grid">
              <label>
                Text Chunk Characters
                <input 
                  type="number" 
                  value={textChunkChars} 
                  onChange={(e) => setTextChunkChars(parseInt(e.target.value))}
                  min="100"
                />
              </label>
              <label>
                Overlap Characters
                <input 
                  type="number" 
                  value={overlapChars} 
                  onChange={(e) => setOverlapChars(parseInt(e.target.value))}
                  min="0"
                />
              </label>
            </div>
          </div>
        )}

        {/* Semantic Chunking Parameters */}
        {selectedChunkingMethod === 'semantic' && (
          <div className="method-params">
            <h4>Semantic Parameters</h4>
            <div className="param-grid">
              <label>
                Batch Size
                <input 
                  type="number" 
                  value={batchSize} 
                  onChange={(e) => setBatchSize(parseInt(e.target.value))}
                  min="50"
                  max="500"
                />
              </label>
              <label>
                Similarity Threshold
                <input 
                  type="number" 
                  value={similarityThreshold} 
                  onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                  min="0.1"
                  max="0.9"
                  step="0.1"
                />
              </label>
              <label>
                N Clusters (optional)
                <input 
                  type="number" 
                  value={nClusters || ''} 
                  onChange={(e) => setNClusters(e.target.value ? parseInt(e.target.value) : null)}
                  min="1"
                  placeholder="Auto"
                />
              </label>
            </div>
          </div>
        )}

        {/* Document Based Chunking Parameters */}
        {selectedChunkingMethod === 'document' && (
          <div className="method-params">
            <h4>Document Based Parameters</h4>
            <div className="param-grid">
              <label>
                Key Column
                <input 
                  type="text" 
                  value={keyColumn} 
                  onChange={(e) => setKeyColumn(e.target.value)}
                  placeholder="Enter column name"
                />
              </label>
              <label>
                Token Limit
                <input 
                  type="number" 
                  value={tokenLimit} 
                  onChange={(e) => setTokenLimit(parseInt(e.target.value))}
                  min="100"
                />
              </label>
              <label>
                Model Name
                <select 
                  value={modelName} 
                  onChange={(e) => setModelName(e.target.value)}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="cl100k_base">CL100K Base</option>
                </select>
              </label>
              <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={preserveHeaders} 
                  onChange={(e) => setPreserveHeaders(e.target.checked)}
                />
                Preserve Headers
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onApply}>Apply Chunking</button>
      </div>
    </div>
  );
}


