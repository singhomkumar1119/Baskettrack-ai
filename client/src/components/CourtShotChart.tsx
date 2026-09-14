import React, { useState } from 'react';
import { ShotDetail } from '../types/basketball';
import { CheckCircle2, XCircle, Info, Filter } from 'lucide-react';

interface CourtShotChartProps {
  shots: ShotDetail[];
  selectedShotId?: string;
  onSelectShot?: (shot: ShotDetail) => void;
  className?: string;
}

export const CourtShotChart: React.FC<CourtShotChartProps> = ({
  shots,
  selectedShotId,
  onSelectShot,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'make' | 'miss'>('all');
  const [hoveredShot, setHoveredShot] = useState<ShotDetail | null>(null);

  const filteredShots = shots.filter(s => {
    if (filter === 'make') return s.result === 'make';
    if (filter === 'miss') return s.result === 'miss';
    return true;
  });

  const makesCount = shots.filter(s => s.result === 'make').length;
  const totalCount = shots.length;
  const fgPct = totalCount > 0 ? Math.round((makesCount / totalCount) * 100) : 0;

  return (
    <div className={`flex flex-col rounded-xl glass-card border-slate-800 p-4 ${className}`}>
      {/* Header with quick stats & filter controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Half-Court Shot Distribution</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 font-mono">
              {makesCount}/{totalCount} ({fgPct}%)
            </span>
          </h3>
          <p className="text-xs text-slate-400">Click any shot point to review video moment & release biomechanics</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded transition-colors ${
              filter === 'all' ? 'bg-orange-500 text-white font-medium shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('make')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              filter === 'make' ? 'bg-emerald-600 text-white font-medium shadow-sm' : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Makes ({makesCount})
          </button>
          <button
            onClick={() => setFilter('miss')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
              filter === 'miss' ? 'bg-rose-600 text-white font-medium shadow-sm' : 'text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            Misses ({totalCount - makesCount})
          </button>
        </div>
      </div>

      {/* Interactive Court SVG */}
      <div className="relative w-full aspect-[50/47] max-h-[460px] my-3 rounded-lg overflow-hidden bg-[#0a1020] border border-slate-800 shadow-inner flex items-center justify-center">
        <svg
          viewBox="0 0 500 470"
          className="w-full h-full select-none"
          style={{ background: 'radial-gradient(circle at 50% 15%, #131d35 0%, #0a1020 100%)' }}
        >
          {/* Court Perimeter */}
          <rect x="10" y="10" width="480" height="450" fill="none" stroke="#253555" strokeWidth="2.5" />

          {/* Half court line */}
          <line x1="10" y1="460" x2="490" y2="460" stroke="#253555" strokeWidth="2.5" />
          {/* Center jump circle */}
          <path d="M 190 460 A 60 60 0 0 1 310 460" fill="none" stroke="#253555" strokeWidth="2" strokeDasharray="6 4" />

          {/* Backboard */}
          <line x1="220" y1="40" x2="280" y2="40" stroke="#f8fafc" strokeWidth="4" />
          {/* Hoop Rim */}
          <circle cx="250" cy="52" r="12" fill="none" stroke="#f97316" strokeWidth="2.5" />
          {/* Net simulation */}
          <circle cx="250" cy="52" r="5" fill="#f97316" fillOpacity="0.25" />

          {/* Restricted Area Arc */}
          <path d="M 210 40 A 40 40 0 0 0 290 40" fill="none" stroke="#253555" strokeWidth="1.5" />

          {/* The Paint (Key) */}
          <rect x="170" y="10" width="160" height="190" fill="rgba(30, 48, 80, 0.25)" stroke="#253555" strokeWidth="2" />
          {/* Free throw circle */}
          <path d="M 170 200 A 80 80 0 0 0 330 200" fill="none" stroke="#253555" strokeWidth="2" />
          <path d="M 170 200 A 80 80 0 0 1 330 200" fill="none" stroke="#253555" strokeWidth="1.5" strokeDasharray="5 5" />

          {/* 3-Point Line */}
          {/* Straight corners */}
          <line x1="40" y1="10" x2="40" y2="140" stroke="#2b3f66" strokeWidth="2.5" />
          <line x1="460" y1="10" x2="460" y2="140" stroke="#2b3f66" strokeWidth="2.5" />
          {/* Main 3pt Arc (Radius ~ 237.5 from hoop center: cx=250, cy=52) */}
          <path
            d="M 40 140 A 237.5 237.5 0 0 0 460 140"
            fill="none"
            stroke="#2b3f66"
            strokeWidth="2.5"
          />

          {/* Distance Rings Labels */}
          <text x="250" y="215" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">15 FT (FREE THROW)</text>
          <text x="250" y="305" fill="#475569" fontSize="10" textAnchor="middle" fontFamily="monospace">23.75 FT (3-POINT ARC)</text>
          <text x="250" y="410" fill="#334155" fontSize="10" textAnchor="middle" fontFamily="monospace">DEEP RANGE (30+ FT)</text>

          {/* Render Shots */}
          {filteredShots.map((shot) => {
            // Convert courtX (0-100) and courtY (0-100) to SVG coords (0-500, 0-470)
            const sx = (shot.courtX / 100) * 500;
            const sy = (shot.courtY / 100) * 470;
            const isSelected = selectedShotId === shot.id;
            const isMake = shot.result === 'make';

            return (
              <g
                key={shot.id}
                className="cursor-pointer transition-transform hover:scale-125"
                onMouseEnter={() => setHoveredShot(shot)}
                onMouseLeave={() => setHoveredShot(null)}
                onClick={() => onSelectShot?.(shot)}
              >
                {/* Glow ring if selected */}
                {isSelected && (
                  <circle
                    cx={sx}
                    cy={sy}
                    r="18"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2.5"
                    className="animate-ping"
                    opacity="0.75"
                  />
                )}

                {isMake ? (
                  // Make marker: green glowing disc
                  <>
                    <circle
                      cx={sx}
                      cy={sy}
                      r={isSelected ? 10 : 8}
                      fill="#22c55e"
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                      className="filter drop-shadow-md"
                    />
                    <text
                      x={sx}
                      y={sy + 3}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {shot.shotNumber}
                    </text>
                  </>
                ) : (
                  // Miss marker: red X
                  <>
                    <circle
                      cx={sx}
                      cy={sy}
                      r={isSelected ? 10 : 8}
                      fill="#ef4444"
                      stroke="#ffffff"
                      strokeWidth={isSelected ? 2.5 : 1.5}
                    />
                    <line
                      x1={sx - 3.5}
                      y1={sy - 3.5}
                      x2={sx + 3.5}
                      y2={sy + 3.5}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <line
                      x1={sx + 3.5}
                      y1={sy - 3.5}
                      x2={sx - 3.5}
                      y2={sy + 3.5}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip for Hovered Shot */}
        {hoveredShot && (
          <div className="absolute top-4 right-4 p-3 rounded-lg glass-card border-slate-700 bg-slate-900/90 shadow-xl pointer-events-none text-xs space-y-1 z-20 min-w-[190px]">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
              <span className="font-bold text-slate-100">Shot #{hoveredShot.shotNumber}</span>
              <span
                className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded ${
                  hoveredShot.result === 'make'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {hoveredShot.result.toUpperCase()} {hoveredShot.isSwish ? '(SWISH)' : ''}
              </span>
            </div>
            <div className="text-slate-300 flex justify-between">
              <span>Distance:</span>
              <strong className="text-slate-100">{hoveredShot.distanceFeet} ft</strong>
            </div>
            <div className="text-slate-300 flex justify-between">
              <span>Release Angle:</span>
              <strong className="text-orange-400">{hoveredShot.releaseAngleDeg}°</strong>
            </div>
            <div className="text-slate-300 flex justify-between">
              <span>Apex Height:</span>
              <strong className="text-purple-400">{hoveredShot.apexHeightFeet} ft</strong>
            </div>
            <div className="text-slate-300 flex justify-between">
              <span>Form Score:</span>
              <strong className="text-emerald-400">{hoveredShot.formScore}/100</strong>
            </div>
            <div className="text-[10px] text-slate-400 pt-1 text-right">
              Timestamp: {hoveredShot.timestamp}s
            </div>
          </div>
        )}
      </div>

      {/* Legend footer */}
      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
            Made Shot
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 flex items-center justify-center text-white text-[9px] font-bold">×</span>
            Missed Shot
          </span>
          <span className="flex items-center gap-1.5 text-purple-400">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span>
            Swish (Clean)
          </span>
        </div>
        <div className="text-slate-500 text-[11px] flex items-center gap-1">
          <Info className="w-3 h-3" />
          NBA Standard 50′ × 47′ Half-Court Homography
        </div>
      </div>
    </div>
  );
};
