import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  FileDown,
  Share2,
  Edit3,
  Trash2,
  Video,
  BarChart3,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { AnalysisRecord } from '../types/basketball';
import { exportToPDF, exportToCSV, exportToJSON } from '../services/exportUtils';
import { ShareModal } from '../components/ShareModal';
import { RenameModal } from '../components/RenameModal';
import { MetricBadge } from '../components/MetricBadge';
import { AccuracyDisclaimer } from '../components/AccuracyDisclaimer';

interface SavedReportsPageProps {
  analyses: AnalysisRecord[];
  onNavigate: (page: string, id?: string) => void;
  onUpdateTitle: (id: string, newTitle: string) => void;
  onDeleteAnalysis: (id: string) => void;
}

export const SavedReportsPage: React.FC<SavedReportsPageProps> = ({
  analyses,
  onNavigate,
  onUpdateTitle,
  onDeleteAnalysis
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modals state
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = analyses.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.videoFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.players[0]?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || a.analysisType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono text-[10px] uppercase font-bold">
              Reports Library
            </span>
            <span className="text-xs text-slate-400">{analyses.length} Saved Analyses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mt-0.5">
            Saved Video Analysis Reports
          </h1>
          <p className="text-xs text-slate-400">
            Export PDF executive summaries, raw CSV telemetry, JSON data payloads, or generate public review links.
          </p>
        </div>

        <button
          onClick={() => onNavigate('upload')}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20"
        >
          + Analyze New Video
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl glass-card border-slate-800">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, video file, or player name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1" />
          {['all', 'shooting', 'movement', 'full_game'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                typeFilter === t
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Reports Table / Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-card border-slate-800 text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-600" />
            <div className="font-semibold text-slate-200 text-sm">No analysis reports found</div>
            <p className="text-xs text-slate-500">Try adjusting your search criteria or upload a new clip.</p>
          </div>
        ) : (
          filtered.map((analysis) => {
            const primary = analysis.players[0];
            return (
              <div
                key={analysis.id}
                className="p-4 rounded-xl glass-card glass-card-hover border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Info */}
                <div className="space-y-1.5 flex-1 min-w-[280px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-950 text-orange-400 font-mono text-[10px] uppercase font-bold border border-slate-800">
                      {analysis.analysisType.replace('_', ' ')}
                    </span>
                    <MetricBadge status={analysis.overallConfidenceStatus} confidence={analysis.overallConfidenceScore} />
                    <span className="text-[11px] text-slate-400 font-mono">
                      {analysis.uploadDate.substring(0, 16)}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-100 text-sm">{analysis.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>
                      Player: <strong className="text-slate-200">{primary?.name || 'Player'}</strong> (#{primary?.jerseyNumber || 1})
                    </span>
                    <span>•</span>
                    <span>
                      Duration: <strong className="text-slate-200">{analysis.videoDurationSec}s</strong> ({analysis.fps}fps)
                    </span>
                    <span>•</span>
                    <span>
                      Accuracy: <strong className="text-emerald-400">{analysis.shooting.shootingPercentage}% FG</strong> ({analysis.shooting.madeShots}/{analysis.shooting.numShots})
                    </span>
                    <span>•</span>
                    <span>
                      Form Score: <strong className="text-orange-400">{analysis.overallPerformanceScore}/100</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => onNavigate('review', analysis.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5 text-orange-400" />
                    <span>Review Video</span>
                  </button>

                  <button
                    onClick={() => onNavigate('analytics', analysis.id)}
                    className="px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>

                  {/* Export Menu */}
                  <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 gap-1">
                    <button
                      onClick={() => exportToPDF(analysis)}
                      className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-emerald-400 text-[11px] font-semibold flex items-center gap-1"
                      title="Export styled PDF report"
                    >
                      <FileDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => exportToCSV(analysis)}
                      className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-orange-400 text-[11px] font-semibold flex items-center gap-1"
                      title="Export CSV raw telemetry log"
                    >
                      <FileDown className="w-3.5 h-3.5 text-orange-400" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => exportToJSON(analysis)}
                      className="px-2 py-1 rounded hover:bg-slate-800 text-slate-300 hover:text-purple-400 text-[11px] font-semibold flex items-center gap-1"
                      title="Export complete JSON payload"
                    >
                      <FileDown className="w-3.5 h-3.5 text-purple-400" />
                      <span>JSON</span>
                    </button>
                  </div>

                  {/* Share */}
                  <button
                    onClick={() => {
                      setSelectedAnalysis(analysis);
                      setIsShareOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Generate shareable read-only link"
                  >
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                  </button>

                  {/* Rename */}
                  <button
                    onClick={() => {
                      setSelectedAnalysis(analysis);
                      setIsRenameOpen(true);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Rename session"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTargetId(analysis.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-rose-400 transition-colors"
                    title="Delete analysis session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <AccuracyDisclaimer />

      {/* Share Modal */}
      {selectedAnalysis && (
        <ShareModal
          analysis={selectedAnalysis}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* Rename Modal */}
      {selectedAnalysis && (
        <RenameModal
          currentTitle={selectedAnalysis.title}
          isOpen={isRenameOpen}
          onClose={() => setIsRenameOpen(false)}
          onSave={(newTitle) => onUpdateTitle(selectedAnalysis.id, newTitle)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl glass-card border-rose-500/40 bg-slate-900 shadow-2xl p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/15">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Confirm Permanent Deletion</h3>
                <p className="text-xs text-slate-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete this analysis session and associated tracking data from your account?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAnalysis(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Delete Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
