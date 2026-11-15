import React, { useRef, useEffect } from 'react';

interface BlinkCanvasProps {
  imageSrc: string;
  activeFilename: string;
  investigationMarker: { x: number; y: number } | null;
  onCanvasClick: (normX: number, normY: number) => void;
}

export const BlinkCanvas: React.FC<BlinkCanvasProps> = ({
  imageSrc,
  activeFilename,
  investigationMarker,
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const normX = Math.max(0, Math.min(1, clickX / rect.width));
    const normY = Math.max(0, Math.min(1, clickY / rect.height));
    onCanvasClick(normX, normY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clean, un-inverted FITS image pixels
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Only draw marker if the user has explicitly clicked to investigate
      if (investigationMarker) {
        const mx = investigationMarker.x * canvas.width;
        const my = investigationMarker.y * canvas.height;

        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mx, my, 12, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(mx - 16, my); ctx.lineTo(mx + 16, my);
        ctx.moveTo(mx, my - 16); ctx.lineTo(mx, my + 16);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText('CANDIDATE', mx + 14, my - 6);
      }
    };
  }, [imageSrc, investigationMarker]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      aspectRatio: '1/1',
      maxHeight: '480px',
      backgroundColor: '#000',
      borderRadius: '8px',
      border: '1px solid #1e293b',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
      cursor: 'crosshair',
    }}>
      <canvas
        ref={canvasRef}
        width={480}
        height={480}
        onClick={handleClick}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
      />

      {/* Clean, Non-intrusive File Header */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(5, 8, 17, 0.85)',
        backdropFilter: 'blur(6px)',
        padding: '5px 10px',
        borderRadius: '4px',
        border: '1px solid #1e293b',
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#94a3b8',
        pointerEvents: 'none',
      }}>
        <span>FITS: </span>
        <strong style={{ color: '#fff' }}>{activeFilename ? activeFilename.replace('_cutout.fits', '') : 'Raw Cutout Stream'}</strong>
      </div>

      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'rgba(5, 8, 17, 0.85)',
        backdropFilter: 'blur(6px)',
        padding: '4px 8px',
        borderRadius: '4px',
        border: '1px solid #1e293b',
        fontSize: '10px',
        fontFamily: 'monospace',
        color: '#38bdf8',
        pointerEvents: 'none',
      }}>
        ● RAW FITS PIXELS
      </div>

      {/* Click Guidance Prompt */}
      {!investigationMarker && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(5, 8, 17, 0.75)',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '10px',
          fontFamily: 'monospace',
          color: '#64748b',
          pointerEvents: 'none',
        }}>
          Click any source on the image to measure astrometry
        </div>
      )}
    </div>
  );
};
