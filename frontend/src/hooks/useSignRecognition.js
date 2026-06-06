import { useState, useCallback, useRef } from 'react';
import { recognizeGesture } from '../services/api';

/**
 * Maps MediaPipe GestureRecognizer category names → our display sign names.
 *
 * MediaPipe built-in gesture categories:
 *   None | Closed_Fist | Open_Palm | Pointing_Up | Thumb_Down | Thumb_Up | Victory | ILoveYou
 */
const GESTURE_TO_SIGN = {
  Open_Palm:    'Hello',     // Open waving palm → Hello
  Closed_Fist:  'Yes',       // Closed fist (ASL nod) → Yes
  Victory:      'No',        // Two-finger V → No
  Thumb_Up:     'Good',      // Thumbs up → Good
  Thumb_Down:   'Bad',       // Thumbs down → Bad
  Pointing_Up:  'Stop',      // Flat pointing palm → Stop
  ILoveYou:     'Help',      // ILY hand shape → Help
  None:         null,
};

/**
 * Additional signs detected via landmark geometry when MediaPipe
 * doesn't have a dedicated gesture class for them.
 *
 * Thank You : flat palm, fingertips near top of frame (y < 0.35)
 * Water     : 3 middle fingers extended (index+middle+ring), thumb+pinky curled
 * Food      : all 5 fingertips clustered tightly together (pinch)
 */
function detectExtraSign(landmarks) {
  if (!landmarks || landmarks.length < 21) return null;

  // Helper: is finger tip above its pip (extended)?
  const isExtended = (tipIdx, pipIdx) => landmarks[tipIdx].y < landmarks[pipIdx].y;
  const dist = (a, b) =>
    Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

  const thumbExt  = landmarks[4].y  < landmarks[3].y;
  const indexExt  = isExtended(8,  6);
  const middleExt = isExtended(12, 10);
  const ringExt   = isExtended(16, 14);
  const pinkyExt  = isExtended(20, 18);

  // --- Food: all fingertips clustered (max spread < threshold) ---
  const tips = [4, 8, 12, 16, 20].map(i => landmarks[i]);
  const avgX = tips.reduce((s, p) => s + p.x, 0) / tips.length;
  const avgY = tips.reduce((s, p) => s + p.y, 0) / tips.length;
  const maxSpread = Math.max(
    ...tips.map(p => dist(p, { x: avgX, y: avgY }))
  );
  if (maxSpread < 0.07) return 'Food';

  // --- Water: index + middle + ring extended, thumb + pinky curled ---
  if (!thumbExt && indexExt && middleExt && ringExt && !pinkyExt) return 'Water';

  // --- Thank You: open palm with hand near upper half of frame ---
  if (thumbExt && indexExt && middleExt && ringExt && pinkyExt) {
    const palmY = landmarks[0].y; // wrist y
    if (palmY < 0.45) return 'Thank You';
  }

  return null;
}

export default function useSignRecognition() {
  const [currentSign, setCurrentSign] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [allScores, setAllScores] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Debounce: only update if sign is stable for 2 consecutive detections
  const lastRawSignRef = useRef(null);
  const stableCountRef = useRef(0);
  const STABLE_THRESHOLD = 2;

  /**
   * Called every animation frame with the GestureRecognizer result.
   * gesture = { categoryName: string, score: number } | null
   * landmarks = array of 21 {x,y,z} | null
   */
  const processGesture = useCallback(async (gesture, landmarks) => {
    // 1. Determine raw sign from gesture category
    let rawSign = null;
    let rawScore = 0;

    if (gesture && gesture.categoryName && gesture.categoryName !== 'None') {
      rawSign = GESTURE_TO_SIGN[gesture.categoryName] ?? null;
      rawScore = gesture.score ?? 0;
    }

    // 2. Override with landmark-based detection for unmapped signs
    if (!rawSign && landmarks) {
      const extraSign = detectExtraSign(landmarks);
      if (extraSign) {
        rawSign = extraSign;
        rawScore = 0.80; // fixed confidence for rule-based
      }
    }

    // 3. Stability debounce — only commit after 2 identical detections
    if (rawSign === lastRawSignRef.current) {
      stableCountRef.current += 1;
    } else {
      lastRawSignRef.current = rawSign;
      stableCountRef.current = 1;
    }

    if (stableCountRef.current < STABLE_THRESHOLD) return;

    // 4. Build allScores from MediaPipe's full gesture list
    const scores = {};
    Object.values(GESTURE_TO_SIGN).filter(Boolean).forEach(sign => {
      scores[sign] = 0;
    });
    ['Thank You', 'Water', 'Food'].forEach(s => (scores[s] = 0));
    if (rawSign) scores[rawSign] = rawScore;

    setCurrentSign(rawSign);
    setConfidence(rawScore);
    setAllScores(scores);
    setError(null);

    // 5. Optionally log to backend (fire-and-forget, non-blocking)
    if (rawSign) {
      recognizeGesture(rawSign, rawScore).catch(() => {});
    }
  }, []);

  const resetRecognition = useCallback(() => {
    setCurrentSign(null);
    setConfidence(0);
    setAllScores({});
    setError(null);
    lastRawSignRef.current = null;
    stableCountRef.current = 0;
  }, []);

  return {
    currentSign,
    confidence,
    allScores,
    isProcessing,
    error,
    processGesture,
    resetRecognition,
  };
}
