import { useState } from 'react';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';

export default function SpeechButton({ text }) {
  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis();
  const [autoSpeak, setAutoSpeak] = useState(false);
  const lastSpokenRef = { current: '' };

  // Auto-speak when text changes
  if (autoSpeak && text && text !== lastSpokenRef.current) {
    lastSpokenRef.current = text;
    setTimeout(() => speak(text), 100);
  }

  if (!isSupported) {
    return (
      <div className="glass-card-dark p-4 animate-fade-in">
        <p className="text-dark-500 text-xs text-center">Speech synthesis not supported</p>
      </div>
    );
  }

  return (
    <div className="glass-card-dark p-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-6 rounded-full bg-gradient-to-b from-primary-300 to-primary-600" />
        <h2 className="text-sm font-semibold text-dark-300 uppercase tracking-wider">
          Text to Speech
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (isSpeaking) {
              stop();
            } else if (text) {
              speak(text);
            }
          }}
          disabled={!text}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 active:scale-95 ${
            isSpeaking
              ? 'bg-primary-500/20 border border-primary-500/30 text-primary-300 animate-pulse'
              : text
              ? 'bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-500/30 text-primary-300 hover:from-primary-500/30 hover:to-accent-500/30'
              : 'bg-dark-800/50 border border-dark-700/50 text-dark-600 cursor-not-allowed'
          }`}
        >
          {isSpeaking ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Speaking
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
              {text ? `Speak "${text}"` : 'No sign detected'}
            </>
          )}
        </button>
      </div>

      {/* Auto-speak toggle */}
      <label className="flex items-center gap-2 mt-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={autoSpeak}
            onChange={(e) => setAutoSpeak(e.target.checked)}
            className="sr-only"
          />
          <div className={`w-9 h-5 rounded-full transition-colors duration-300 ${
            autoSpeak ? 'bg-primary-500' : 'bg-dark-700'
          }`}>
            <div className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-300 mt-0.5 ${
              autoSpeak ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
            }`} />
          </div>
        </div>
        <span className="text-xs text-dark-400 group-hover:text-dark-300 transition-colors font-medium">
          Auto-speak on detection
        </span>
      </label>
    </div>
  );
}
