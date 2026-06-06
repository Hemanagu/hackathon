import { useState, useEffect } from 'react';

export default function SettingsPanel({
  onClearHistory,
  voiceSettings,
  onUpdateVoiceSettings
}) {
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices.filter(v => v.lang.startsWith('en')));
      };
      
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const commandGroups = [
    {
      title: 'Navigation Commands',
      commands: [
        { phrase: '"go to home" / "go to dashboard"', action: 'Switch to the main hand gesture detection panel' },
        { phrase: '"go to signs" / "show signs" / "show library"', action: 'Open the supported gesture library grid' },
        { phrase: '"go to history" / "show history"', action: 'Navigate to the full history logs panel' },
        { phrase: '"go to settings" / "show settings"', action: 'Navigate to this settings and commands page' }
      ]
    },
    {
      title: 'Control Commands',
      commands: [
        { phrase: '"toggle dark mode" / "dark mode" / "light mode"', action: 'Toggle between dark and light themes' },
        { phrase: '"start camera" / "start detection"', action: 'Turn on the webcam stream and start gesture detection' },
        { phrase: '"stop camera" / "stop detection"', action: 'Turn off the webcam stream and pause detection' },
        { phrase: '"clear history" / "reset history"', action: 'Wipe clean all saved history logs' },
        { phrase: '"speak sign" / "pronounce sign"', action: 'Speak out loud the currently detected sign' }
      ]
    }
  ];

  return (
    <div className="animate-fade-in w-full max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
          Settings & Commands
        </h2>
        <p className="text-dark-400 text-sm mt-1">
          Configure app preferences and view voice navigation assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left column: Controls (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Voice Preferences Card */}
          <div className="glass-card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <span role="img" aria-label="settings">⚙️</span> App & Speech Settings
            </h3>

            <div className="flex flex-col gap-5">
              {/* Voice Navigation Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-white">Voice Navigation Feedback</label>
                  <p className="text-xs text-dark-400">Assistant speaks to confirm voice actions</p>
                </div>
                <button
                  onClick={() => onUpdateVoiceSettings({ voiceFeedback: !voiceSettings.voiceFeedback })}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${
                    voiceSettings.voiceFeedback ? 'bg-primary-500' : 'bg-dark-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                      voiceSettings.voiceFeedback ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Auto Speak Sign Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-semibold text-white">Auto-Speak Detections</label>
                  <p className="text-xs text-dark-400">Speaks recognized signs automatically as they appear</p>
                </div>
                <button
                  onClick={() => onUpdateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak })}
                  className={`w-12 h-6 rounded-full transition-colors duration-300 relative ${
                    voiceSettings.autoSpeak ? 'bg-primary-500' : 'bg-dark-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all duration-300 ${
                      voiceSettings.autoSpeak ? 'right-0.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Voice Choice */}
              {availableVoices.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-dark-400">Select Speech Voice</label>
                  <select
                    value={voiceSettings.voiceURI || ''}
                    onChange={(e) => onUpdateVoiceSettings({ voiceURI: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-dark-900 border border-dark-700/50 text-dark-200 text-sm focus:outline-none focus:border-primary-500"
                  >
                    {availableVoices.map(voice => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* TTS Speech Rate */}
              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-dark-400">
                  <span>Speech Rate</span>
                  <span className="text-primary-400 font-mono">{voiceSettings.rate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voiceSettings.rate}
                  onChange={(e) => onUpdateVoiceSettings({ rate: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>

              {/* TTS Speech Pitch */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-dark-400">
                  <span>Speech Pitch</span>
                  <span className="text-primary-400 font-mono">{voiceSettings.pitch}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={voiceSettings.pitch}
                  onChange={(e) => onUpdateVoiceSettings({ pitch: parseFloat(e.target.value) })}
                  className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Account/System preferences card */}
          <div className="glass-card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <span role="img" aria-label="danger zone">⚠️</span> Data Maintenance
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <label className="text-sm font-semibold text-white">Reset History Logs</label>
                <p className="text-xs text-dark-400">Permanently erase all locally saved gesture logs</p>
              </div>
              <button
                onClick={onClearHistory}
                className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold rounded-xl text-xs transition-all duration-300"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Voice commands reference (2 cols) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-card-dark p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-dark-800 pb-3">
              <span role="img" aria-label="commands">🎤</span> Voice Commands
            </h3>

            <div className="flex flex-col gap-6">
              {commandGroups.map(group => (
                <div key={group.title}>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary-400 mb-3">
                    {group.title}
                  </h4>
                  <div className="flex flex-col gap-3">
                    {group.commands.map(cmd => (
                      <div
                        key={cmd.phrase}
                        className="p-3 rounded-xl bg-dark-900/60 border border-dark-800/80 hover:border-dark-700/50 transition-colors duration-300"
                      >
                        <div className="text-sm font-mono font-semibold text-white">
                          {cmd.phrase}
                        </div>
                        <div className="text-xs text-dark-400 mt-1">
                          {cmd.action}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
