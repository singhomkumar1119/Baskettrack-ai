import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, QrCode } from 'lucide-react';
import { AnalysisRecord } from '../types/basketball';

interface ShareModalProps {
  analysis: AnalysisRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  analysis,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/share/${analysis.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl glass-card border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Share Analysis Report</h3>
              <p className="text-xs text-slate-400">Create a secure, read-only link for players & coaches</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-orange-400" />
                Read-Only Public Link:
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center flex-shrink-0">
              <QrCode className="w-10 h-10 text-slate-950" />
            </div>
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-200">Mobile QR Quick Scan</div>
              <p className="text-[11px]">Players can scan this code courtside on iPad or iPhone for immediate biomechanical feedback.</p>
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
