import React, { useRef, useEffect, useState } from 'react';
import { Layers, Footprints, Flame } from 'lucide-react';

interface HeatPoint {
  x: number;
  y: number;
  intensity: number;
}

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface CourtHeatmapProps {
  heatmapData: HeatPoint[];
  positionTrail: TrailPoint[];
  playerName?: string;
  className?: string;
}

export const CourtHeatmap: React.FC<CourtHeatmapProps> = ({
  heatmapData,
  positionTrail,
  playerName = 'Selected Player',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showTrail, setShowTrail] = useState(true);
  const [intensityMultiplier, setIntensityMultiplier] = useState(1.2);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0a1020';
    ctx.fillRect(0, 0, width, height);

    // Subtle court grid
    ctx.strokeStyle = 'rgba(30, 48, 80, 0.4)';
    ctx.lineWidth = 1;
    const gridSize = 25;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Heatmap
    if (showHeatmap && heatmapData.length > 0) {
      // Offscreen canvas for heat blobs
      const heatCanvas = document.createElement('canvas');
      heatCanvas.width = width;
      heatCanvas.height = height;
      const heatCtx = heatCanvas.getContext('2d')!;

      heatmapData.forEach(pt => {
        const cx = (pt.x / 100) * width;
        const cy = (pt.y / 100) * height;
        const radius = 65;

        const radGrad = heatCtx.createRadialGradient(cx, cy, 5, cx, cy, radius);
        const alpha = Math.min(1, pt.intensity * intensityMultiplier * 0.7);
        radGrad.addColorStop(0, `rgba(255, 0, 0, ${alpha})`);
        radGrad.addColorStop(0.3, `rgba(255, 140, 0, ${alpha * 0.8})`);
        radGrad.addColorStop(0.6, `rgba(255, 230, 0, ${alpha * 0.5})`);
        radGrad.addColorStop(0.85, `rgba(0, 220, 100, ${alpha * 0.25})`);
        radGrad.addColorStop(1, 'rgba(0, 150, 255, 0)');

        heatCtx.fillStyle = radGrad;
        heatCtx.beginPath();
        heatCtx.arc(cx, cy, radius, 0, Math.PI * 2);
        heatCtx.fill();
      });

      // Composite onto main canvas with screen blending
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.drawImage(heatCanvas, 0, 0);
      ctx.restore();
    }

    // Draw Court Lines on top of heatmap
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(15, 15, width - 30, height - 30);

    // Backboard & Hoop
    const hoopX = width / 2;
    const hoopY = 45;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hoopX - 35, 30);
    ctx.lineTo(hoopX + 35, 30);
    ctx.stroke();

    ctx.strokeStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(hoopX, hoopY, 12, 0, Math.PI * 2);
    ctx.stroke();

    // Paint / Key
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.8;
    const paintW = 160;
    const paintH = 190;
    ctx.strokeRect(hoopX - paintW / 2, 15, paintW, paintH);

    // Free Throw Circle
    ctx.beginPath();
    ctx.arc(hoopX, 15 + paintH, 75, 0, Math.PI * 2);
    ctx.stroke();

    // 3-Point Arc
    ctx.beginPath();
    ctx.moveTo(35, 15);
    ctx.lineTo(35, 140);
    ctx.arc(hoopX, hoopY, 230, Math.PI - 0.58, 0.58, true);
    ctx.lineTo(width - 35, 15);
    ctx.stroke();

    // Draw Position Trail Polyline
    if (showTrail && positionTrail.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#0284c7';
      ctx.shadowBlur = 10;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      positionTrail.forEach((pt, idx) => {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Node dots
      positionTrail.forEach((pt, idx) => {
        const px = (pt.x / 100) * width;
        const py = (pt.y / 100) * height;
        ctx.fillStyle = idx === positionTrail.length - 1 ? '#f97316' : '#ffffff';
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }
  }, [heatmapData, positionTrail, showHeatmap, showTrail, intensityMultiplier]);

  return (
    <div className={`flex flex-col rounded-xl glass-card border-slate-800 p-4 ${className}`}>
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>Court Movement Heatmap & Positional Trail</span>
          </h3>
          <p className="text-xs text-slate-400">Thermal density cloud showing tracking presence for {playerName}</p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border ${
              showHeatmap
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Heat Density
          </button>

          <button
            onClick={() => setShowTrail(!showTrail)}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors border ${
              showTrail
                ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            <Footprints className="w-3.5 h-3.5" />
            Position Trail
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative w-full aspect-[50/47] max-h-[460px] my-3 rounded-lg overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={500}
          height={470}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <div className="flex items-center gap-2">
          <span>Density Gradient:</span>
          <div className="flex items-center h-2.5 w-28 rounded-full overflow-hidden bg-gradient-to-r from-sky-500 via-amber-400 to-red-500" />
          <span className="text-[10px] text-slate-500">Low → Peak Intensity</span>
        </div>
        <div className="text-slate-500 text-[11px]">
          Sampled over full video duration
        </div>
      </div>
    </div>
  );
};
