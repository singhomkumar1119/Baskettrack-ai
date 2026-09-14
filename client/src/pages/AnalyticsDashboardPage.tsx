import React, { useState } from 'react';
import {
  BarChart3,
  Flame,
  Crosshair,
  Compass,
  Activity,
  Video,
  FileDown,
  Share2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AnalysisRecord, ShotDetail } from '../types/basketball';
import { CourtShotChart } from '../components/CourtShotChart';
import { CourtHeatmap } from '../components/CourtHeatmap';
import { ShotArcVisualization } from '../components/ShotArcVisualization';
import { BiomechanicsViewer } from '../components/BiomechanicsViewer';
import { MetricBadge } from '../components/MetricBadge';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';
import { exportToPDF, exportToCSV, exportToJSON } from '../services/exportUtils';
import { ShareModal } from '../components/ShareModal';
import { ManualCorrectionModal } from '../components/ManualCorrectionModal';

interface AnalyticsDashboardPageProps {
  analysis: AnalysisRecord;
  onNavigate: (page: string, id?: string) => void;
  onUpdateAnalysis: (id: string, patch: Partial<AnalysisRecord>) => void;
}

export const AnalyticsDashboardPage: React.FC<AnalyticsDashboardPageProps> = ({
  analysis,
  onNavigate,
  onUpdateAnalysis
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'player' | 'shooting' | 'ball' | 'biomechanics'>('overview');
  const [selectedShot, setSelectedShot] = useState<ShotDetail | null>(analysis.shooting.shots[0] || null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);

  const primary = analysis.players.find(p => p.id === analysis.selectedPlayerId) || analysis.players[0];

  const handleApplyCorrections = (corrections: any) => {
    onUpdateAnalysis(analysis.id, {
      manualCorrections: corrections
    });
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
              Analytics Hub
            </span>
            <span className="text-xs text-slate-400">{analysis.title}</span>
            <MetricBadge status={analysis.overallConfidenceStatus} confidence={analysis.overallConfidenceScore} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-1">
            Performance Analytics & Telemetry
          </h1>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('review', analysis.id)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Video className="w-4 h-4 text-orange-400" />
            <span>AI Video Review</span>
          </button>

          <button
            onClick={() => setIsCorrectionOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-sky-400" />
            <span>Calibrate</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span>Share</span>
          </button>

          <button
            onClick={() => exportToPDF(analysis)}
            className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            <span>Export PDF Report</span>
          </button>
        </div>
      </div>

      {/* 5-Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 overflow-x-auto pb-2 text-xs font-semibold select-none">
        {[
          { id: 'overview', label: '1. Overview', icon: BarChart3 },
          { id: 'player', label: '2. Player Metrics & Heatmap', icon: Flame },
          { id: 'shooting', label: '3. Shooting Analysis & Arc', icon: Crosshair },
          { id: 'ball', label: '4. Ball Handling & Control', icon: Compass },
          { id: 'biomechanics', label: '5. Pose & Biomechanics', icon: Activity }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fade-in">
          {/* Main KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Overall Score */}
            <div className="p-5 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Performance Score</span>
                <div className="text-3xl sm:text-4xl font-black text-orange-400 font-mono mt-1">
                  {analysis.overallPerformanceScore}
                  <span className="text-sm text-slate-500 font-normal">/100</span>
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Elite Pro Class</div>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center font-bold">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Shooting Percentage */}
            <div className="p-5 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Shooting Accuracy</span>
                <div className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono mt-1">
                  {analysis.shooting.shootingPercentage}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  {analysis.shooting.madeShots} Made of {analysis.shooting.numShots} Shots
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <Crosshair className="w-6 h-6" />
              </div>
            </div>

            {/* Velocity & Distance */}
            <div className="p-5 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">Avg Speed / Peak</span>
                <div className="text-2xl sm:text-3xl font-black text-sky-400 font-mono mt-1">
                  {primary?.avgSpeedMph} <span className="text-xs text-slate-400">/ {primary?.maxSpeedMph} mph</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Total Distance: {primary?.totalDistanceFeet} ft
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            {/* AI Confidence & Telemetry */}
            <div className="p-5 rounded-2xl glass-card border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold block">AI Confidence Score</span>
                <div className="text-3xl sm:text-4xl font-black text-purple-400 font-mono mt-1">
                  {analysis.overallConfidenceScore}%
                </div>
                <div className="text-[11px] text-purple-300 mt-1">
                  BlazePose + ByteTrack Lock
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Dual Visualizers: Shot Chart & 2D Arc */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourtShotChart
              shots={analysis.shooting.shots}
              selectedShotId={selectedShot?.id}
              onSelectShot={(s) => setSelectedShot(s)}
            />
            <ShotArcVisualization
              shots={analysis.shooting.shots}
              selectedShotId={selectedShot?.id}
              onSelectShot={(s) => setSelectedShot(s)}
            />
          </div>

          {/* Quick Biomechanics Preview */}
          <BiomechanicsViewer
            biomechanics={analysis.biomechanics}
            jumpHeightInches={selectedShot?.jumpHeightInches || 19.1}
          />
        </div>
      )}

      {/* TAB 2: PLAYER METRICS & HEATMAP */}
      {activeTab === 'player' && (
        <div className="space-y-6 animate-fade-in">
          {/* Movement summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Total Distance</span>
              <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
                {primary?.totalDistanceFeet} <span className="text-xs font-normal text-slate-400">ft</span>
              </div>
              <div className="text-[10px] text-slate-400">({primary?.totalDistanceMeters} meters)</div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Peak Velocity</span>
              <div className="text-2xl font-black text-orange-400 font-mono mt-0.5">
                {primary?.maxSpeedMph} <span className="text-xs font-normal text-slate-400">mph</span>
              </div>
              <div className="text-[10px] text-slate-400">({primary?.maxSpeedKmh} km/h)</div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Sprints Tracked</span>
              <div className="text-2xl font-black text-purple-400 font-mono mt-0.5">
                {primary?.numSprints}
              </div>
              <div className="text-[10px] text-slate-400">{primary?.sprintingDistanceMeters}m sprinting distance</div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Player Workload Load</span>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                {primary?.playerLoad}
              </div>
              <div className="text-[10px] text-emerald-400">Intensity Index: {primary?.movementIntensity}/100</div>
            </div>
          </div>

          {/* Interactive Court Heatmap & Activity Zones */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <CourtHeatmap
                heatmapData={primary?.heatmapData || []}
                positionTrail={primary?.positionTrail || []}
                playerName={primary?.name}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Acceleration & Deceleration Stats */}
              <div className="p-4 rounded-xl glass-card border-slate-800 space-y-3">
                <h3 className="font-bold text-slate-100 text-sm">Kinetic Acceleration & Deceleration</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Accelerations</div>
                    <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                      {primary?.numAccelerations}
                    </div>
                    <div className="text-[10px] text-slate-400">Max: +{primary?.maxAccelerationMss} m/s²</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
                    <div className="text-[10px] text-slate-400">Decelerations</div>
                    <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
                      {primary?.numDecelerations}
                    </div>
                    <div className="text-[10px] text-slate-400">Max: {primary?.maxDecelerationMss} m/s²</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Direction Changes:</span>
                    <strong className="block text-slate-200 mt-0.5 font-mono">{primary?.numDirectionChanges} cuts</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <span className="text-slate-400 text-[10px]">Stops Logged:</span>
                    <strong className="block text-slate-200 mt-0.5 font-mono">{primary?.numStops} plants</strong>
                  </div>
                </div>
              </div>

              {/* Left vs Right Movement Balance */}
              <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2.5">
                <h3 className="font-bold text-slate-100 text-sm">Lateral Movement Symmetry Balance</h3>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-400 font-bold">Left Cut: {primary?.leftRightBalance.left}%</span>
                  <span className="text-orange-400 font-bold">Right Cut: {primary?.leftRightBalance.right}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden flex">
                  <div className="bg-sky-500 h-full" style={{ width: `${primary?.leftRightBalance.left}%` }} />
                  <div className="bg-orange-500 h-full" style={{ width: `${primary?.leftRightBalance.right}%` }} />
                </div>
                <div className="text-[10px] text-slate-400">
                  Optimal bilateral balance ensures unpredictable offensive driving angles.
                </div>
              </div>

              {/* Court Positioning Distribution */}
              <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2 text-xs">
                <h3 className="font-bold text-slate-100 text-sm">Offensive vs Defensive Court Presence</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Offensive Half:</span>
                    <span className="font-mono text-emerald-400 font-bold">{primary?.positioning.offensive}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Defensive Half:</span>
                    <span className="font-mono text-sky-400 font-bold">{primary?.positioning.defensive}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Transition / Neutral:</span>
                    <span className="font-mono text-slate-300 font-bold">{primary?.positioning.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SHOOTING ANALYSIS */}
      {activeTab === 'shooting' && (
        <div className="space-y-6 animate-fade-in">
          {/* Shot Chart and Arc */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CourtShotChart
              shots={analysis.shooting.shots}
              selectedShotId={selectedShot?.id}
              onSelectShot={(s) => setSelectedShot(s)}
            />
            <ShotArcVisualization
              shots={analysis.shooting.shots}
              selectedShotId={selectedShot?.id}
              onSelectShot={(s) => setSelectedShot(s)}
            />
          </div>

          {/* Shot-by-Shot Detailed Timeline Table */}
          <div className="p-4 rounded-xl glass-card border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Shot-by-Shot Telemetry Breakdown</h3>
                <p className="text-xs text-slate-400">Every detected attempt with release height, launch angle, and kinetic scores</p>
              </div>
              <button
                onClick={() => exportToCSV(analysis)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-orange-400" />
                <span>Export CSV Log</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] font-mono uppercase">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Result</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Launch Angle</th>
                    <th className="py-2.5 px-3">Release Ht</th>
                    <th className="py-2.5 px-3">Apex Ht</th>
                    <th className="py-2.5 px-3">Elbow Angle</th>
                    <th className="py-2.5 px-3">Knee Dip</th>
                    <th className="py-2.5 px-3">Form Score</th>
                    <th className="py-2.5 px-3">Confidence</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {analysis.shooting.shots.map((shot) => {
                    const isMake = shot.result === 'make';
                    const isSelected = selectedShot?.id === shot.id;
                    return (
                      <tr
                        key={shot.id}
                        onClick={() => setSelectedShot(shot)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-orange-500/10 text-orange-300' : 'hover:bg-slate-900/60 text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold">{shot.shotNumber}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isMake ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {shot.result} {shot.isSwish ? '★' : ''}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">{shot.distanceFeet} ft</td>
                        <td className="py-2.5 px-3 text-orange-400">{shot.releaseAngleDeg}°</td>
                        <td className="py-2.5 px-3">{shot.releaseHeightFeet} ft</td>
                        <td className="py-2.5 px-3 text-purple-400">{shot.apexHeightFeet} ft</td>
                        <td className="py-2.5 px-3">{shot.elbowAngleDeg}°</td>
                        <td className="py-2.5 px-3">{shot.kneeBendAngleDeg}°</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">{shot.formScore}/100</td>
                        <td className="py-2.5 px-3 text-slate-400">{shot.confidenceScore}%</td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate('review', analysis.id);
                            }}
                            className="text-orange-400 hover:text-orange-300 font-sans text-[11px] underline"
                          >
                            View Clip
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BALL HANDLING */}
      {activeTab === 'ball' && (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Total Dribbles</span>
              <div className="text-3xl font-black text-slate-100 font-mono mt-1">
                {analysis.ballHandling.numDribbles}
              </div>
              <div className="text-[10px] text-orange-400 mt-0.5 font-mono">
                {analysis.ballHandling.dribbleFrequencyHz} dribbles/sec
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Ball Possession Time</span>
              <div className="text-3xl font-black text-sky-400 font-mono mt-1">
                {analysis.ballHandling.possessionTimeSec}s
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                {analysis.ballHandling.dribblingDurationSec}s active bouncing
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Max Ball Speed</span>
              <div className="text-3xl font-black text-purple-400 font-mono mt-1">
                {analysis.ballHandling.maxBallSpeedMph} <span className="text-xs font-normal text-slate-400">mph</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Avg: {analysis.ballHandling.avgBallSpeedMph} mph
              </div>
            </div>

            <div className="p-4 rounded-xl glass-card border-slate-800">
              <span className="text-xs text-slate-400">Turnovers / Lost Balls</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-1">
                {analysis.ballHandling.turnoversCount}
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">100% Ball Security</div>
            </div>
          </div>

          {/* Left vs Right Hand Dribble Split */}
          <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-4">
            <h3 className="font-bold text-slate-100 text-sm">Ambidextrous Dribble Distribution</h3>
            <div className="flex items-center justify-between text-xs font-mono font-bold">
              <span className="text-sky-400">Left Hand: {analysis.ballHandling.handUsage.leftHandPct}%</span>
              <span className="text-orange-400">Right Hand: {analysis.ballHandling.handUsage.rightHandPct}%</span>
            </div>

            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden flex p-0.5 border border-slate-800">
              <div
                className="bg-sky-500 h-full rounded-l-full transition-all"
                style={{ width: `${analysis.ballHandling.handUsage.leftHandPct}%` }}
              />
              <div
                className="bg-orange-500 h-full rounded-r-full transition-all"
                style={{ width: `${analysis.ballHandling.handUsage.rightHandPct}%` }}
              />
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              Tracking models detected {analysis.ballHandling.catchEvents} catch events with an average catch-to-release duration of{' '}
              <strong className="text-slate-200">{analysis.ballHandling.avgTimeCatchToReleaseSec}s</strong>.
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: POSE & BIOMECHANICS */}
      {activeTab === 'biomechanics' && (
        <div className="space-y-6 animate-fade-in">
          <BiomechanicsViewer
            biomechanics={analysis.biomechanics}
            jumpHeightInches={selectedShot?.jumpHeightInches || 19.1}
          />
        </div>
      )}

      <AccuracyDisclaimer />

      {/* Modals */}
      <ShareModal
        analysis={analysis}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      <ManualCorrectionModal
        analysis={analysis}
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSave={handleApplyCorrections}
      />
    </div>
  );
};
