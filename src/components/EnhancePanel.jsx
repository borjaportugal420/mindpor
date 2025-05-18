import React, { useState, useEffect } from 'react';

// Placeholder utility to mimic updating nodes with suggestions
// In a real application this should import from './metaUtils'
function applyMetaSuggestions(nodes, suggestions) {
  // Simply log and return nodes for placeholder purposes
  console.log('Applying suggestions:', suggestions);
  return nodes;
}

function EnhancePanel({ gptResponse, setGptResponse, nodesProp = [], setNodesProp }) {
  const [editableSuggestions, setEditableSuggestions] = useState([]);
  const [viewMode, setViewMode] = useState('pre-analysis');
  const [processStatus, setProcessStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (gptResponse) {
      try {
        const parsed = JSON.parse(gptResponse);
        const suggs = parsed.suggestions || [];
        setEditableSuggestions(JSON.parse(JSON.stringify(suggs)));
        setViewMode('post-analysis');
      } catch (err) {
        setErrorMessage('Failed to parse AI response');
      }
    } else {
      setViewMode('pre-analysis');
      setEditableSuggestions([]);
      setProcessStatus(null);
      setErrorMessage('');
    }
  }, [gptResponse]);

  const handleFieldEdit = (suggestionId, fieldPath, value) => {
    setEditableSuggestions(current =>
      current.map(sugg => {
        if (sugg.id === suggestionId) {
          const newSugg = JSON.parse(JSON.stringify(sugg));
          let target = newSugg;
          const parts = fieldPath.split('.');
          for (let i = 0; i < parts.length - 1; i++) {
            target[parts[i]] = target[parts[i]] || {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = value;
          return newSugg;
        }
        return sugg;
      })
    );
  };

  const handleApplyAnalysis = () => {
    if (!editableSuggestions.length || !setNodesProp) return;
    const updatedNodes = applyMetaSuggestions(nodesProp, editableSuggestions);
    setNodesProp(updatedNodes);
  };

  const handleReset = () => {
    if (setGptResponse) setGptResponse('');
    setViewMode('pre-analysis');
    setEditableSuggestions([]);
    setProcessStatus(null);
    setErrorMessage('');
  };

  return (
    <div className="enhance-panel">
      {viewMode === 'pre-analysis' ? (
        <div className="pre-analysis">
          <textarea placeholder="Context/Goal" />
          <button onClick={() => setProcessStatus('analyzing')}>✨ Analyze Flow</button>
        </div>
      ) : (
        <div className="post-analysis">
          <h3>AI Suggestions</h3>
          <div className="suggestions">
            {editableSuggestions.map(sugg => (
              <div key={sugg.id} className="suggestion">
                <input
                  value={sugg.meta?.task || ''}
                  onChange={e => handleFieldEdit(sugg.id, 'meta.task', e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="actions">
            <button onClick={handleApplyAnalysis}>Apply Edited Suggestions</button>
            <button onClick={handleReset}>Reset</button>
          </div>
        </div>
      )}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
}

export default EnhancePanel;
