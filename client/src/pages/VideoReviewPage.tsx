import React, { useState } from 'react';
import {
  Video,
  BarChart3,
  SlidersHorizontal,
  Share2,
  FileDown,
  ChevronRight,
  User,
  Crosshair,
  Compass,
  Sparkles,
  Flame
} from 'lucide-react';
import { AnalysisRecord, ShotDetail } from '../types/basketball';
import { VideoPlayerWithOverlay } from '../components/VideoPlayerWithOverlay';
import { ManualCorrectionModal } from '../components/ManualCorrectionModal';
import { ShareModal } from '../components/ShareModal';
import { exportToPDF, exportToCSV, exportToJSON } from '../services/exportUtils';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

interface VideoReviewPageProps {
  analysis: AnalysisRecord;
  onNavigate: (page: string, id?: string) => void;
  onUpdateAnalysis: (id: string, patch: Partial<AnalysisRecord>) => void;
}

export const VideoReviewPage: React.FC<VideoReviewPageProps> = ({
  analysis,
  onNavigate,
  onUpdateAnalysis
}) => {
  const [selectedShot, setSelectedShot] = useState<ShotDetail | null>(analysis.shooting.shots[0] || null);
  const [isCorrectionOpen, setIsCorrectionOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [jumpTimestamp, setJumpTimestamp] = useState<number | null>(null);

  const primaryPlayer = analysis.players.find(p => p.id === analysis.selectedPlayerId) || analysis.players[0];

  const handleShotClick = (shot: ShotDetail) => {
    setSelectedShot(shot);
    setJumpTimestamp(shot.timestamp);
  };

  const handleApplyCorrections = (corrections: any) => {
    onUpdateAnalysis(analysis.id, {
      manualCorrections: corrections
    });
  };

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Top Header & Quick Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
              AI Video Review
            </span>
            <span className="text-xs text-slate-400">{analysis.videoFileName}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-0.5">
            {analysis.title}
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate('analytics', analysis.id)}
            className="px-3.5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Open Analytics Hub</span>
          </button>

          <button
            onClick={() => setIsShareOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Share</span>
          </button>

          <button
            onClick={() => exportToPDF(analysis)}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Video Player + Detection Details Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Interactive AI Video Player */}
        <div className="lg:col-span-8 space-y-4">
          <VideoPlayerWithOverlay
            frames={analysis.frames}
            durationSec={analysis.videoDurationSec}
            fps={analysis.fps}
            videoUrl={analysis.videoUrl}
            shots={analysis.shooting.shots}
            players={analysis.players}
            selectedPlayerId={primaryPlayer?.id}
            onOpenManualCorrection={() => setIsCorrectionOpen(true)}
          />

          {/* Quick instructions strip */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              Tip: Click any shot pin on the timeline to scrub straight to ball release.
            </span>
            <button
              onClick={() => setIsCorrectionOpen(true)}
              className="text-orange-400 hover:text-orange-300 font-semibold text-[11px] flex items-center gap-1"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Correct Model Outputs</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Event Inspector & Shot Timeline */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Active Player Card */}
          <div className="p-4 rounded-xl glass-card border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Active Player Subject
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {analysis.overallConfidenceScore}% Confidence
              </span>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 font-black text-sm flex items-center justify-center font-mono border border-orange-500/30">
                #{primaryPlayer?.jerseyNumber || 30}
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-sm">{primaryPlayer?.name}</h4>
                <div className="text-[11px] text-slate-400">
                  {primaryPlayer?.estimatedHeightFeet} • {primaryPlayer?.totalTimeOnCourtSec}s on court
                </div>
              </div>
            </div>

            {/* Quick metrics */}
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800/80">
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[10px]">Peak Velocity</span>
                <div className="font-bold text-slate-100 font-mono mt-0.5">
                  {primaryPlayer?.maxSpeedMph} mph
                </div>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 text-[10px]">Total Distance</span>
                <div className="font-bold text-slate-100 font-mono mt-0.5">
                  {primaryPlayer?.totalDistanceFeet} ft
                </div>
              </div>
            </div>
          </div>

          {/* Shot Event Jump List */}
          <div className="p-4 rounded-xl glass-card border-slate-800 space-y-3 flex-1 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                Detected Shot Moments
              </span>
              <span className="text-xs text-orange-400 font-bold font-mono">
                {analysis.shooting.madeShots}/{analysis.shooting.numShots} Makes
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[340px] pr-1">
              {analysis.shooting.shots.map((shot) => {
                const isSelected = selectedShot?.id === shot.id;
                const isMake = shot.result === 'make';
                return (
                  <div
                    key={shot.id}
                    onClick={() => handleShotClick(shot)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-purple-600/15 border-purple-500 text-slate-100 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isMake ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                        }`}
                      >
                        {shot.shotNumber}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          <span>Shot #{shot.shotNumber}</span>
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                              isMake ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {shot.result}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {shot.distanceFeet} ft • {shot.releaseAngleDeg}° Arc • {shot.timestamp}s
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-orange-400 font-mono block">
                        {shot.formScore}/100
                      </span>
                      <span className="text-[9px] text-slate-400">Form Score</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Shot Biomechanics Snapshot */}
            {selectedShot && (
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs space-y-1.5 mt-auto">
                <div className="font-bold text-orange-400 text-[11px] flex items-center justify-between">
                  <span>Shot #{selectedShot.shotNumber} Kinetic Snapshot</span>
                  <span className="text-slate-400 text-[10px]">{selectedShot.zone}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-300">
                  <div>Elbow Angle: <strong>{selectedShot.elbowAngleDeg}°</strong></div>
                  <div>Knee Dip: <strong>{selectedShot.kneeBendAngleDeg}°</strong></div>
                  <div>Apex Height: <strong>{selectedShot.apexHeightFeet} ft</strong></div>
                  <div>Release Speed: <strong>{selectedShot.shotSpeedMph} mph</strong></div>
                </div>
                <div className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                  {selectedShot.feedback[0] || 'Clean form mechanics observed.'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AccuracyDisclaimer />

      {/* Modals */}
      <ManualCorrectionModal
        analysis={analysis}
        isOpen={isCorrectionOpen}
        onClose={() => setIsCorrectionOpen(false)}
        onSave={handleApplyCorrections}
      />

      <ShareModal
        analysis={analysis}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
};
