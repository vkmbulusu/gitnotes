import React, { useState } from 'react';
import { Notebook, Note } from '../types';
import { createRepository, saveNote } from '../services/github';
import { GitPullRequest, Folder, Lock, Globe, Check, Loader2, Sparkles, X } from 'lucide-react';

interface MigrateDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  demoNotebooks: Notebook[];
  demoNotes: Record<string, Note[]>;
  onMigrationComplete: () => Promise<void>;
}

export const MigrateDemoModal: React.FC<MigrateDemoModalProps> = ({
  isOpen,
  onClose,
  token,
  demoNotebooks,
  demoNotes,
  onMigrationComplete,
}) => {
  const [isMigrating, setIsMigrating] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMigrate = async () => {
    setIsMigrating(true);
    setError(null);

    try {
      for (const nb of demoNotebooks) {
        setCurrentStep(`Creating repository: ${nb.name}...`);
        
        // Clean name for GitHub repo
        const repoName = nb.name.toLowerCase().replace(/[^a-z0-9-_]/g, '-');
        
        let created;
        try {
          created = await createRepository(
            token,
            repoName,
            nb.description || 'Imported from GitNotes Demo',
            nb.isPrivate
          );
        } catch (err: any) {
          // If repo already exists, continue with existing
          console.warn(`Repo ${repoName} might already exist:`, err);
        }

        const notes = demoNotes[nb.id] || [];
        for (const note of notes) {
          setCurrentStep(`Committing ${note.path} to ${repoName}...`);
          try {
            await saveNote(
              token,
              created?.owner || 'user',
              repoName,
              note.path,
              note.content,
              undefined,
              `Initial commit: ${note.title} (imported via GitNotes)`
            );
          } catch (err) {
            console.warn(`Failed to commit ${note.path}:`, err);
          }
        }
      }

      setCurrentStep('Finalizing your notebooks...');
      await onMigrationComplete();
      onClose();
    } catch (err: any) {
      console.error('Migration failed:', err);
      setError(err.message || 'Failed to migrate repositories. You can skip and start fresh.');
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Import Demo Notebooks to GitHub?
              </h2>
              <p className="text-xs text-neutral-500">
                Turn your local demo notes into real Git repositories
              </p>
            </div>
          </div>
          {!isMigrating && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            We noticed you have notebook(s) in demo mode. We can automatically create these repositories in your GitHub account and commit your Markdown notes with their privacy settings.
          </p>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {demoNotebooks.map((nb) => {
              const notesCount = (demoNotes[nb.id] || []).length;
              return (
                <div
                  key={nb.id}
                  className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Folder className="w-4 h-4 text-amber-500 flex-none" />
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                      {nb.name}
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      ({notesCount} {notesCount === 1 ? 'note' : 'notes'})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono flex-none">
                    {nb.isPrivate ? (
                      <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/50">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400 bg-neutral-200/60 dark:bg-neutral-700 px-2 py-0.5 rounded">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {currentStep && (
            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-mono bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900">
              <Loader2 className="w-3.5 h-3.5 animate-spin flex-none" />
              <span className="truncate">{currentStep}</span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-2.5 rounded-xl border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900 flex items-center justify-between">
          <button
            type="button"
            disabled={isMigrating}
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-white transition"
          >
            Skip for now
          </button>

          <button
            type="button"
            disabled={isMigrating}
            onClick={handleMigrate}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow transition flex items-center gap-2"
          >
            {isMigrating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing to GitHub...</span>
              </>
            ) : (
              <>
                <GitPullRequest className="w-4 h-4" />
                <span>Import to GitHub</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
