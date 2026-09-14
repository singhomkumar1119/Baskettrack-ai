import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Play,
  Activity,
  Compass,
  Flame,
  Users,
  ShieldCheck,
  Video,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

interface LandingPageProps {
  onNavigate: (page: string, id?: string) => void;
  onLaunchSample: (sampleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onLaunchSample
}) => {
  return (
    <div className="space-y-16 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Hero Section */}
      <section className="relative pt-6 pb-12 flex flex-col items-center text-center space-y-6">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-orange-600/20 via-purple-600/15 to-transparent blur-3xl pointer-events-none" />

        {/* Live Telemetry Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold tracking-wide animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Generation Basketball Computer Vision Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Elite Basketball Video Analysis Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Computer Vision & AI</span>
        </h1>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
          Upload any basketball video. Extract frame-by-frame player tracking, release angles, parabolic shot arcs, 17-point biomechanical joint metrics, and interactive court heatmaps.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => onNavigate('upload')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all hover:scale-105"
          >
            <span>Upload Basketball Video</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onLaunchSample('analysis-curry-stepback-3pt')}
            className="px-6 py-3.5 rounded-xl glass-card hover:bg-slate-800 text-slate-100 font-bold text-sm border-slate-700 flex items-center gap-2 transition-all hover:scale-105"
          >
            <Play className="w-4 h-4 fill-orange-500 text-orange-500" />
            <span>Launch Live Demo Analysis</span>
          </button>
        </div>

        {/* Quick Specs Ticker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-3xl pt-8">
          <div className="p-3 rounded-xl glass-card border-slate-800 text-center">
            <div className="text-2xl font-black text-orange-400 font-mono">17</div>
            <div className="text-xs text-slate-400">Pose Joints Tracked</div>
          </div>
          <div className="p-3 rounded-xl glass-card border-slate-800 text-center">
            <div className="text-2xl font-black text-emerald-400 font-mono">97.4%</div>
            <div className="text-xs text-slate-400">Tracking Confidence</div>
          </div>
          <div className="p-3 rounded-xl glass-card border-slate-800 text-center">
            <div className="text-2xl font-black text-purple-400 font-mono">60 FPS</div>
            <div className="text-xs text-slate-400">Frame-by-Frame Telemetry</div>
          </div>
          <div className="p-3 rounded-xl glass-card border-slate-800 text-center">
            <div className="text-2xl font-black text-sky-400 font-mono">0.02s</div>
            <div className="text-xs text-slate-400">Release Timestamping</div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sports-Science Level Analytics at Your Fingertips
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything coaching staffs, skills trainers, and collegiate analysts need to optimize athletic performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1 */}
          <div className="p-5 rounded-xl glass-card glass-card-hover border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/15 text-orange-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Biomechanical Pose & Kinematics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects knee bend dip, 90° set-point elbow tuck, shoulder levelness, and wrist snap extension with actionable coaching feedback.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-xl glass-card glass-card-hover border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Shot Arc & Trajectory Physics</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Measures release height, launch angle, apex peak altitude, and rim entry clearance. Differentiates clean swishes from rim bounces.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-xl glass-card glass-card-hover border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Court Heatmaps & Player Load</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualizes 2D position density clouds, sprint counts, acceleration bursts, and total distance traveled calibrated to real-world feet or meters.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-xl glass-card glass-card-hover border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-100 text-sm">Multi-Player Tracking & Ball Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Assigns persistent ByteTrack IDs to all detected players. Measures left-hand vs right-hand dribble frequencies and ball possession time.
            </p>
          </div>
        </div>
      </section>

      {/* Video Guidelines Section */}
      <section className="p-6 rounded-2xl glass-card border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-base">
          <Video className="w-5 h-5 text-orange-400" />
          <span>Supported Video Formats & Recording Instructions</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-orange-400 text-xs uppercase tracking-wider">Format Specifications:</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Supports <strong>.MP4, .MOV, .AVI, .WebM</strong> files up to 500 MB</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Resolution: 720p, 1080p, 4K supported</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Recommended Frame Rate: 60 FPS or higher for precise release timing</span>
              </li>
            </ul>
          </div>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-sky-400 text-xs uppercase tracking-wider">For Maximum Computer Vision Accuracy:</h4>
            <ul className="space-y-1.5 text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>Keep camera steady (tripod or stable mount recommended)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>Ensure court lines (baseline, 3pt arc, key) and hoop rim are in frame</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>Keep full player body visible from head to shoes for height & jump metrics</span>
              </li>
            </ul>
          </div>
        </div>

        <AccuracyDisclaimer compact />
      </section>
    </div>
  );
};
