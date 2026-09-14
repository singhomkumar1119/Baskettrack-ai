import React, { useState } from 'react';
import { X, Check, Sliders, User, Target, RotateCcw } from 'lucide-react';
import { AnalysisRecord } from '../types/basketball';

interface ManualCorrectionModalProps {
  analysis: AnalysisRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (corrections: any) => void;
}

export const ManualCorrectionModal: React.FC<ManualCorrectionModalProps> = ({
  analysis,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const primaryPlayer = analysis.players[0] || { id: 'player-1', name: 'Player #1', jerseyNumber: 1 };

  const [playerName, setPlayerName] = useState(primaryPlayer.name);
  const [jerseyNumber, setJerseyNumber] = useState(primaryPlayer.jerseyNumber);
  const [shotResults, setShotResults] = useState<Record<string, 'make' | 'miss'>>(
    analysis.shooting.shots.reduce((acc, s) => ({ ...acc, [s.id]: s.result }), {})
  );
  const [courtWidth, setCourtWidth] = useState(analysis.calibration.courtWidthFeet);
  const [courtLength, setCourtLength] = useState(analysis.calibration.courtLengthFeet);

  const toggleShot = (shotId: string) => {
    setShotResults(prev => ({
      ...prev,
      [shotId]: prev[shotId] === 'make' ? 'miss' : 'make'
    }));
  };

  const handleSave = () => {
    const shotOverrides: Record<string, { result: 'make' | 'miss' }> = {};
    Object.entries(shotResults).forEach(([id, res]) => {
      shotOverrides[id] = { result: res };
    });

    onSave({
      playerOverrides: {
        [primaryPlayer.id]: {
          name: playerName,
          jerseyNumber: Number(jerseyNumber)
        }
      },
      shotOverrides,
      calibration: {
        courtWidthFeet: Number(courtWidth),
        courtLengthFeet: Number(courtLength),
        isCalibrated: true
      }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl glass-card border-slate-700 bg-slate-900/95 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Manual Calibration & Model Override</h3>
              <p className="text-xs text-slate-400">Correct tracking identification or tweak court homography</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {/* Section 1: Player Identity Correction */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5" />
              <span>Player Identity Override</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Player Full Name</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Jersey Number</label>
                <input
                  type="number"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-orange-500 focus:outline-none text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Shot Make/Miss Outcome Correction */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Target className="w-3.5 h-3.5" />
                <span>Shot Outcome Verification</span>
              </div>
              <span className="text-[11px] text-slate-400">Click pill to flip Make/Miss</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {analysis.shooting.shots.map(shot => {
                const isMake = shotResults[shot.id] === 'make';
                return (
                  <button
                    key={shot.id}
                    type="button"
                    onClick={() => toggleShot(shot.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between text-xs ${
                      isMake
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-rose-500/15 border-rose-500/40 text-rose-300 hover:bg-rose-500/25'
                    }`}
                  >
                    <div>
                      <div className="font-bold">Shot #{shot.shotNumber}</div>
                      <div className="text-[10px] opacity-75">{shot.distanceFeet} ft ({shot.zone})</div>
                    </div>
                    <span className="text-[11px] font-black uppercase font-mono px-2 py-0.5 rounded bg-slate-900/60">
                      {isMake ? 'MAKE' : 'MISS'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Court Dimensions Calibration */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <span>Court Dimensions Calibration</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Court Width (Feet)</label>
                <input
                  type="number"
                  value={courtWidth}
                  onChange={(e) => setCourtWidth(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-slate-100 font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 font-medium mb-1 block">Court Length (Feet)</label>
                <input
                  type="number"
                  value={courtLength}
                  onChange={(e) => setCourtLength(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 focus:border-sky-500 focus:outline-none text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Apply Corrections
          </button>
        </div>
      </div>
    </div>
  );
};
