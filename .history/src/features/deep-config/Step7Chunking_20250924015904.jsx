import React from 'react';

export function ChunkParamsFixed({ chunkSize, setChunkSize, overlap, setOverlap }) {
  return (
    <div className="method-options">
      <div className="form-group">
        <label className="form-label">Chunk Size (rows)</label>
        <input type="number" className="form-control" value={chunkSize} min="1" max="100000" onChange={(e) => setChunkSize(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label className="form-label">Overlap (rows)</label>
        <input type="number" className="form-control" value={overlap} min="0" max={Math.max(0, chunkSize - 1)} onChange={(e) => setOverlap(Number(e.target.value))} />
      </div>
    </div>
  );
}

export function ChunkParamsRecursive({ textChunkChars, setTextChunkChars, overlapChars, setOverlapChars }) {
  return (
    <div className="method-options">
      <div className="form-group">
        <label className="form-label">Target Characters</label>
        <input type="number" className="form-control" value={textChunkChars} min="500" max="20000" onChange={(e) => setTextChunkChars(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label className="form-label">Overlap (characters)</label>
        <input type="number" className="form-control" value={overlapChars} min="0" max="5000" onChange={(e) => setOverlapChars(Number(e.target.value))} />
      </div>
    </div>
  );
}

export function ChunkParamsSemantic({ batchSize, setBatchSize, similarityThreshold, setSimilarityThreshold, nClusters, setNClusters }) {
  return (
    <div className="method-options">
      <div className="form-group">
        <label className="form-label">Batch Size</label>
        <input type="number" className="form-control" value={batchSize} min="50" max="500" onChange={(e) => setBatchSize(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label className="form-label">Similarity Threshold</label>
        <input type="range" className="range-slider" min="0.3" max="0.9" step="0.1" value={similarityThreshold} onChange={(e) => setSimilarityThreshold(Number(e.target.value))} />
        <div className="range-labels">
          <span>0.3</span>
          <span className="range-value">{similarityThreshold.toFixed(1)}</span>
          <span>0.9</span>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Number of clusters (optional)</label>
        <input type="number" className="form-control" value={nClusters ?? ''} min="2" max="100" placeholder="auto"
               onChange={(e) => setNClusters(e.target.value === '' ? null : Number(e.target.value))} />
      </div>
    </div>
  );
}

export function ChunkParamsDocument({
  previewColumns = [],
  keyColumn, setKeyColumn,
  useMultipleKeys, setUseMultipleKeys,
  keyColumns, setKeyColumns,
  tokenLimit, setTokenLimit,
  modelName, setModelName,
  preserveHeaders, setPreserveHeaders
}) {
  const columnNames = previewColumns.map((c) => c.name);
  return (
    <div className="method-options">
      <div className="form-group">
        <label className="form-label">Key Column</label>
        <select className="form-control" value={keyColumn} onChange={(e) => setKeyColumn(e.target.value)}>
          <option value="">-- select --</option>
          {columnNames.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Use multiple keys</label>
        <label className="toggle-switch">
          <input type="checkbox" checked={useMultipleKeys} onChange={(e) => setUseMultipleKeys(e.target.checked)} />
          <span className="toggle-slider"></span>
        </label>
      </div>
      {useMultipleKeys && (
        <div className="form-group">
          <label className="form-label">Key Columns</label>
          <div className="multiselect-container">
            {columnNames.map((c) => (
              <label className="checkbox-item" key={c}>
                <input type="checkbox" checked={keyColumns.includes(c)} onChange={(e) => {
                  if (e.target.checked) setKeyColumns([...keyColumns, c]);
                  else setKeyColumns(keyColumns.filter((x) => x !== c));
                }} />
                <span>{c}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="form-group">
        <label className="form-label">Token Limit</label>
        <input type="number" className="form-control" value={tokenLimit} min="100" max="10000" onChange={(e) => setTokenLimit(Number(e.target.value))} />
      </div>
      <div className="form-group">
        <label className="form-label">Tokenizer Model</label>
        <select className="form-control" value={modelName} onChange={(e) => setModelName(e.target.value)}>
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="cl100k_base">cl100k_base</option>
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Preserve Headers</label>
        <label className="toggle-switch">
          <input type="checkbox" checked={preserveHeaders} onChange={(e) => setPreserveHeaders(e.target.checked)} />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );
}

export default function Step7Chunking({
  selectedChunkingMethod, setSelectedChunkingMethod,
  // fixed
  chunkSize, setChunkSize, overlap, setOverlap,
  // recursive
  textChunkChars, setTextChunkChars, overlapChars, setOverlapChars,
  // semantic
  batchSize, setBatchSize, similarityThreshold, setSimilarityThreshold, nClusters, setNClusters,
  // document
  previewColumns,
  keyColumn, setKeyColumn, useMultipleKeys, setUseMultipleKeys, keyColumns, setKeyColumns,
  tokenLimit, setTokenLimit, modelName, setModelName, preserveHeaders, setPreserveHeaders,
  onBack, onApply
}) {
  return (
    <div className="config-step" data-step="7">
      <div className="step-header">
        <h3>✂️ Chunking Method Selection</h3>
        <p>Choose how to split your data into chunks</p>
      </div>
      <div className="chunking-methods">
        <div className="method-grid">
          <div className="method-card">
            <div className="method-header">
              <input type="radio" name="chunking-method" value="fixed" id="fixed" checked={selectedChunkingMethod === 'fixed'} onChange={() => setSelectedChunkingMethod('fixed')} />
              <label htmlFor="fixed">
                <h4>Fixed Size Chunking</h4>
                <p>Splits data into fixed-size chunks with optional overlap</p>
              </label>
            </div>
            {selectedChunkingMethod === 'fixed' && (
              <ChunkParamsFixed chunkSize={chunkSize} setChunkSize={setChunkSize} overlap={overlap} setOverlap={setOverlap} />
            )}
          </div>

          <div className="method-card">
            <div className="method-header">
              <input type="radio" name="chunking-method" value="document" id="document" checked={selectedChunkingMethod === 'document'} onChange={() => setSelectedChunkingMethod('document')} />
              <label htmlFor="document">
                <h4>Document Based Chunking</h4>
                <p>Group rows by key(s) and split large groups by token count</p>
              </label>
            </div>
            {selectedChunkingMethod === 'document' && (
              <ChunkParamsDocument
                previewColumns={previewColumns}
                keyColumn={keyColumn} setKeyColumn={setKeyColumn}
                useMultipleKeys={useMultipleKeys} setUseMultipleKeys={setUseMultipleKeys}
                keyColumns={keyColumns} setKeyColumns={setKeyColumns}
                tokenLimit={tokenLimit} setTokenLimit={setTokenLimit}
                modelName={modelName} setModelName={setModelName}
                preserveHeaders={preserveHeaders} setPreserveHeaders={setPreserveHeaders}
              />
            )}
          </div>

          <div className="method-card">
            <div className="method-header">
              <input type="radio" name="chunking-method" value="semantic" id="semantic" checked={selectedChunkingMethod === 'semantic'} onChange={() => setSelectedChunkingMethod('semantic')} />
              <label htmlFor="semantic">
                <h4>Semantic Chunking</h4>
                <p>AI-powered semantic grouping by meaning</p>
              </label>
            </div>
            {selectedChunkingMethod === 'semantic' && (
              <ChunkParamsSemantic
                batchSize={batchSize} setBatchSize={setBatchSize}
                similarityThreshold={similarityThreshold} setSimilarityThreshold={setSimilarityThreshold}
                nClusters={nClusters} setNClusters={setNClusters}
              />
            )}
          </div>

          <div className="method-card">
            <div className="method-header">
              <input type="radio" name="chunking-method" value="recursive" id="recursive" checked={selectedChunkingMethod === 'recursive'} onChange={() => setSelectedChunkingMethod('recursive')} />
              <label htmlFor="recursive">
                <h4>Recursive Chunking</h4>
                <p>Semantic text-recursive chunking with character budget</p>
              </label>
            </div>
            {selectedChunkingMethod === 'recursive' && (
              <ChunkParamsRecursive textChunkChars={textChunkChars} setTextChunkChars={setTextChunkChars} overlapChars={overlapChars} setOverlapChars={setOverlapChars} />
            )}
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" onClick={onApply}>Apply Chunking Method</button>
      </div>
    </div>
  );
}


