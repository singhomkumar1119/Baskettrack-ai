import React from 'react';
import { ShieldAlert, Info, AlertTriangle } from 'lucide-react';

interface AccuracyDisclaimerProps {
  compact?: boolean;
}

export const AccuracyDisclaimer: React.FC<AccuracyDisclaimerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
        <span>
          <strong>Computer Vision Estimation:</strong> Measurements depend on camera angle, lighting, and court calibration. Not medical advice.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl glass-card border-slate-800 bg-slate-900/60 my-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-100 text-sm">Measurement Accuracy & Scientific Protocol</h4>
            <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-amber-500/20 text-amber-400">
              Training Insights Only
            </span>
          </div>
          <p>
            BasketTrack AI uses multi-view geometric homography and 17-point pose estimation models to calculate athletic metrics.
            Accuracy is contingent on video resolution, camera frame rate (60+ FPS recommended), stable positioning, and court line visibility.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <strong>Measured:</strong> High-confidence calibrated tracking
            </div>
            <div className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <strong>Estimated:</strong> Angle-approximated calculation
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <strong>Insufficient Data:</strong> Obstructed or uncalibrated
            </div>
          </div>
          <div className="pt-2 text-slate-400 italic text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            Disclaimer: Not intended as medical diagnosis, injury prevention warranty, or guaranteed athletic outcome.
          </div>
        </div>
      </div>
    </div>
  );
};
