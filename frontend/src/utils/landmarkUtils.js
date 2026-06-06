// MediaPipe Hand Landmark connections
// Each pair [start, end] defines a line segment between two landmark indices
export const HAND_CONNECTIONS = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
];

// Landmark indices for reference
export const LANDMARK_NAMES = {
  0: 'WRIST',
  1: 'THUMB_CMC',
  2: 'THUMB_MCP',
  3: 'THUMB_IP',
  4: 'THUMB_TIP',
  5: 'INDEX_FINGER_MCP',
  6: 'INDEX_FINGER_PIP',
  7: 'INDEX_FINGER_DIP',
  8: 'INDEX_FINGER_TIP',
  9: 'MIDDLE_FINGER_MCP',
  10: 'MIDDLE_FINGER_PIP',
  11: 'MIDDLE_FINGER_DIP',
  12: 'MIDDLE_FINGER_TIP',
  13: 'RING_FINGER_MCP',
  14: 'RING_FINGER_PIP',
  15: 'RING_FINGER_DIP',
  16: 'RING_FINGER_TIP',
  17: 'PINKY_MCP',
  18: 'PINKY_PIP',
  19: 'PINKY_DIP',
  20: 'PINKY_TIP',
};

// Color map for different finger groups
export const FINGER_COLORS = {
  thumb: '#22d3ee',    // primary-400
  index: '#06b6d4',    // primary-500
  middle: '#8b5cf6',   // accent-500
  ring: '#a78bfa',     // accent-400
  pinky: '#67e8f9',    // primary-300
  palm: '#0891b2',     // primary-600
};

export function getLandmarkColor(index) {
  if (index <= 4) return FINGER_COLORS.thumb;
  if (index <= 8) return FINGER_COLORS.index;
  if (index <= 12) return FINGER_COLORS.middle;
  if (index <= 16) return FINGER_COLORS.ring;
  if (index <= 20) return FINGER_COLORS.pinky;
  return FINGER_COLORS.palm;
}

export function getConnectionColor(startIdx) {
  if (startIdx <= 4) return FINGER_COLORS.thumb;
  if (startIdx <= 8) return FINGER_COLORS.index;
  if (startIdx <= 12) return FINGER_COLORS.middle;
  if (startIdx <= 16) return FINGER_COLORS.ring;
  if (startIdx <= 20) return FINGER_COLORS.pinky;
  return FINGER_COLORS.palm;
}
