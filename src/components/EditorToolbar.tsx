import React from 'react';
import { Note, Notebook, EditorMode } from '../types';
import {
  FileText,
  Code2,
  Printer,
  GitCommit,
  GitBranch,
  Save,
  Check,
  ExternalLink,
  History,
  Trash2,
} from 'lucide-react';

interface EditorToolbarProps {
  note: Note;
  notebook?: Notebook;
  mode: EditorMode;
  onToggleMode: (mode: EditorMode) => void;
  onCommit: () => void;
  onOpenPDFModal: () => void;
  onOpenCommitHistory: () => void;
  onDeleteNote: () => void;
  isSaving: boolean;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  note,
  notebook,
  mode,
  onToggleMode,
  onCommit,
  onOpenPDFModal,
  onOpenCommitHistory,
  onDeleteNote,
  isSaving,
}) => {
  return (
    <header className="app-toolbar flex-none px-6 py-2.5 border-b border-apple-borderLight dark:border-apple-borderDark bg-white/80 dark:bg-apple-sidebarDark/80 backdrop-blur-md flex items-center justify-between gap-4 select-none">
      {/* Left: Breadcrumbs & Git Branch */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
          <span className="text-neutral-600 dark:text-neutral-300 truncate max-w-[140px]">
            {notebook?.name || 'Notebook'}
          </span>
          <span>/</span>
          <span className="font-mono text-neutral-800 dark:text-neutral-200 truncate max-w-[160px]">
            {note.path}
          </span>
        </div>

        {notebook && (
          <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-mono">
            <GitBranch className="w-2.5 h-2.5" />
            {notebook.defaultBranch}
          </span>
        )}
      </div>

      {/* Middle: Apple Notes Segmented Toggle Switch (Rich Text <-> Markdown) */}
      <div className="segmented-control flex items-center bg-neutral-200/70 dark:bg-neutral-800/80 p-0.5 rounded-lg border border-neutral-300/40 dark:border-neutral-700/50 shadow-inner">
        <button
          type="button"
          onClick={() => onToggleMode('richtext')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            mode === 'richtext'
              ? 'bg-white dark:bg-neutral-700 text-amber-700 dark:text-amber-300 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Rich Text</span>
        </button>

        <button
          type="button"
          onClick={() => onToggleMode('markdown')}
          className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
            mode === 'markdown'
              ? 'bg-white dark:bg-neutral-700 text-amber-700 dark:text-amber-300 shadow-sm'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Markdown</span>
        </button>
      </div>

      {/* Right: Actions (Git Commit, PDF Export, History) */}
      <div className="flex items-center gap-2 flex-none">
        {/* Git Sync / Commit Status Button */}
        {note.isDirty ? (
          <button
            type="button"
            onClick={onCommit}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition disabled:opacity-50"
            title="Commit changes to Git"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSaving ? 'Committing...' : 'Commit to Git'}</span>
          </button>
        ) : (
          <div
            className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono px-2 py-1"
            title={`Git commit SHA: ${note.lastCommitSha || note.sha}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Synced ({note.lastCommitSha || note.sha?.slice(0, 7) || 'clean'})</span>
          </div>
        )}

        {/* Export PDF Button (Clean and narrow margins) */}
        <button
          type="button"
          onClick={onOpenPDFModal}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition"
          title="Export as Printable PDF (Narrow Margins)"
        >
          <Printer className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span className="hidden sm:inline">Export PDF</span>
        </button>

        {/* View Git History */}
        <button
          type="button"
          onClick={onOpenCommitHistory}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          title="View Git Commit History"
        >
          <History className="w-4 h-4" />
        </button>

        {/* View on GitHub */}
        {notebook?.htmlUrl && (
          <a
            href={`${notebook.htmlUrl}/blob/${notebook.defaultBranch}/${note.path}`}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            title="Open markdown file on GitHub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Delete note */}
        <button
          type="button"
          onClick={() => {
            if (
              confirm(
                `Delete "${note.title}"? This will delete ${note.path} from the Git repository.`
              )
            ) {
              onDeleteNote();
            }
          }}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
          title="Delete Note"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
