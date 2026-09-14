import React, { useEffect, useState } from 'react';
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Loader2,
  ArrowRight,
  StopCircle,
  Sparkles
} from 'lucide-react';
import { subscribeToProgress } from '../services/api';
import { AnalysisRecord } from '../types/basketball';

interface ProcessingPageProps {
  analysisId: string;
  onComplete: (analysis: AnalysisRecord) => void;
  onCancel: () => void;
}

export const ProcessingPage: React.FC<ProcessingPageProps> = ({
  analysisId,
  onComplete,
  onCancel
}) => {
  const [progress, setProgress] = useState(10);
  const [stage, setStage] = useState('Initializing GPU Computer Vision Pipeline...');
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Pipeline queued for analysis: ${analysisId}`,
    `[${new Date().toLocaleTimeString()}] Allocating PyTorch / TensorRT inference memory buffer...`
  ]);
  const [isDone, setIsDone] = useState(false);
  const [completedRecord, setCompletedRecord] = useState<AnalysisRecord | null>(null);

  const pipelineStages = [
    { p: 10, name: 'Upload & Validate Video Constraints' },
    { p: 20, name: 'Extract Frames & Frame Rate Timestamps' },
    { p: 30, name: 'Detect Court Lines, Baseline & Hoop Rim' },
    { p: 45, name: 'Detect Players & Basketball (YOLOv8)' },
    { p: 60, name: 'Multi-Object Tracking (ByteTrack ID Lock)' },
    { p: 70, name: '17-Point Biomechanical Pose Estimation' },
    { p: 80, name: 'Homography Pixel-to-Court Calibration' },
    { p: 88, name: 'Action Detection: Shots, Gathers & Dribbles' },
    { p: 94, name: 'Calculate Parabolic Arc & Joint Kinematics' },
    { p: 100, name: 'Generate Overlays, Heatmaps & Final Report' }
  ];

  useEffect(() => {
    const unsubscribe = subscribeToProgress(analysisId, (data) => {
      setProgress(data.progress);
      setStage(data.stage);
      if (data.log) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${data.log}`]);
      }
      if (data.isComplete && data.record) {
        setIsDone(true);
        setCompletedRecord(data.record);
        // Brief pause to display 100% complete before transition
        setTimeout(() => {
          onComplete(data.record!);
        }, 1200);
      }
    });

    return () => unsubscribe();
  }, [analysisId, onComplete]);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6">
      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono font-bold animate-pulse">
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Computer Vision Engine Processing</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Analyzing Basketball Footage
        </h1>
        <p className="text-xs text-slate-400">
          Tracking players, estimating skeletal joints, and calculating ball trajectory physics...
        </p>
      </div>

      {/* Main Progress Card */}
      <div className="rounded-2xl glass-card border-slate-700 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Progress percent & status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-orange-400 font-bold flex items-center gap-2">
              {!isDone ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {stage}
            </span>
            <span className="text-2xl font-black text-slate-100">{progress}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-glow-orange"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 10-Step Pipeline Indicator */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pipeline Processing Stages:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {pipelineStages.map((step, idx) => {
              const isCompleted = progress >= step.p;
              const isCurrent = progress < step.p && (idx === 0 || progress >= pipelineStages[idx - 1].p);
              return (
                <div
                  key={step.name}
                  className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
                    isCompleted
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isCurrent
                      ? 'bg-orange-500/15 border-orange-500/50 text-orange-300 animate-pulse'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex-shrink-0 font-mono text-[10px] font-bold">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-orange-400 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] text-slate-400">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-medium leading-tight">{step.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Processing Terminal Logs */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              Live Computer Vision Telemetry Logs
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Stream Active</span>
          </div>

          <div className="p-3.5 rounded-xl bg-black/90 border border-slate-800 font-mono text-[11px] text-emerald-400/90 h-40 overflow-y-auto space-y-1 select-text">
            {logs.map((line, i) => (
              <div key={i} className="leading-relaxed">
                <span className="text-slate-500 mr-1.5">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <StopCircle className="w-4 h-4 text-rose-400" />
            <span>Cancel Analysis</span>
          </button>

          {isDone && completedRecord && (
            <button
              type="button"
              onClick={() => onComplete(completedRecord)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all"
            >
              <span>Open Completed Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
