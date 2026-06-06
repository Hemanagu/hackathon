import { useRef, useState, useEffect, useCallback } from 'react';
import useMediaPipe from '../../hooks/useMediaPipe';
import useSignRecognition from '../../hooks/useSignRecognition';
import HandLandmarkCanvas from './HandLandmarkCanvas';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorBanner from '../UI/ErrorBanner';

export default function WebcamFeed({ onSignDetected, voiceCommandTrigger }) {
  const videoRef = useRef(null);
  const animationRef = useRef(null);
  const lastTimestampRef = useRef(0);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [webcamError, setWebcamError] = useState(null);
  const [handDetected, setHandDetected] = useState(false);
  const [currentLandmarks, setCurrentLandmarks] = useState(null);
  const [videoDimensions, setVideoDimensions] = useState({ width: 640, height: 480 });

  const { detectGestures, isLoading: mediaPipeLoading, error: mediaPipeError, isReady, statusText } = useMediaPipe();
  const { currentSign, confidence, allScores, processGesture, error: recognitionError, resetRecognition } = useSignRecognition();

  // Bubble recognized sign up to App
  useEffect(() => {
    if (currentSign && onSignDetected) {
      onSignDetected({ sign: currentSign, confidence, allScores });
    }
  }, [currentSign, confidence, allScores, onSignDetected]);

  const startWebcam = useCallback(async () => {
    try {
      setWebcamError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        const { videoWidth, videoHeight } = videoRef.current;
        if (videoWidth && videoHeight) setVideoDimensions({ width: videoWidth, height: videoHeight });
      }
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setWebcamError('Camera access was denied. Please allow camera access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setWebcamError('No camera found. Please connect a webcam.');
      } else {
        setWebcamError(err.message || 'Failed to access webcam.');
      }
    }
  }, []);

  const stopWebcam = useCallback(() => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsDetecting(false);
    setHandDetected(false);
    setCurrentLandmarks(null);
    resetRecognition();
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, [resetRecognition]);

  // Core detection loop — runs on every animation frame while detecting
  const detectionLoop = useCallback(() => {
    if (!videoRef.current || !isReady || videoRef.current.readyState < 2) {
      animationRef.current = requestAnimationFrame(detectionLoop);
      return;
    }

    const now = performance.now();
    // Guard: MediaPipe requires strictly increasing timestamps
    if (now <= lastTimestampRef.current) {
      animationRef.current = requestAnimationFrame(detectionLoop);
      return;
    }
    lastTimestampRef.current = now;

    // GestureRecognizer returns gestures + landmarks in ONE call
    const results = detectGestures(videoRef.current, now);

    if (results?.landmarks?.length > 0) {
      const landmarks = results.landmarks[0];
      const gesture   = results.gestures?.[0]?.[0] ?? null; // top-1 gesture

      setCurrentLandmarks(landmarks);
      setHandDetected(true);

      // Process in recognition hook (client-side mapping, no network needed)
      processGesture(gesture, landmarks);
    } else {
      setCurrentLandmarks(null);
      setHandDetected(false);
      processGesture(null, null);
    }

    animationRef.current = requestAnimationFrame(detectionLoop);
  }, [detectGestures, isReady, processGesture]);

  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      setIsDetecting(false);
      setHandDetected(false);
      setCurrentLandmarks(null);
      resetRecognition();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    } else {
      setIsDetecting(true);
      animationRef.current = requestAnimationFrame(detectionLoop);
    }
  }, [isDetecting, detectionLoop, resetRecognition]);

  // Auto-start webcam on mount
  useEffect(() => {
    startWebcam();
    return () => stopWebcam();
  }, []); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Handle voice commands for starting/stopping the camera
  useEffect(() => {
    if (!voiceCommandTrigger) return;

    const { action } = voiceCommandTrigger;
    if (action === 'start') {
      if (!isStreaming) {
        startWebcam();
      }
      setIsDetecting(true);
      // Start detection loop if it's not already running
      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(detectionLoop);
      }
    } else if (action === 'stop') {
      stopWebcam();
    }
  }, [voiceCommandTrigger, isStreaming, startWebcam, stopWebcam, detectionLoop]);

  const error = webcamError || mediaPipeError || recognitionError;

  return (
    <div className="flex flex-col gap-4">
      {/* Video container */}
      <div
        className={`webcam-glow ${handDetected ? 'active' : ''} relative overflow-hidden rounded-2xl bg-dark-900 border border-dark-700/50 ${
          handDetected ? 'animate-pulse-glow' : ''
        }`}
      >
        {/* Loading overlay while MediaPipe model downloads */}
        {mediaPipeLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-dark-900/90 backdrop-blur-sm rounded-2xl gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-primary-300 font-medium">{statusText}</p>
            <p className="text-xs text-dark-400">Downloading ~6 MB gesture model…</p>
          </div>
        )}

        {/* Hard error — show even before streaming */}
        {mediaPipeError && !mediaPipeLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-dark-900/90 backdrop-blur-sm rounded-2xl p-6">
            <div className="text-center">
              <span className="text-3xl">⚠️</span>
              <p className="text-red-400 font-semibold mt-2 text-sm">{mediaPipeError}</p>
              <button onClick={() => window.location.reload()} className="mt-3 btn-primary text-xs">
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Video + Canvas */}
        <div className="relative" style={{ aspectRatio: '4/3' }}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover rounded-2xl"
            style={{ transform: 'scaleX(-1)' }}
            playsInline
            muted
          />

          {isDetecting && currentLandmarks && (
            <HandLandmarkCanvas
              landmarks={currentLandmarks}
              width={videoDimensions.width}
              height={videoDimensions.height}
            />
          )}

          {/* Hand detected badge */}
          {isDetecting && (
            <div className="absolute top-3 left-3 z-10">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg backdrop-blur-md ${
                handDetected
                  ? 'bg-emerald-500/20 border border-emerald-500/30'
                  : 'bg-dark-800/60 border border-dark-700/50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  handDetected ? 'bg-emerald-400 animate-pulse' : 'bg-dark-500'
                }`} />
                <span className={`text-xs font-medium ${
                  handDetected ? 'text-emerald-300' : 'text-dark-400'
                }`}>
                  {handDetected ? 'Hand Detected' : 'No Hand'}
                </span>
              </div>
            </div>
          )}

          {/* Live gesture label overlay */}
          {isDetecting && currentSign && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <div className="px-4 py-1.5 rounded-full bg-primary-500/30 border border-primary-400/40 backdrop-blur-md">
                <span className="text-sm font-semibold text-primary-200">{currentSign}</span>
              </div>
            </div>
          )}

          {/* Camera off placeholder */}
          {!isStreaming && !mediaPipeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-dark-900 rounded-2xl">
              <span className="text-5xl mb-3">📷</span>
              <p className="text-dark-400 text-sm font-medium">Camera not active</p>
              <button onClick={startWebcam} className="mt-3 btn-primary text-sm">
                Start Camera
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error display */}
      {error && <ErrorBanner message={error} onDismiss={() => setWebcamError(null)} />}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {isStreaming && (
          <>
            <button
              onClick={toggleDetection}
              disabled={!isReady}
              className={isDetecting
                ? 'btn-secondary flex-1 flex items-center justify-center gap-2'
                : 'btn-primary  flex-1 flex items-center justify-center gap-2'}
            >
              {isDetecting ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h6v4H9z" />
                  </svg>
                  Stop Detection
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Start Detection
                </>
              )}
            </button>

            <button
              onClick={stopWebcam}
              className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300"
              aria-label="Stop camera"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.343 17.657l-1.414-1.414A8 8 0 014.929 6.05L6.343 7.464M9.172 14.828L7.757 13.414a5 5 0 010-7.072l1.415 1.414" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
