import { useState, useEffect, useRef, useCallback } from 'react';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';

export default function VoiceNavigator({
  activeTab,
  onNavigate,
  onToggleDarkMode,
  onClearHistory,
  onSpeakSign,
  onToggleCamera,
  voiceSettings
}) {
  const [isListening, setIsListening] = useState(false);
  const [lastHeard, setLastHeard] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'success' | 'error'
  const [showToast, setShowToast] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef(null);
  const toastTimeoutRef = useRef(null);
  const { speak } = useSpeechSynthesis();

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setStatus('error');
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if the user explicitly left it on
        if (isListening) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error('Error restarting recognition:', e);
          }
        } else {
          setStatus('idle');
        }
      };

      recognition.onresult = (event) => {
        const resultIndex = event.resultIndex;
        const transcriptText = event.results[resultIndex][0].transcript.trim().toLowerCase();
        handleVoiceCommand(transcriptText);
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]); // Re-bind lifecycle to current listening state

  // Handle start/stop transitions
  useEffect(() => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
      }
    } else {
      recognitionRef.current.stop();
      setStatus('idle');
    }
  }, [isListening]);

  const triggerToast = useCallback((heard, feedback) => {
    setLastHeard(heard);
    setActionFeedback(feedback);
    setStatus('success');
    setShowToast(true);

    // TTS voice feedback
    if (voiceSettings.voiceFeedback) {
      speak(feedback, {
        rate: voiceSettings.rate,
        pitch: voiceSettings.pitch,
        voiceURI: voiceSettings.voiceURI
      });
    }

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
      setStatus(isListening ? 'listening' : 'idle');
    }, 3500);
  }, [speak, voiceSettings, isListening]);

  const handleVoiceCommand = (command) => {
    console.log('Voice Command Received:', command);

    // 1. Navigation Commands
    if (command.includes('go to home') || command.includes('go to dashboard') || command.includes('show dashboard')) {
      onNavigate('dashboard');
      triggerToast(command, 'Navigating to Dashboard');
    } 
    else if (command.includes('go to signs') || command.includes('show signs') || command.includes('show library') || command.includes('go to library')) {
      onNavigate('library');
      triggerToast(command, 'Showing Signs Library');
    } 
    else if (command.includes('go to history') || command.includes('show history') || command.includes('show logs')) {
      onNavigate('history');
      triggerToast(command, 'Showing Detection History');
    } 
    else if (command.includes('go to settings') || command.includes('show settings') || command.includes('show commands')) {
      onNavigate('settings');
      triggerToast(command, 'Showing Settings and Help');
    } 
    
    // 2. Control/Trigger Commands
    else if (command.includes('toggle dark mode') || command.includes('dark mode') || command.includes('light mode') || command.includes('toggle theme')) {
      onToggleDarkMode();
      triggerToast(command, 'Toggling theme');
    } 
    else if (command.includes('clear history') || command.includes('reset history')) {
      onClearHistory();
      triggerToast(command, 'History cleared');
    } 
    else if (command.includes('speak sign') || command.includes('pronounce sign')) {
      onSpeakSign();
      triggerToast(command, 'Pronouncing detected sign');
    }
    else if (command.includes('start camera') || command.includes('start detection') || command.includes('enable camera')) {
      onToggleCamera(true);
      triggerToast(command, 'Camera started');
    }
    else if (command.includes('stop camera') || command.includes('stop detection') || command.includes('disable camera')) {
      onToggleCamera(false);
      triggerToast(command, 'Camera stopped');
    }
    else {
      // Ignored or unrecognized voice input
      setLastHeard(command);
      setStatus('idle');
    }
  };

  const toggleListening = () => {
    setIsListening(prev => !prev);
  };

  if (!isSupported) {
    return null; // Don't render if not supported (or return minor warning)
  }

  return (
    <>
      {/* Floating Action Button (FAB) in bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Live Feedback Toast */}
        {showToast && (
          <div className="pointer-events-auto animate-slide-up glass-card p-4 max-w-sm rounded-2xl shadow-2xl border border-primary-500/20 bg-dark-900/90 text-white flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0 mt-0.5">
              ✓
            </div>
            <div>
              <div className="text-xs text-dark-400 font-semibold uppercase tracking-wider">Voice Control</div>
              <div className="text-sm font-semibold text-white mt-0.5">{actionFeedback}</div>
              <div className="text-[11px] font-mono text-primary-400 italic mt-1">Heard: "{lastHeard}"</div>
            </div>
          </div>
        )}

        {/* Microphone Controller */}
        <div className="pointer-events-auto flex items-center gap-3">
          {/* Status Tooltip */}
          <div className={`px-3 py-1.5 rounded-xl backdrop-blur-md border border-dark-700/50 bg-dark-900/80 text-xs text-dark-300 font-medium transition-all duration-300 shadow-lg ${
            isListening ? 'opacity-100 scale-100' : 'opacity-0 scale-90 translate-x-2 pointer-events-none'
          }`}>
            {status === 'listening' && 'Listening... Say "Go to signs"'}
            {status === 'success' && 'Command processed'}
            {status === 'error' && 'Mic error'}
          </div>

          {/* Micro Button */}
          <button
            onClick={toggleListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border transition-all duration-300 relative focus:outline-none ${
              isListening
                ? 'bg-gradient-to-tr from-red-500 to-accent-600 border-red-400 shadow-red-500/25 scale-105 hover:scale-110'
                : 'bg-gradient-to-tr from-primary-500 to-accent-500 border-primary-400 shadow-primary-500/20 hover:scale-105'
            }`}
            aria-label={isListening ? 'Stop voice control' : 'Start voice control'}
          >
            {/* Rippling pulse animation rings */}
            {isListening && (
              <>
                <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping -z-10" />
                <div className="absolute -inset-2 rounded-full border border-red-500/20 animate-pulse -z-10" />
              </>
            )}

            {isListening ? (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            )}
          </button>
        </div>

      </div>
    </>
  );
}
