import React, { useState } from 'react';
import { GitCompare, ArrowRight, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { AnalysisRecord } from '../types/basketball';
import { CourtShotChart } from '../components/CourtShotChart';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

interface PlayerComparisonPageProps {
  analyses: AnalysisRecord[];
}

export const PlayerComparisonPage: React.FC<PlayerComparisonPageProps> = ({ analyses }) => {
  const [sessionAId, setSessionAId] = useState<string>(analyses[0]?.id || '');
  const [sessionBId, setSessionBId] = useState<string>(analyses[1]?.id || analyses[0]?.id || '');

  const sessionA = analyses.find(a => a.id === sessionAId) || analyses[0];
  const sessionB = analyses.find(a => a.id === sessionBId) || analyses[1] || analyses[0];

  const primaryA = sessionA?.players[0];
  const primaryB = sessionB?.players[0];

  const renderDelta = (valA: number, valB: number, unit = '', higherIsBetter = true) => {
    const diff = parseFloat((valA - valB).toFixed(1));
    if (diff === 0) {
      return <span className="text-slate-400 flex items-center gap-0.5 text-[10px] font-mono"><Minus className="w-3 h-3" /> 0{unit}</span>;
    }
    const isGood = higherIsBetter ? diff > 0 : diff < 0;
    return (
      <span className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${isGood ? 'text-emerald-400' : 'text-rose-400'}`}>
        {diff > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {diff > 0 ? `+${diff}` : diff}{unit}
      </span>
    );
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
            Comparative Telemetry
          </span>
          <span className="text-xs text-slate-400">Head-to-Head & Progression Tracking</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Player & Session Comparison
        </h1>
        <p className="text-xs text-slate-400">
          Compare shot accuracy, sprint speeds, joint flexion angles, and workload intensity side by side.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session A */}
        <div className="p-4 rounded-xl glass-card border-orange-500/30 bg-slate-900/80 space-y-2">
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
            Subject A (Baseline)
          </span>
          <select
            value={sessionAId}
            onChange={(e) => setSessionAId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
          >
            {analyses.map(a => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.players[0]?.name || 'Player'})
              </option>
            ))}
          </select>
        </div>

        {/* Session B */}
        <div className="p-4 rounded-xl glass-card border-sky-500/30 bg-slate-900/80 space-y-2">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">
            Subject B (Comparison Target)
          </span>
          <select
            value={sessionBId}
            onChange={(e) => setSessionBId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-sky-500 focus:outline-none"
          >
            {analyses.map(a => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.players[0]?.name || 'Player'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Shooting % */}
        <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Field Goal %</span>
            {renderDelta(sessionA.shooting.shootingPercentage, sessionB.shooting.shootingPercentage, '%')}
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-orange-400 font-mono">
              {sessionA.shooting.shootingPercentage}%
            </span>
            <span className="text-sm text-slate-500 font-mono">vs</span>
            <span className="text-2xl font-black text-sky-400 font-mono">
              {sessionB.shooting.shootingPercentage}%
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>{sessionA.shooting.madeShots}/{sessionA.shooting.numShots} Made</span>
            <span>{sessionB.shooting.madeShots}/{sessionB.shooting.numShots} Made</span>
          </div>
        </div>

        {/* Metric 2: Max Speed */}
        <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Max Velocity</span>
            {renderDelta(primaryA?.maxSpeedMph || 0, primaryB?.maxSpeedMph || 0, ' mph')}
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-orange-400 font-mono">
              {primaryA?.maxSpeedMph} <span className="text-xs font-normal text-slate-400">mph</span>
            </span>
            <span className="text-sm text-slate-500 font-mono">vs</span>
            <span className="text-2xl font-black text-sky-400 font-mono">
              {primaryB?.maxSpeedMph} <span className="text-xs font-normal text-slate-400">mph</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>{primaryA?.avgSpeedMph} mph avg</span>
            <span>{primaryB?.avgSpeedMph} mph avg</span>
          </div>
        </div>

        {/* Metric 3: Form Score */}
        <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Form Score</span>
            {renderDelta(sessionA.overallPerformanceScore, sessionB.overallPerformanceScore)}
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-orange-400 font-mono">
              {sessionA.overallPerformanceScore}
            </span>
            <span className="text-sm text-slate-500 font-mono">vs</span>
            <span className="text-2xl font-black text-sky-400 font-mono">
              {sessionB.overallPerformanceScore}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>{sessionA.shooting.shotConsistencyScore}% consistency</span>
            <span>{sessionB.shooting.shotConsistencyScore}% consistency</span>
          </div>
        </div>

        {/* Metric 4: Release Timing */}
        <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2">
          <div className="text-xs text-slate-400 flex items-center justify-between">
            <span>Catch-to-Release</span>
            {renderDelta(sessionA.biomechanics.catchToReleaseAvgSec, sessionB.biomechanics.catchToReleaseAvgSec, 's', false)}
          </div>
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-2xl font-black text-orange-400 font-mono">
              {sessionA.biomechanics.catchToReleaseAvgSec}s
            </span>
            <span className="text-sm text-slate-500 font-mono">vs</span>
            <span className="text-2xl font-black text-sky-400 font-mono">
              {sessionB.biomechanics.catchToReleaseAvgSec}s
            </span>
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between font-mono">
            <span>Launch: {sessionA.shooting.avgReleaseAngleDeg}°</span>
            <span>Launch: {sessionB.shooting.avgReleaseAngleDeg}°</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Shot Charts */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-100 text-sm">Shot Distribution Map Comparison</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-orange-400 font-semibold mb-1 flex items-center justify-between">
              <span>{sessionA.title}</span>
              <span className="font-mono">{sessionA.shooting.shootingPercentage}% FG</span>
            </div>
            <CourtShotChart shots={sessionA.shooting.shots} />
          </div>

          <div>
            <div className="text-xs text-sky-400 font-semibold mb-1 flex items-center justify-between">
              <span>{sessionB.title}</span>
              <span className="font-mono">{sessionB.shooting.shootingPercentage}% FG</span>
            </div>
            <CourtShotChart shots={sessionB.shooting.shots} />
          </div>
        </div>
      </div>

      {/* Comparative Biomechanics Matrix */}
      <div className="p-4 rounded-xl glass-card border-slate-800 space-y-3">
        <h3 className="font-bold text-slate-100 text-sm">Kinematic Joint-Angle Comparison Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Kinematic Metric</th>
                <th className="py-2.5 px-3 text-orange-400">{sessionA.title}</th>
                <th className="py-2.5 px-3 text-sky-400">{sessionB.title}</th>
                <th className="py-2.5 px-3">Target Standard</th>
                <th className="py-2.5 px-3">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Set-Point Elbow Angle</td>
                <td className="py-2.5 px-3 text-orange-400 font-bold">{sessionA.biomechanics.elbowAngleAvgDeg}°</td>
                <td className="py-2.5 px-3 text-sky-400 font-bold">{sessionB.biomechanics.elbowAngleAvgDeg}°</td>
                <td className="py-2.5 px-3 text-slate-400">88° - 92°</td>
                <td className="py-2.5 px-3">
                  {renderDelta(sessionA.biomechanics.elbowAngleAvgDeg, sessionB.biomechanics.elbowAngleAvgDeg, '°')}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Knee Flexion Dip</td>
                <td className="py-2.5 px-3 text-orange-400 font-bold">{sessionA.biomechanics.kneeBendAvgDeg}°</td>
                <td className="py-2.5 px-3 text-sky-400 font-bold">{sessionB.biomechanics.kneeBendAvgDeg}°</td>
                <td className="py-2.5 px-3 text-slate-400">110° - 118°</td>
                <td className="py-2.5 px-3">
                  {renderDelta(sessionA.biomechanics.kneeBendAvgDeg, sessionB.biomechanics.kneeBendAvgDeg, '°')}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Release Launch Angle</td>
                <td className="py-2.5 px-3 text-orange-400 font-bold">{sessionA.shooting.avgReleaseAngleDeg}°</td>
                <td className="py-2.5 px-3 text-sky-400 font-bold">{sessionB.shooting.avgReleaseAngleDeg}°</td>
                <td className="py-2.5 px-3 text-slate-400">48° - 52°</td>
                <td className="py-2.5 px-3">
                  {renderDelta(sessionA.shooting.avgReleaseAngleDeg, sessionB.shooting.avgReleaseAngleDeg, '°')}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Vertical Jump Elevation</td>
                <td className="py-2.5 px-3 text-orange-400 font-bold">{sessionA.biomechanics.maxVerticalJumpInches} in</td>
                <td className="py-2.5 px-3 text-sky-400 font-bold">{sessionB.biomechanics.maxVerticalJumpInches} in</td>
                <td className="py-2.5 px-3 text-slate-400">&gt; 18.0 in</td>
                <td className="py-2.5 px-3">
                  {renderDelta(sessionA.biomechanics.maxVerticalJumpInches, sessionB.biomechanics.maxVerticalJumpInches, ' in')}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-semibold">Body Balance Score</td>
                <td className="py-2.5 px-3 text-orange-400 font-bold">{sessionA.biomechanics.bodyBalanceRating}/100</td>
                <td className="py-2.5 px-3 text-sky-400 font-bold">{sessionB.biomechanics.bodyBalanceRating}/100</td>
                <td className="py-2.5 px-3 text-slate-400">&gt; 90/100</td>
                <td className="py-2.5 px-3">
                  {renderDelta(sessionA.biomechanics.bodyBalanceRating, sessionB.biomechanics.bodyBalanceRating)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <AccuracyDisclaimer />
    </div>
  );
};
