import React, { useState } from 'react';
import { BiomechanicsMetrics } from '../types/basketball';
import { Activity, CheckCircle2, AlertTriangle, HelpCircle, ArrowUp } from 'lucide-react';
import { MetricBadge } from './MetricBadge';

interface BiomechanicsViewerProps {
  biomechanics: BiomechanicsMetrics;
  jumpHeightInches?: number;
  className?: string;
}

export const BiomechanicsViewer: React.FC<BiomechanicsViewerProps> = ({
  biomechanics,
  jumpHeightInches = 19.1,
  className = ''
}) => {
  const [activeJoint, setActiveJoint] = useState<'elbow' | 'knee' | 'shoulder' | 'wrist'>('elbow');

  const jointDetails = {
    elbow: {
      name: 'Set-Point Elbow Angle',
      value: `${biomechanics.elbowAngleAvgDeg}°`,
      optimal: '88° - 92°',
      status: Math.abs(biomechanics.elbowAngleAvgDeg - 90) <= 4 ? 'Optimal (L-Shaped)' : 'Needs Adjustment',
      description: 'The angle between upper arm and forearm at upward gather. A 90° tuck delivers consistent vertical release trajectory without sideways flair.'
    },
    knee: {
      name: 'Knee Dip Angle',
      value: `${biomechanics.kneeBendAvgDeg}°`,
      optimal: '110° - 118°',
      status: biomechanics.kneeBendAvgDeg >= 110 && biomechanics.kneeBendAvgDeg <= 120 ? 'Optimal Kinetic Power' : 'Limited Dip',
      description: 'The knee flexion angle during shot gather. Proper flexion transfers ground reaction force through the kinetic chain into the ball.'
    },
    shoulder: {
      name: 'Shoulder Alignment Tilt',
      value: `${biomechanics.shoulderTiltAvgDeg}°`,
      optimal: '< 3.0° Tilt',
      status: biomechanics.shoulderTiltAvgDeg < 3.0 ? 'Level & Square' : 'Excessive Tilt',
      description: 'Lateral shoulder tilt relative to the basket plane. Level shoulders maintain symmetric kinetic lift and prevent left/right ball drift.'
    },
    wrist: {
      name: 'Wrist Snap Extension',
      value: `${biomechanics.wristAngleAvgDeg}°`,
      optimal: '75° - 85°',
      status: 'Optimal Backspin Generation',
      description: 'Wrist cock and forward follow-through snap imparting rotational backspin (3-4 Hz) for soft touch on the rim.'
    }
  };

  const selectedJointData = jointDetails[activeJoint];

  return (
    <div className={`flex flex-col rounded-xl glass-card border-slate-800 p-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            <span>Biomechanical Kinematics & Kinetic Chain</span>
            <MetricBadge status="measured" confidence={96.4} />
          </h3>
          <p className="text-xs text-slate-400">Computer vision joint-angle analysis during shooting motion</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs flex items-center gap-1.5 font-bold">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Max Jump: {jumpHeightInches} in ({Math.round(jumpHeightInches * 2.54)} cm)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 my-3">
        {/* Left column: 2D Interactive Biomechanical Skeleton */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-[#090e1c] border border-slate-800 relative">
          <div className="text-[11px] text-slate-400 absolute top-2 left-3 font-mono">
            JOINT ANGLE KINEMATICS
          </div>

          <svg viewBox="0 0 240 320" className="w-full max-w-[220px] h-[280px]">
            {/* Background glowing rings */}
            <circle cx="120" cy="50" r="16" fill="rgba(249, 115, 22, 0.15)" stroke="#f97316" strokeWidth="2" />
            <text x="120" y="55" fill="#f97316" fontSize="10" textAnchor="middle" fontWeight="bold">HEAD</text>

            {/* Spine */}
            <line x1="120" y1="66" x2="120" y2="150" stroke="#475569" strokeWidth="4" />

            {/* Shoulders */}
            <line x1="85" y1="90" x2="155" y2="90" stroke="#38bdf8" strokeWidth="3" />
            <circle
              cx="155"
              cy="90"
              r={activeJoint === 'shoulder' ? 7 : 5}
              fill={activeJoint === 'shoulder' ? '#f97316' : '#38bdf8'}
              className="cursor-pointer"
              onClick={() => setActiveJoint('shoulder')}
            />

            {/* Left Arm (Guide Hand) */}
            <line x1="85" y1="90" x2="65" y2="135" stroke="#64748b" strokeWidth="2.5" />
            <line x1="65" y1="135" x2="60" y2="180" stroke="#64748b" strokeWidth="2.5" />

            {/* Right Arm (Shooting Arm with Elbow Set Point) */}
            <line x1="155" y1="90" x2="180" y2="115" stroke="#a855f7" strokeWidth="3.5" />
            {/* Elbow Node */}
            <circle
              cx="180"
              cy="115"
              r={activeJoint === 'elbow' ? 9 : 6}
              fill={activeJoint === 'elbow' ? '#f97316' : '#a855f7'}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() => setActiveJoint('elbow')}
            />
            {/* Forearm to wrist */}
            <line x1="180" y1="115" x2="182" y2="60" stroke="#a855f7" strokeWidth="3.5" />
            {/* Wrist Node */}
            <circle
              cx="182"
              cy="60"
              r={activeJoint === 'wrist' ? 8 : 5}
              fill={activeJoint === 'wrist' ? '#f97316' : '#22c55e'}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() => setActiveJoint('wrist')}
            />
            {/* Ball at release */}
            <circle cx="188" cy="40" r="14" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
            <text x="188" y="44" fill="#ffffff" fontSize="8" textAnchor="middle" fontWeight="bold">BALL</text>

            {/* Elbow Angle Arc Indicator */}
            <path d="M 168 115 A 16 16 0 0 1 180 102" fill="none" stroke="#f97316" strokeWidth="2" />
            <text x="200" y="118" fill="#f97316" fontSize="10" fontWeight="bold" fontFamily="monospace">
              {biomechanics.elbowAngleAvgDeg}°
            </text>

            {/* Hips */}
            <line x1="95" y1="150" x2="145" y2="150" stroke="#38bdf8" strokeWidth="3" />

            {/* Legs (Knee Bend) */}
            {/* Left Leg */}
            <line x1="100" y1="150" x2="90" y2="215" stroke="#38bdf8" strokeWidth="3" />
            <line x1="90" y1="215" x2="95" y2="290" stroke="#38bdf8" strokeWidth="3" />

            {/* Right Leg with Knee Dip Node */}
            <line x1="140" y1="150" x2="150" y2="215" stroke="#38bdf8" strokeWidth="3" />
            <circle
              cx="150"
              cy="215"
              r={activeJoint === 'knee' ? 9 : 6}
              fill={activeJoint === 'knee' ? '#f97316' : '#38bdf8'}
              stroke="#ffffff"
              strokeWidth="2"
              className="cursor-pointer"
              onClick={() => setActiveJoint('knee')}
            />
            <line x1="150" y1="215" x2="145" y2="290" stroke="#38bdf8" strokeWidth="3" />

            {/* Knee Angle Arc */}
            <path d="M 144 205 A 14 14 0 0 1 147 225" fill="none" stroke="#f97316" strokeWidth="2" />
            <text x="168" y="222" fill="#f97316" fontSize="10" fontWeight="bold" fontFamily="monospace">
              {biomechanics.kneeBendAvgDeg}°
            </text>

            {/* Ground line */}
            <line x1="70" y1="295" x2="170" y2="295" stroke="#64748b" strokeWidth="2" />
          </svg>

          {/* Interactive Joint Selector Buttons */}
          <div className="flex items-center gap-1.5 mt-1">
            {(['elbow', 'knee', 'shoulder', 'wrist'] as const).map(j => (
              <button
                key={j}
                onClick={() => setActiveJoint(j)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition-colors ${
                  activeJoint === j
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {j}
              </button>
            ))}
          </div>
        </div>

        {/* Right column: Selected Joint Metrics & Coaching Feedback */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-3">
          {/* Joint Detail Card */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">
                  Inspected Joint
                </span>
                <h4 className="text-base font-bold text-slate-100">{selectedJointData.name}</h4>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-slate-100 font-mono">
                  {selectedJointData.value}
                </span>
                <div className="text-[10px] text-emerald-400 font-medium">
                  {selectedJointData.status}
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
              {selectedJointData.description}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Benchmark Window:</span>
              <span className="text-slate-200 font-mono font-semibold">{selectedJointData.optimal}</span>
            </div>
          </div>

          {/* Kinetic Chain Timeline Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Catch-to-Release</div>
              <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                {biomechanics.catchToReleaseAvgSec}s
              </div>
              <div className="text-[9px] text-emerald-400">Quick Release</div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Body Balance</div>
              <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                {biomechanics.bodyBalanceRating}/100
              </div>
              <div className="text-[9px] text-emerald-400">Exceptional</div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Symmetry Index</div>
              <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                {biomechanics.movementSymmetryPct}%
              </div>
              <div className="text-[9px] text-emerald-400">Square Plant</div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] text-slate-400">Hip Extension</div>
              <div className="text-sm font-bold text-slate-100 font-mono mt-0.5">
                {biomechanics.hipAngleAvgDeg}°
              </div>
              <div className="text-[9px] text-slate-300">Fluid Dip</div>
            </div>
          </div>

          {/* Coaching Cards */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Targeted Form Feedback:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {biomechanics.coachingFeedback.slice(0, 2).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-orange-400 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
