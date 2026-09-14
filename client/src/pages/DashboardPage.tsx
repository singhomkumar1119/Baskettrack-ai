import React from 'react';
import {
  UploadCloud,
  Video,
  BarChart3,
  Flame,
  Activity,
  HardDrive,
  Clock,
  ArrowUpRight,
  Sparkles,
  FileDown
} from 'lucide-react';
import { AnalysisRecord } from '../types/basketball';
import { exportToPDF } from '../services/exportUtils';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

interface DashboardPageProps {
  analyses: AnalysisRecord[];
  onNavigate: (page: string, id?: string) => void;
  onSelectAnalysis: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analyses,
  onNavigate,
  onSelectAnalysis
}) => {
  // Aggregate stats
  const totalVideos = analyses.length;
  const totalShots = analyses.reduce((acc, a) => acc + (a.shooting?.numShots || 0), 0);
  const totalMakes = analyses.reduce((acc, a) => acc + (a.shooting?.madeShots || 0), 0);
  const avgFgPct = totalShots > 0 ? Math.round((totalMakes / totalShots) * 100) : 0;
  const totalDistance = analyses.reduce(
    (acc, a) => acc + (a.players[0]?.totalDistanceFeet || 0),
    0
  );
  const totalSprints = analyses.reduce(
    (acc, a) => acc + (a.players[0]?.numSprints || 0),
    0
  );

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Welcome Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-orange-950/20 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
              NBA Skills Portal
            </span>
            <span className="text-xs text-slate-400">Golden State Facility</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
            Coach Marcus's Analytics Command
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Computer vision telemetry, 17-point skeletal biomechanics, and multi-player kinematic tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Video</span>
          </button>
        </div>
      </div>

      {/* High-Level KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl glass-card border-slate-800">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-orange-400" />
            Videos Analyzed
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">{totalVideos}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">3 Pro Sessions Ready</div>
        </div>

        <div className="p-4 rounded-xl glass-card border-slate-800">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            Average FG%
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{avgFgPct}%</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{totalMakes}/{totalShots} Total Made</div>
        </div>

        <div className="p-4 rounded-xl glass-card border-slate-800">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-sky-400" />
            Distance Tracked
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
            {Math.round(totalDistance)} <span className="text-sm font-normal text-slate-400">ft</span>
          </div>
          <div className="text-[10px] text-sky-400 mt-0.5">Calibrated Homography</div>
        </div>

        <div className="p-4 rounded-xl glass-card border-slate-800">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            Sprints Logged
          </div>
          <div className="text-2xl font-black text-purple-400 mt-1 font-mono">{totalSprints}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">High Acceleration Cuts</div>
        </div>

        <div className="p-4 rounded-xl glass-card border-slate-800 col-span-2 lg:col-span-1">
          <div className="text-slate-400 text-xs flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            Cloud Storage
          </div>
          <div className="text-2xl font-black text-slate-100 mt-1 font-mono">
            4.8 <span className="text-sm font-normal text-slate-400">/ 25 GB</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '19.2%' }} />
          </div>
        </div>
      </div>

      {/* Recent Video Analyses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Recent Analysis Sessions</h2>
            <p className="text-xs text-slate-400">Select any video to inspect overlays or complete biometric reports</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
          >
            <span>View All Reports</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {analyses.map(analysis => {
            const primary = analysis.players[0];
            const fgPct = analysis.shooting.shootingPercentage;

            return (
              <div
                key={analysis.id}
                className="rounded-2xl glass-card glass-card-hover border-slate-800 overflow-hidden flex flex-col justify-between shadow-lg group"
              >
                {/* Thumbnail Simulation Header */}
                <div
                  onClick={() => {
                    onSelectAnalysis(analysis.id);
                    onNavigate('review', analysis.id);
                  }}
                  className="relative w-full aspect-video bg-slate-950 flex items-center justify-center cursor-pointer border-b border-slate-800 group-hover:opacity-95 transition-opacity"
                  style={{
                    background: 'radial-gradient(circle at 50% 30%, #172554 0%, #030712 100%)'
                  }}
                >
                  {/* Basketball Court Graphics */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f97316_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Play badge */}
                  <div className="w-12 h-12 rounded-full bg-orange-500/90 group-hover:bg-orange-500 text-white flex items-center justify-center shadow-xl transition-transform group-hover:scale-110 z-10">
                    <Video className="w-5 h-5 fill-current" />
                  </div>

                  {/* Top tags */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-orange-400 font-bold uppercase">
                      {analysis.analysisType.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-mono text-slate-300">
                      {analysis.videoDurationSec}s @ {analysis.fps}fps
                    </span>
                  </div>

                  {/* Performance Score pill */}
                  <div className="absolute bottom-2.5 right-2.5 z-10 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5">
                    <span className="text-slate-400 text-[10px]">SCORE</span>
                    <span className="text-orange-400 font-bold">{analysis.overallPerformanceScore}</span>
                    <span className="text-slate-500 text-[10px]">/100</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-100 text-sm leading-snug group-hover:text-orange-400 transition-colors">
                      {analysis.title}
                    </h3>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{primary?.name}</span>
                      <span>•</span>
                      <span>{analysis.uploadDate.substring(0, 10)}</span>
                    </div>
                  </div>

                  {/* Mini Stats Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400">Shooting</div>
                      <div className="font-bold text-emerald-400 font-mono">
                        {analysis.shooting.madeShots}/{analysis.shooting.numShots} ({fgPct}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Peak Speed</div>
                      <div className="font-bold text-slate-200 font-mono">
                        {primary?.maxSpeedMph || 0} mph
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">Release Arc</div>
                      <div className="font-bold text-purple-400 font-mono">
                        {analysis.shooting.avgReleaseAngleDeg}°
                      </div>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <button
                      onClick={() => {
                        onSelectAnalysis(analysis.id);
                        onNavigate('review', analysis.id);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5 text-orange-400" />
                      <span>Review</span>
                    </button>

                    <button
                      onClick={() => {
                        onSelectAnalysis(analysis.id);
                        onNavigate('analytics', analysis.id);
                      }}
                      className="px-2 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Analytics</span>
                    </button>

                    <button
                      onClick={() => exportToPDF(analysis)}
                      className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                      title="Download PDF"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PDF</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AccuracyDisclaimer />
    </div>
  );
};
