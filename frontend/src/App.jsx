import { useState, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import WebcamFeed from './components/Webcam/WebcamFeed';
import SignDisplay from './components/Recognition/SignDisplay';
import HistoryPanel from './components/Recognition/HistoryPanel';
import SpeechButton from './components/Speech/SpeechButton';

const MAX_HISTORY = 50;
const DEBOUNCE_MS = 1500;

export default function App() {
  const [currentSign, setCurrentSign] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allScores, setAllScores] = useState({});
  const [history, setHistory] = useState([]);
  const lastSignRef = useRef(null);
  const lastAddTimeRef = useRef(0);

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
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    lastSignRef.current = null;
  }, []);

  return (
    <div className="app-bg min-h-screen text-white">
      <Header />

      <main className="relative z-10 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Webcam (takes ~60% on desktop) */}
            <div className="lg:col-span-3">
              <WebcamFeed onSignDetected={handleSignDetected} />
            </div>

            {/* Right: Sign display + Speech + History */}
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
      </main>

      <Footer />

      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-primary-400/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
