import React, { useState } from 'react';
import { X, Check, Edit3 } from 'lucide-react';

interface RenameModalProps {
  currentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTitle: string) => void;
}

export const RenameModal: React.FC<RenameModalProps> = ({
  currentTitle,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(currentTitle);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl glass-card border-slate-700 bg-slate-900 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-orange-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Rename Analysis</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="text-xs text-slate-300 font-medium mb-1 block">Analysis Session Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-100 focus:border-orange-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (title.trim()) {
                onSave(title.trim());
                onClose();
              }
            }}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20"
          >
            Save Title
          </button>
        </div>
      </div>
    </div>
  );
};
