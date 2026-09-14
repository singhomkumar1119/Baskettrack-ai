import React from 'react';
import { ShieldCheck, Cpu, Database, Eye } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-8 px-4 lg:px-8 text-xs text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold text-xs">
            BT
          </div>
          <div>
            <span className="font-bold text-slate-200">BasketTrack AI</span>
            <span className="text-slate-500 text-[11px] ml-2">v2.4 Pro Sports Analytics</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-orange-400" />
            BlazePose 17-Joint Kinematics
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            ByteTrack Multi-Object Tracking
          </span>
          <span className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-sky-400" />
            NBA & FIBA Court Homography
          </span>
        </div>

        <div className="text-[11px] text-slate-500 text-center md:text-right">
          © 2026 BasketTrack AI. All measurements for athletic performance training only.
        </div>
      </div>
    </footer>
  );
};
