import { useCallback } from 'react';

export default function HistoryPanel({ history, onClear }) {
  const timeAgo = useCallback((timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  }, []);

  const getConfidenceColor = (confidence) => {
    const pct = Math.round(confidence * 100);
    if (pct >= 70) return 'text-emerald-400 bg-emerald-400/10';
    if (pct >= 40) return 'text-amber-400 bg-amber-400/10';
    return 'text-red-400 bg-red-400/10';
  };

  return (
    <div className="glass-card-dark p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-accent-400 to-primary-500" />
          <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
            History
          </h2>
          {history.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-dark-700 text-dark-400 text-xs font-medium">
              {history.length}
            </span>
          )}
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-dark-500 hover:text-red-400 transition-colors font-medium"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="max-h-64 overflow-y-auto pr-1 space-y-2" style={{ scrollbarGutter: 'stable' }}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-3xl mb-2">📋</span>
            <p className="text-dark-500 text-sm font-medium">No signs detected yet</p>
            <p className="text-dark-600 text-xs mt-1">Start detecting to see history</p>
          </div>
        ) : (
          history.map((entry, index) => (
            <div
              key={entry.timestamp + '-' + index}
              className={`flex items-center justify-between p-3 rounded-xl bg-dark-800/40 border border-dark-700/30 
                ${index === 0 ? 'animate-slide-up' : ''} 
                hover:bg-dark-700/40 transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-primary-500/20">
                  <span className="text-sm font-bold text-primary-400">
                    {entry.sign.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-200">{entry.sign}</p>
                  <p className="text-xs text-dark-500">{timeAgo(entry.timestamp)}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${getConfidenceColor(entry.confidence)}`}>
                {Math.round(entry.confidence * 100)}%
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
