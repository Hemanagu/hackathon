import ConfidenceBadge from '../UI/ConfidenceBadge';

export default function SignDisplay({ sign, confidence, allScores }) {
  const hasSign = sign && sign !== '';

  // Get top 5 scores for the mini bar chart
  const topScores = allScores
    ? Object.entries(allScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <div className="glass-card-dark p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary-400 to-accent-500" />
        <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
          Recognized Sign
        </h2>
      </div>

      <div className="flex flex-col items-center justify-center py-6">
        {hasSign ? (
          <>
            <div className="mb-4">
              <h3 className="text-4xl sm:text-5xl font-extrabold sign-text-gradient text-center transition-all duration-500">
                {sign}
              </h3>
            </div>
            <ConfidenceBadge value={confidence} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4">
            <div className="text-5xl animate-pulse">
              <span role="img" aria-label="hand">✋</span>
            </div>
            <p className="text-dark-500 text-sm font-medium text-center">
              Show a sign to the camera to begin
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-dark-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-dark-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-dark-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Mini bar chart of top predictions */}
      {topScores.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-700/50">
          <p className="text-xs text-dark-500 font-medium mb-3 uppercase tracking-wider">Top Predictions</p>
          <div className="space-y-2">
            {topScores.map(([label, score]) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`text-xs font-semibold w-16 truncate ${
                  label === sign ? 'text-primary-400' : 'text-dark-400'
                }`}>
                  {label}
                </span>
                <div className="flex-1 h-1.5 bg-dark-700/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full score-bar-fill ${
                      label === sign
                        ? 'bg-gradient-to-r from-primary-500 to-primary-400'
                        : 'bg-dark-500'
                    }`}
                    style={{ width: `${Math.round(score * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-dark-500 w-10 text-right font-mono">
                  {Math.round(score * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
