import React, { useState } from 'react';
import { FolderPlus, Lock, Globe, X } from 'lucide-react';

interface NewNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, isPrivate: boolean) => Promise<void>;
}

export const NewNotebookModal: React.FC<NewNotebookModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name
      .trim()
      .toLowerCase()
      .replace(/[^\w-]/g, '-');

    if (!cleanName) {
      setError('Please provide a repository name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onCreate(cleanName, description.trim(), isPrivate);
      setName('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create repository');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-apple-sidebarDark rounded-2xl shadow-2xl border border-apple-borderLight dark:border-apple-borderDark w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-apple-borderLight dark:border-apple-borderDark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                New Notebook Repository
              </h2>
              <p className="text-xs text-neutral-500">
                Creates a new Git repo for markdown notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notebook Name (Git Repository)
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. travel-journal, work-wiki, reading-list"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this notebook"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Repository Visibility
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  !isPrivate
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Globe className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">Public</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Visible to anyone
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                  isPrivate
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <Lock className="w-4 h-4 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold">Private</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Only you can access
                  </div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
            >
              {isSubmitting ? 'Creating Git Repo...' : 'Create Notebook'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
