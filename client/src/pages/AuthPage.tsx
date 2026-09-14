import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('coach.marcus@nba-training.com');
  const [password, setPassword] = useState('••••••••••••');
  const [name, setName] = useState('Coach Marcus');

  const demoAccounts = [
    {
      name: 'Coach Marcus',
      role: 'NBA Skills Trainer & Biomechanics Specialist',
      email: 'marcus@warriors-skills.com',
      avatar: 'CM'
    },
    {
      name: 'Elena Rostova',
      role: 'Pro Shooting Specialist & European Scout',
      email: 'elena@euro-scouting.com',
      avatar: 'ER'
    },
    {
      name: 'Tyler Brooks',
      role: 'NCAA Division I Analytics Director',
      email: 'tbrooks@athletics.unc.edu',
      avatar: 'TB'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  const handleDemoSelect = (acc: typeof demoAccounts[0]) => {
    setName(acc.name);
    setEmail(acc.email);
    onLoginSuccess();
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4">
      <div className="rounded-2xl glass-card border-slate-700 bg-slate-900/90 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 mx-auto flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/25">
            BT
          </div>
          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            {isSignUp ? 'Create BasketTrack Account' : 'Welcome to BasketTrack AI'}
          </h2>
          <p className="text-xs text-slate-400">
            Secure sports performance & computer vision portal
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-orange-400 uppercase tracking-wider text-center">
            Quick 1-Click Demo Login
          </div>
          <div className="space-y-1.5">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoSelect(acc)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-all text-xs group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/20 text-orange-400 font-bold flex items-center justify-center font-mono">
                    {acc.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200 group-hover:text-orange-400 transition-colors">
                      {acc.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{acc.role}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono">
            Or continue with credentials
          </span>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
                  placeholder="Coach John Doe"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none"
                placeholder="coach@team.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:border-orange-500 focus:outline-none font-mono"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded bg-slate-900 border-slate-700 text-orange-500" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-orange-400 hover:underline">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/25 transition-colors"
          >
            {isSignUp ? 'Create Professional Account' : 'Sign In to Portal'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-orange-400 font-semibold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>
      </div>
    </div>
  );
};
