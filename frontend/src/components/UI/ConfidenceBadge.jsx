export default function ConfidenceBadge({ value = 0 }) {
  const percentage = Math.round(value * 100);

  const getColor = () => {
    if (percentage >= 70) return { text: 'text-emerald-400', ring: '#34d399', bg: 'bg-emerald-400/10' };
    if (percentage >= 40) return { text: 'text-amber-400', ring: '#fbbf24', bg: 'bg-amber-400/10' };
    return { text: 'text-red-400', ring: '#f87171', bg: 'bg-red-400/10' };
  };

  const color = getColor();
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (value * circumference);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-dark-700"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={color.ring}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${color.text}`}>{percentage}%</span>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-lg ${color.bg}`}>
        <span className={`text-xs font-semibold ${color.text}`}>
          {percentage >= 70 ? 'High' : percentage >= 40 ? 'Medium' : 'Low'}
        </span>
      </div>
    </div>
  );
}
