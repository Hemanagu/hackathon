import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState, useCallback } from 'react';

// Pin WASM URL to the exact installed package version (0.10.35)
const WASM_URL =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export default function useMediaPipe() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const [isReady, setIsReady]     = useState(false);
  const [statusText, setStatusText] = useState('Initializing…');
  const recognizerRef             = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Try GPU first, fall back to CPU if it fails
      for (const delegate of ['GPU', 'CPU']) {
        if (cancelled) return;
        try {
          setStatusText(`Loading model (${delegate})…`);
          console.log(`[MediaPipe] Attempting init with delegate: ${delegate}`);

          const vision = await FilesetResolver.forVisionTasks(WASM_URL);
          console.log('[MediaPipe] WASM resolved');

          const recognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: MODEL_URL,
              delegate,
            },
            runningMode: 'VIDEO',
            numHands: 1,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence:  0.5,
            minTrackingConfidence:      0.5,
          });

          console.log(`[MediaPipe] GestureRecognizer ready (delegate: ${delegate})`);

          if (!cancelled) {
            recognizerRef.current = recognizer;
            setIsReady(true);
            setIsLoading(false);
            setError(null);
            setStatusText('Ready');
          }
          return; // success — stop trying
        } catch (err) {
          console.warn(`[MediaPipe] Failed with delegate ${delegate}:`, err);
          if (delegate === 'CPU') {
            // Both delegates failed
            if (!cancelled) {
              const msg =
                'Could not load the gesture recognition model. ' +
                'Check your internet connection and try refreshing.';
              setError(msg);
              setIsLoading(false);
              setStatusText('Failed');
            }
          }
          // else loop and try CPU
        }
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

  /**
   * Run gesture recognition on one video frame.
   * @returns GestureRecognizerResult | null
   */
  const detectGestures = useCallback((videoEl, timestamp) => {
    if (!recognizerRef.current || !videoEl) return null;
    try {
      // GestureRecognizer uses recognizeForVideo() — not detectForVideo() (that's HandLandmarker)
      return recognizerRef.current.recognizeForVideo(videoEl, timestamp);
    } catch (err) {
      console.error('[MediaPipe] recognizeForVideo error:', err);
      return null;
    }
  }, []);

  return { detectGestures, isLoading, error, isReady, statusText };
}
