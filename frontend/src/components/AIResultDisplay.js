import React, { useState } from 'react';
import FormattedAIReport from './FormattedAIReport';

// Used for both a fresh result and the output stored in AI history.
export default function AIResultDisplay({ result, loading, error }) {
  const [showRaw, setShowRaw] = useState(false);

  if (loading || error || result === null || result === undefined) {
    return <FormattedAIReport response={result} loading={loading} error={error} />;
  }

  const downloadJson = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-result.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <FormattedAIReport response={result} />
      <div className="ai-panel-actions">
        <button type="button" className="ai-tool-btn" onClick={downloadJson}>Download JSON</button>
        <button type="button" className="ai-tool-btn" onClick={() => setShowRaw((open) => !open)}>
          {showRaw ? 'Hide raw JSON' : 'Show raw JSON'}
        </button>
      </div>
      {showRaw && <pre className="ai-raw-pre">{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
