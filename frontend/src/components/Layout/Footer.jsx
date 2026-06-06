export default function Footer() {
  return (
    <footer className="relative z-10 px-4 sm:px-6 py-6 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-dark-800/50">
          <p className="text-xs text-dark-500 font-medium">
            Built with{' '}
            <span className="text-primary-400">MediaPipe</span>
            {' + '}
            <span className="text-accent-400">LSTM</span>
            {' + '}
            <span className="text-primary-300">React</span>
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-500 hover:text-primary-400 transition-colors"
            >
              MediaPipe
            </a>
            <span className="text-dark-700">•</span>
            <a
              href="https://react.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-500 hover:text-primary-400 transition-colors"
            >
              React
            </a>
            <span className="text-dark-700">•</span>
            <a
              href="https://tailwindcss.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-dark-500 hover:text-primary-400 transition-colors"
            >
              Tailwind
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
