import React, { useState } from 'react';
import {
  Activity,
  UploadCloud,
  LayoutDashboard,
  Video,
  BarChart3,
  GitCompare,
  FileText,
  Settings,
  UserCheck,
  ChevronDown,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string, id?: string) => void;
  activeAnalysisId?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onNavigate,
  activeAnalysisId
}) => {
  const [currentUser, setCurrentUser] = useState({
    name: 'Coach Marcus',
    role: 'NBA Skills Specialist',
    initials: 'CM'
  });
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const demoUsers = [
    { name: 'Coach Marcus', role: 'NBA Skills Specialist', initials: 'CM' },
    { name: 'Elena Rostova', role: 'Pro Shooting Specialist', initials: 'ER' },
    { name: 'Tyler Brooks', role: 'NCAA Analytics Director', initials: 'TB' }
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-nav px-4 lg:px-8 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
            <span className="text-white text-lg font-black tracking-tighter">BT</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-orange-400 transition-colors">
                BasketTrack
              </span>
              <span className="text-xs px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-mono font-bold">
                AI
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium tracking-wide">
              Computer Vision & Biomechanics
            </div>
          </div>
        </div>

        {/* Primary Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePage === 'dashboard'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => onNavigate('upload')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePage === 'upload'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload & Analyze</span>
          </button>

          {activeAnalysisId && (
            <>
              <button
                onClick={() => onNavigate('review', activeAnalysisId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activePage === 'review'
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>AI Video Review</span>
              </button>

              <button
                onClick={() => onNavigate('analytics', activeAnalysisId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  activePage === 'analytics'
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics Hub</span>
              </button>
            </>
          )}

          <button
            onClick={() => onNavigate('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePage === 'compare'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          <button
            onClick={() => onNavigate('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePage === 'reports'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Saved Reports</span>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activePage === 'settings'
                ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* User Account & Demo Selector */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center font-mono">
              {currentUser.initials}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 leading-tight">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl glass-card border-slate-700 bg-slate-900/95 shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in">
              <div className="p-2 border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                Switch Demo Account
              </div>
              {demoUsers.map((u) => (
                <button
                  key={u.name}
                  onClick={() => {
                    setCurrentUser(u);
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                    currentUser.name === u.name ? 'bg-orange-500/15 text-orange-400' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-slate-100">{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.role}</div>
                  </div>
                  {currentUser.name === u.name && <UserCheck className="w-4 h-4 text-orange-400" />}
                </button>
              ))}

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    onNavigate('auth');
                  }}
                  className="w-full flex items-center gap-2 p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / Switch Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
