import { useState, useCallback, useRef, useEffect } from 'react';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WebcamFeed from './components/Webcam/WebcamFeed';
import SignDisplay from './components/Recognition/SignDisplay';
import HistoryPanel from './components/Recognition/HistoryPanel';
import SpeechButton from './components/Speech/SpeechButton';

// New Views
import SignsLibrary from './components/Navigation/SignsLibrary';
import SettingsPanel from './components/Navigation/SettingsPanel';
import VoiceNavigator from './components/Navigation/VoiceNavigator';

// Hooks
import useDarkMode from './hooks/useDarkMode';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 1500;

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentSign, setCurrentSign] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allScores, setAllScores] = useState({});
  const [history, setHistory] = useState([]);
  
  // Voice & camera command states
  const [cameraTrigger, setCameraTrigger] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState(() => {
    const stored = localStorage.getItem('voiceSettings');
    return stored ? JSON.parse(stored) : {
      voiceFeedback: true,
      autoSpeak: false,
      rate: 0.9,
      pitch: 1.0,
      voiceURI: null
    };
  });

  const lastSignRef = useRef(null);
  const lastAddTimeRef = useRef(0);

  const [isDark, toggleDarkMode] = useDarkMode();
  const { speak } = useSpeechSynthesis();

  // Save voice settings on change
  useEffect(() => {
    localStorage.setItem('voiceSettings', JSON.stringify(voiceSettings));
  }, [voiceSettings]);

  const handleSignDetected = useCallback(({ sign, confidence: conf, allScores: scores }) => {
    setCurrentSign(sign);
    setConfidence(conf);
    setAllScores(scores || {});

    const now = Date.now();
    // Only add to history if sign changed or enough time has passed (debounce)
    if (
      sign &&
      (sign !== lastSignRef.current || now - lastAddTimeRef.current > DEBOUNCE_MS)
    ) {
      lastSignRef.current = sign;
      lastAddTimeRef.current = now;

      setHistory(prev => {
        const newEntry = { sign, confidence: conf, timestamp: now };
        const updated = [newEntry, ...prev];
        return updated.slice(0, MAX_HISTORY);
      });

      // Centralized Auto-Speak feature
      if (voiceSettings.autoSpeak) {
        speak(sign, {
          rate: voiceSettings.rate,
          pitch: voiceSettings.pitch,
          voiceURI: voiceSettings.voiceURI
        });
      }
    }
  }, [voiceSettings, speak]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    lastSignRef.current = null;
  }, []);

  const handleSpeakSign = useCallback(() => {
    if (currentSign) {
      speak(currentSign, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        voiceURI: voiceSettings.voiceURI
      });
    }
  }, [currentSign, speak, voiceSettings]);

  const handleToggleCamera = useCallback((shouldStart) => {
    setCameraTrigger({
      action: shouldStart ? 'start' : 'stop',
      timestamp: Date.now()
    });
  }, []);

  return (
    <div className="app-bg min-h-screen text-white flex flex-col justify-between">
      <div>
        <Header
          activeTab={activeTab}
          onNavigate={setActiveTab}
          isDark={isDark}
          onToggleDarkMode={toggleDarkMode}
        />

        <main className="relative z-10 px-4 sm:px-6 py-4 flex-grow">
          <div className="max-w-7xl mx-auto w-full">
            
            {/* View 1: Dashboard (Webcam + Display) */}
            <div className={activeTab === 'dashboard' ? 'block' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Webcam Feed */}
                <div className="lg:col-span-3">
                  <WebcamFeed
                    onSignDetected={handleSignDetected}
                    voiceCommandTrigger={cameraTrigger}
                  />
                </div>

                {/* Right: Displays & controls */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  <SignDisplay
                    sign={currentSign}
                    confidence={confidence}
                    allScores={allScores}
                  />
                  <SpeechButton text={currentSign} />
                  <HistoryPanel
                    history={history}
                    onClear={clearHistory}
                  />
                </div>
              </div>
            </div>

            {/* View 2: Gesture Library */}
            {activeTab === 'library' && (
              <SignsLibrary />
            )}

            {/* View 3: History Logs */}
            {activeTab === 'history' && (
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                    Detection History
                  </h2>
                  <p className="text-dark-400 text-sm mt-1">
                    Review history logs of all detected gestures.
                  </p>
                </div>
                <HistoryPanel
                  history={history}
                  onClear={clearHistory}
                />
              </div>
            )}

            {/* View 4: Settings & Command List */}
            {activeTab === 'settings' && (
              <SettingsPanel
                onClearHistory={clearHistory}
                voiceSettings={voiceSettings}
                onUpdateVoiceSettings={setVoiceSettings}
              />
            )}

          </div>
        </main>
      </div>

      <Footer />

      {/* Voice Assistant Module (FAB) */}
      <VoiceNavigator
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onToggleDarkMode={toggleDarkMode}
        onClearHistory={clearHistory}
        onSpeakSign={handleSpeakSign}
        onToggleCamera={handleToggleCamera}
        voiceSettings={voiceSettings}
      />

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-primary-400/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
