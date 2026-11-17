import React, { useState, useEffect } from 'react';
import { Note, Notebook, GitCommit } from '../types';
import { getCommitHistory } from '../services/github';
import { GitBranch, GitCommit as GitCommitIcon, X, ExternalLink, Clock, User } from 'lucide-react';

interface CommitHistoryModalProps {
  note: Note;
  notebook?: Notebook;
  token?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommitHistoryModal: React.FC<CommitHistoryModalProps> = ({
  note,
  notebook,
  token,
  isOpen,
  onClose,
}) => {
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !notebook) return;

    if (!token) {
      // Demo commit history
      setCommits([
        {
          sha: note.sha || '8f2a1b3c4d5e',
          message: `Update note: ${note.title}`,
          author: 'apple-craftsman',
          date: note.updatedAt || new Date().toISOString(),
          htmlUrl: `https://github.com/${notebook.fullName}/commit/${note.sha}`,
        },
        {
          sha: '1b2c3d4e5f6a',
          message: `Initial commit: ${note.path}`,
          author: 'apple-craftsman',
          date: note.createdAt || new Date(Date.now() - 3600000 * 24).toISOString(),
          htmlUrl: `https://github.com/${notebook.fullName}/commit/1b2c3d4`,
        },
      ]);
      return;
    }

    setLoading(true);
    getCommitHistory(token, notebook.owner, notebook.name, note.path)
      .then((data) => setCommits(data))
      .catch((err) => console.error('Failed to load commits:', err))
      .finally(() => setLoading(false));
  }, [isOpen, note, notebook, token]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-apple-sidebarDark rounded-2xl shadow-2xl border border-apple-borderLight dark:border-apple-borderDark w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-none px-6 py-4 border-b border-apple-borderLight dark:border-apple-borderDark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Git Commit History
              </h2>
              <p className="text-xs text-neutral-500 font-mono truncate max-w-xs">
                {note.path}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Commits */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-sm text-neutral-400">
              Loading commits from GitHub...
            </div>
          ) : commits.length === 0 ? (
            <div className="text-center py-12 text-sm text-neutral-400">
              No commit history found yet.
            </div>
          ) : (
            commits.map((commit) => (
              <div
                key={commit.sha}
                className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/40 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 transition group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 text-neutral-400 group-hover:text-amber-500 transition">
                      <GitCommitIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                        {commit.message}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {commit.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(commit.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-400">
                      {commit.sha.slice(0, 7)}
                    </span>
                    {commit.htmlUrl && (
                      <a
                        href={commit.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-neutral-400 hover:text-amber-500 p-1 transition"
                        title="View commit on GitHub"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
