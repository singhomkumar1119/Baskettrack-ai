import React, { useState } from 'react';
import { ShotDetail } from '../types/basketball';
import { Compass, MoveUpRight, ArrowDownRight, Target } from 'lucide-react';

interface ShotArcProps {
  shots: ShotDetail[];
  selectedShotId?: string;
  onSelectShot?: (shot: ShotDetail) => void;
  className?: string;
}

export const ShotArcVisualization: React.FC<ShotArcProps> = ({
  shots,
  selectedShotId,
  onSelectShot,
  className = ''
}) => {
  const [activeShotId, setActiveShotId] = useState<string>(selectedShotId || shots[0]?.id || '');
  const activeShot = shots.find(s => s.id === activeShotId) || shots[0];

  if (!activeShot) {
    return <div className="p-4 text-slate-500">No shot data available</div>;
  }

  // Graph dimensions
  // X axis: 0 ft (hoop) to 35 ft (shooter)
  // Y axis: 0 ft (ground) to 18 ft (ceiling)
  const maxDistFt = 32;
  const maxHeightFt = 18;
  const svgWidth = 600;
  const svgHeight = 280;
  const paddingX = 45;
  const paddingY = 30;

  const toSvgX = (distFt: number) => {
    // 0 is hoop at right side (e.g. x = 520), distFt is shooter at left side
    const scale = (svgWidth - paddingX * 2) / maxDistFt;
    return (svgWidth - paddingX) - distFt * scale;
  };

  const toSvgY = (heightFt: number) => {
    const scale = (svgHeight - paddingY * 2) / maxHeightFt;
    return (svgHeight - paddingY) - heightFt * scale;
  };

  // Hoop coordinates
  const hoopX = toSvgX(0);
  const hoopY = toSvgY(10.0); // 10 ft regulation rim height
  const backboardX = hoopX + 12;

  // Shooter release coordinates
  const shooterDist = activeShot.distanceFeet;
  const releaseX = toSvgX(shooterDist);
  const releaseY = toSvgY(activeShot.releaseHeightFeet);

  // Parabolic Apex
  const apexDist = shooterDist * 0.48; // Apex typically slightly past midpoint
  const apexX = toSvgX(apexDist);
  const apexY = toSvgY(activeShot.apexHeightFeet);

  // Parabola curve SVG path: M release Q control hoop
  // Quadratic bezier control point: C = (2 * Apex - 0.5*Release - 0.5*Hoop)
  const controlX = 2 * apexX - 0.5 * releaseX - 0.5 * hoopX;
  const controlY = 2 * apexY - 0.5 * releaseY - 0.5 * hoopY;
  const arcPath = `M ${releaseX} ${releaseY} Q ${controlX} ${controlY} ${hoopX} ${hoopY}`;

  // Benchmark "Optimal NBA Arc"
  const optApexDist = shooterDist * 0.48;
  const optApexX = toSvgX(optApexDist);
  const optApexY = toSvgY(14.8);
  const optControlX = 2 * optApexX - 0.5 * releaseX - 0.5 * hoopX;
  const optControlY = 2 * optApexY - 0.5 * releaseY - 0.5 * hoopY;
  const optimalPath = `M ${releaseX} ${toSvgY(8.8)} Q ${optControlX} ${optControlY} ${hoopX} ${hoopY}`;

  return (
    <div className={`flex flex-col rounded-xl glass-card border-slate-800 p-4 ${className}`}>
      {/* Header & Shot Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" />
            <span>2D Parabolic Trajectory Arc Elevation</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
              activeShot.result === 'make' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
            }`}>
              Shot #{activeShot.shotNumber} ({activeShot.result.toUpperCase()})
            </span>
          </h3>
          <p className="text-xs text-slate-400">Launch elevation angle, peak apex, and entry angle into 10ft rim</p>
        </div>

        {/* Shot button pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {shots.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveShotId(s.id);
                onSelectShot?.(s);
              }}
              className={`px-2.5 py-1 text-xs rounded transition-all flex items-center gap-1 font-mono ${
                activeShot.id === s.id
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30'
                  : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>#{s.shotNumber}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${s.result === 'make' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* SVG Arc Diagram */}
      <div className="relative w-full aspect-[21/9] max-h-[290px] my-3 rounded-lg overflow-hidden bg-[#070d1a] border border-slate-800 flex items-center justify-center">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full select-none">
          {/* Ground floor line */}
          <line x1={paddingX} y1={toSvgY(0)} x2={svgWidth - paddingX + 20} y2={toSvgY(0)} stroke="#334155" strokeWidth="2" />
          <text x={paddingX} y={toSvgY(0) + 16} fill="#64748b" fontSize="9" fontFamily="monospace">FLOOR LEVEL (0 FT)</text>

          {/* Grid Height Lines */}
          {[5, 10, 15].map(h => (
            <g key={h}>
              <line x1={paddingX} y1={toSvgY(h)} x2={svgWidth - paddingX + 20} y2={toSvgY(h)} stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
              <text x={paddingX - 25} y={toSvgY(h) + 3} fill="#475569" fontSize="8" fontFamily="monospace">{h} ft</text>
            </g>
          ))}

          {/* Backboard & Rim */}
          <rect x={backboardX} y={toSvgY(13.5)} width={5} height={toSvgY(10) - toSvgY(13.5) + 15} fill="#f8fafc" />
          {/* Rim support bracket */}
          <line x1={hoopX} y1={hoopY} x2={backboardX} y2={hoopY} stroke="#f97316" strokeWidth="3" />
          {/* Rim circle */}
          <ellipse cx={hoopX} cy={hoopY} rx={12} ry={3} fill="none" stroke="#f97316" strokeWidth="3" />
          <text x={hoopX} y={hoopY - 8} fill="#f97316" fontSize="9" fontWeight="bold" textAnchor="middle">10.0 FT RIM</text>

          {/* Optimal Model Arc Guide (Dashed Cyan) */}
          <path d={optimalPath} fill="none" stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

          {/* Actual Shot Trajectory (Glowing Purple) */}
          <path
            d={arcPath}
            fill="none"
            stroke="#c084fc"
            strokeWidth="3.5"
            className="filter drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]"
          />

          {/* Shooter Release Point Marker */}
          <circle cx={releaseX} cy={releaseY} r="5" fill="#f97316" stroke="#ffffff" strokeWidth="2" />
          <text x={releaseX} y={releaseY - 12} fill="#f97316" fontSize="9" fontWeight="bold" textAnchor="middle">
            Release: {activeShot.releaseHeightFeet} ft
          </text>
          <line x1={releaseX} y1={releaseY} x2={releaseX} y2={toSvgY(0)} stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
          <text x={releaseX} y={toSvgY(0) + 16} fill="#f97316" fontSize="8" textAnchor="middle" fontFamily="monospace">
            {activeShot.distanceFeet} ft
          </text>

          {/* Apex Peak Marker */}
          <circle cx={apexX} cy={apexY} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
          <text x={apexX} y={apexY - 10} fill="#d8b4fe" fontSize="9" fontWeight="bold" textAnchor="middle">
            Apex: {activeShot.apexHeightFeet} ft
          </text>
          <line x1={apexX} y1={apexY} x2={apexX} y2={toSvgY(0)} stroke="#a855f7" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />

          {/* Entry Point Indicator */}
          <circle cx={hoopX} cy={hoopY} r="4" fill={activeShot.result === 'make' ? '#22c55e' : '#ef4444'} />

          {/* Launch Angle Vector Label */}
          <g transform={`translate(${releaseX + 15}, ${releaseY - 18})`}>
            <rect x="0" y="0" width="62" height="18" rx="3" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1" />
            <text x="31" y="12" fill="#c7d2fe" fontSize="9" fontWeight="bold" textAnchor="middle">
              {activeShot.releaseAngleDeg}° Launch
            </text>
          </g>

          {/* Entry Angle Vector Label */}
          <g transform={`translate(${hoopX - 85}, ${hoopY - 32})`}>
            <rect x="0" y="0" width="65" height="18" rx="3" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1" />
            <text x="32" y="12" fill="#e9d5ff" fontSize="9" fontWeight="bold" textAnchor="middle">
              {activeShot.entryAngleDeg}° Entry
            </text>
          </g>
        </svg>
      </div>

      {/* Trajectory Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 text-[11px]">
            <MoveUpRight className="w-3.5 h-3.5 text-orange-400" />
            Launch Angle
          </div>
          <div className="text-base font-bold text-slate-100 mt-0.5">
            {activeShot.releaseAngleDeg}°
          </div>
          <div className="text-[10px] text-emerald-400">Target: 48° - 52°</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 text-[11px]">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            Apex Height
          </div>
          <div className="text-base font-bold text-slate-100 mt-0.5">
            {activeShot.apexHeightFeet} ft
          </div>
          <div className="text-[10px] text-purple-300">Target: 14.0 - 15.5 ft</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 flex items-center gap-1 text-[11px]">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
            Rim Entry Angle
          </div>
          <div className="text-base font-bold text-slate-100 mt-0.5">
            {activeShot.entryAngleDeg}°
          </div>
          <div className="text-[10px] text-slate-400">Clearance Index: High</div>
        </div>

        <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
          <div className="text-slate-400 text-[11px]">Shot Flight Time</div>
          <div className="text-base font-bold text-slate-100 mt-0.5 font-mono">
            {activeShot.flightTimeSec}s
          </div>
          <div className="text-[10px] text-slate-400">Speed: {activeShot.shotSpeedMph} mph</div>
        </div>
      </div>
    </div>
  );
};
