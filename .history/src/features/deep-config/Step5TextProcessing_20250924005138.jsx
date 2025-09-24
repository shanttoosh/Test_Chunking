import React from 'react';

export default function Step5TextProcessing({
  csvPreviewData = [],
  previewColumns = [],
  setCsvPreviewData,
  onBack,
  onNext
}) {
  return (
    <div className="config-step" data-step="5">
      <div className="step-header">
        <h3>📝 Text Processing</h3>
        <p>Apply text normalization and cleaning</p>
      </div>
      <div className="text-processing-options">
        <div className="option-group">
          <h4>Stop Words Removal</h4>
          <label className="checkbox-item">
            <input id="dc-remove-stopwords" type="checkbox" />
            <span>Remove common stop words from text columns</span>
          </label>
        </div>
        <div className="option-group">
          <h4>Text Normalization</h4>
          <div className="radio-group">
            <label className="radio-item">
              <input type="radio" name="dc-normalization" value="lemmatize" defaultChecked />
              <span>Lemmatization (Recommended)</span>
            </label>
            <label className="radio-item">
              <input type="radio" name="dc-normalization" value="stem" />
              <span>Stemming</span>
            </label>
            <label className="radio-item">
              <input type="radio" name="dc-normalization" value="skip" />
              <span>Skip normalization</span>
            </label>
          </div>
        </div>
      </div>
      <div className="step-actions">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          onClick={() => {
            const removeStop = document.getElementById('dc-remove-stopwords')?.checked;
            const normMethod = document.querySelector('input[name="dc-normalization"]:checked')?.value;
            setCsvPreviewData((prev) =>
              prev.map((row) => {
                const newRow = { ...row };
                previewColumns.forEach((col) => {
                  if (col.type === 'object' && row[col.name] !== null) {
                    let text = String(row[col.name]);
                    if (removeStop) {
                      const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
                      text = text
                        .split(' ')
                        .filter((w) => !stopWords.includes(w.toLowerCase()))
                        .join(' ');
                    }
                    if (normMethod === 'lemmatize') {
                      text = text.toLowerCase();
                    } else if (normMethod === 'stem') {
                      text = text.toLowerCase().replace(/ing$|ed$|s$/, '');
                    }
                    newRow[col.name] = text;
                  }
                });
                return newRow;
              })
            );
            onNext();
          }}
        >
          Apply Text Processing
        </button>
      </div>
    </div>
  );
}


