import { useRef, useEffect, useCallback } from 'react';
import { HAND_CONNECTIONS, getLandmarkColor } from '../../utils/landmarkUtils';

export default function HandLandmarkCanvas({ landmarks, width, height }) {
  const canvasRef = useRef(null);

  const drawLandmarks = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    if (!landmarks || landmarks.length === 0) return;

    // Draw connections
    for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
      const start = landmarks[startIdx];
      const end = landmarks[endIdx];
      if (!start || !end) continue;

      // Mirror X coordinates to match mirrored video
      const sx = (1 - start.x) * width;
      const sy = start.y * height;
      const ex = (1 - end.x) * width;
      const ey = end.y * height;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = getLandmarkColor(startIdx);
      ctx.globalAlpha = 0.6;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Draw landmark points
    landmarks.forEach((landmark, index) => {
      const x = (1 - landmark.x) * width;
      const y = landmark.y * height;

      // Outer glow
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = getLandmarkColor(index);
      ctx.globalAlpha = 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Inner point
      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, 2 * Math.PI);
      ctx.fillStyle = getLandmarkColor(index);
      ctx.fill();

      // Bright center
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.8;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }, [landmarks, width, height]);

  useEffect(() => {
    drawLandmarks();
  }, [drawLandmarks]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
    />
  );
}
