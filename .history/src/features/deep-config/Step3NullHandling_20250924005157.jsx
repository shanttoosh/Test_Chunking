import React from 'react';

export default function Step3NullHandling({
  csvPreviewData = [],
  previewColumns = [],
  setCsvPreviewData,
  setPreviewColumns,
  onBack,
  onNext
}) {
  return (
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
          <select className="form-control" id="null-col-select">
            {previewColumns.filter((c) => c.nulls > 0).map((col, index) => (
              <option key={index} value={col.name}>{col.name} ({col.nulls} nulls)</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Handling Strategy</label>
          <div className="radio-group">
            <label className="radio-item"><input type="radio" name="strategy" value="skip" defaultChecked /> <span>Skip / Leave as is</span></label>
            <label className="radio-item"><input type="radio" name="strategy" value="drop" /> <span>Drop Rows</span></label>
            <label className="radio-item"><input type="radio" name="strategy" value="mean" /> <span>Fill with Mean</span></label>
            <label className="radio-item"><input type="radio" name="strategy" value="mode" /> <span>Fill with Mode</span></label>
            <label className="radio-item"><input type="radio" name="strategy" value="custom" /> <span>Fill with Custom Value</span></label>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const selectedStrategy = document.querySelector('input[name="strategy"]:checked')?.value;
            const selectedColumn = document.getElementById('null-col-select')?.value;
            if (!selectedColumn) return onNext();

            if (selectedStrategy === 'drop') {
              setCsvPreviewData((prev) => prev.filter((row) => row[selectedColumn] !== null));
              setPreviewColumns((prev) => prev.map((c) => (c.name === selectedColumn ? { ...c, nulls: 0 } : c)));
            } else if (selectedStrategy === 'mean') {
              const values = csvPreviewData.map((row) => row[selectedColumn]).filter((v) => v !== null);
              const mean = values.reduce((s, v) => s + v, 0) / (values.length || 1);
              setCsvPreviewData((prev) => prev.map((row) => ({ ...row, [selectedColumn]: row[selectedColumn] === null ? mean : row[selectedColumn] })));
              setPreviewColumns((prev) => prev.map((c) => (c.name === selectedColumn ? { ...c, nulls: 0 } : c)));
            } else if (selectedStrategy === 'mode') {
              const values = csvPreviewData.map((row) => row[selectedColumn]).filter((v) => v !== null);
              const mode = values.reduce((a, b, i, arr) => (arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b));
              setCsvPreviewData((prev) => prev.map((row) => ({ ...row, [selectedColumn]: row[selectedColumn] === null ? mode : row[selectedColumn] })));
              setPreviewColumns((prev) => prev.map((c) => (c.name === selectedColumn ? { ...c, nulls: 0 } : c)));
            }
            onNext();
          }}
        >
          Apply Null Handling
        </button>
      </div>
    </div>
  );
}


