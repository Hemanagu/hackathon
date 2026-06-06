export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-full border-dark-600 border-t-primary-400 animate-spin`}
        style={{ borderTopColor: '#22d3ee' }}
      />
      {text && (
        <p className="text-dark-400 text-sm font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}
