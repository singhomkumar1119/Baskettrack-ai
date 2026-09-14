import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  User,
  Sliders,
  Database,
  Check,
  Globe,
  Bell,
  HardDrive
} from 'lucide-react';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

export const SettingsPage: React.FC = () => {
  const [userName, setUserName] = useState('Coach Marcus');
  const [userRole, setUserRole] = useState('NBA Skills Specialist');
  const [teamName, setTeamName] = useState('Golden State Training Facility');
  const [unitSystem, setUnitSystem] = useState<'imperial' | 'metric'>('imperial');
  const [defaultCourt, setDefaultCourt] = useState('nba');
  const [confidenceThreshold, setConfidenceThreshold] = useState(80);
  const [autoDeleteDays, setAutoDeleteDays] = useState('30');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 py-6 max-w-4xl mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="space-y-1 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
            System Preferences
          </span>
          <span className="text-xs text-slate-400">Account & Calibration Defaults</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight">
          Platform Settings
        </h1>
        <p className="text-xs text-slate-400">
          Configure measurement units, computer vision confidence thresholds, and court homography presets.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Coach Profile */}
        <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Coach & Organization Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Coach Name</label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Coaching Specialty / Title</label>
              <input
                type="text"
                value={userRole}
                onChange={e => setUserRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-300 font-medium mb-1">Team / Athletic Facility</label>
              <input
                type="text"
                value={teamName}
                onChange={e => setTeamName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Court Calibration & Measurement Units */}
        <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
            <Sliders className="w-4 h-4" />
            <span>Court Dimensions & Units of Measurement</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Unit System</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUnitSystem('imperial')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    unitSystem === 'imperial'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Imperial (ft, in, mph)
                </button>
                <button
                  type="button"
                  onClick={() => setUnitSystem('metric')}
                  className={`p-2.5 rounded-lg border text-center transition-all ${
                    unitSystem === 'metric'
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Metric (m, cm, km/h)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Default Court Homography Preset</label>
              <select
                value={defaultCourt}
                onChange={e => setDefaultCourt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
              >
                <option value="nba">NBA Regulation (94′ × 50′)</option>
                <option value="fiba">FIBA International (28m × 15m)</option>
                <option value="ncaa">NCAA Division I (94′ × 50′)</option>
                <option value="highschool">High School (84′ × 50′)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: AI & Computer Vision Thresholds */}
        <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Computer Vision & Confidence Thresholds</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-slate-300 font-medium">Minimum AI Confidence Score Threshold</span>
                <span className="text-orange-400 font-bold font-mono">{confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="60"
                max="95"
                step="5"
                value={confidenceThreshold}
                onChange={e => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Measurements with confidence below this threshold will be clearly flagged as "Estimated" or "Insufficient data".
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Video Retention & Storage */}
        <div className="p-5 rounded-2xl glass-card border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            <span>Raw Video Retention & Privacy</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Temporary Video File Cleanup</label>
              <select
                value={autoDeleteDays}
                onChange={e => setAutoDeleteDays(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
              >
                <option value="7">Auto-delete video after 7 days (Saves storage)</option>
                <option value="30">Auto-delete video after 30 days (Recommended)</option>
                <option value="90">Auto-delete video after 90 days</option>
                <option value="never">Retain videos indefinitely</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Analysis reports & measurements are always preserved permanently.</p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Email Alerts & Share Notifications</label>
              <label className="flex items-center gap-2 mt-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-orange-500"
                />
                <span>Email me when processing completes</span>
              </label>
            </div>
          </div>
        </div>

        <AccuracyDisclaimer />

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold animate-fade-in">
              <Check className="w-4 h-4" />
              Settings saved successfully!
            </span>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all hover:scale-105"
          >
            Save All Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
