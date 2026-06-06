import useDarkMode from '../../hooks/useDarkMode';

export default function Header({ activeTab, onNavigate, isDark, onToggleDarkMode }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'library', label: 'Library', icon: '📖' },
    { id: 'history', label: 'History', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <header className="relative z-20 px-4 sm:px-6 py-4 border-b border-dark-800/40 bg-dark-950/20 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        
        {/* Logo and Brand */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-accent-500 shadow-lg shadow-primary-500/20">
              <span className="text-xl" role="img" aria-label="sign language">🤟</span>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                <span className="bg-gradient-to-r from-primary-400 via-primary-300 to-accent-400 bg-clip-text text-transparent">
                  SignSpeak
                </span>
              </h1>
              <p className="text-xs text-dark-400 font-medium -mt-0.5 hidden sm:block">
                Sign Language Recognition
              </p>
            </div>
          </div>

          {/* Theme Toggler for Mobile (when logo wraps) */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:text-dark-200"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Central Navigation Tabs (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 px-1.5 py-1 rounded-xl bg-dark-800/40 border border-dark-700/30 backdrop-blur-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30 shadow-md shadow-primary-500/5'
                  : 'text-dark-400 border border-transparent hover:text-dark-200 hover:bg-dark-800/50'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Right side utilities (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800/50 border border-dark-700/50">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-dark-400 font-medium">AI Ready</span>
          </div>

          <button
            onClick={onToggleDarkMode}
            className="p-2.5 rounded-xl bg-dark-800/50 border border-dark-700/50 text-dark-400 hover:text-dark-200 hover:bg-dark-700/50 transition-all duration-300"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Tabs */}
        <nav className="flex md:hidden items-center justify-around gap-1 p-1 rounded-xl bg-dark-800/40 border border-dark-700/30 backdrop-blur-md">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-dark-400 border border-transparent hover:text-dark-200'
              }`}
            >
              <span className="text-base mb-0.5">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

      </div>
    </header>
  );
}
