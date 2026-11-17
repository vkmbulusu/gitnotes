import React, { useState } from 'react';
import { Notebook, GitHubUser } from '../types';
import {
  Folder,
  FolderPlus,
  GitBranch,
  Lock,
  Search,
  Github,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  notebooks: Notebook[];
  activeNotebook: Notebook | null;
  onSelectNotebook: (notebook: Notebook) => void;
  onOpenNewNotebookModal: () => void;
  onOpenAuthModal: () => void;
  currentUser: GitHubUser | null;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notebooks,
  activeNotebook,
  onSelectNotebook,
  onOpenNewNotebookModal,
  onOpenAuthModal,
  currentUser,
  theme,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotebooks = notebooks.filter((nb) =>
    nb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    nb.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="w-64 flex-none h-full flex flex-col bg-apple-sidebarLight dark:bg-apple-sidebarDark border-r border-apple-borderLight dark:border-apple-borderDark select-none">
      {/* Mac Window Traffic Lights & App Title */}
      <div className="flex-none px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* macOS window controls */}
          <div className="flex items-center gap-1.5 group">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] cursor-pointer" />
          </div>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-800 transition"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? (
            <Moon className="w-3.5 h-3.5" />
          ) : (
            <Sun className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Notebooks Section Header */}
      <div className="flex-none px-4 py-2 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
          Notebooks (Git Repos)
        </span>
        <button
          type="button"
          onClick={onOpenNewNotebookModal}
          className="p-1 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-800 text-neutral-500 hover:text-amber-600 dark:hover:text-amber-400 transition"
          title="New Notebook Repository"
        >
          <FolderPlus className="w-4 h-4" />
        </button>
      </div>

      {/* Search Notebooks */}
      <div className="flex-none px-3 mb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notebooks..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 outline-none border border-transparent focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Notebooks List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {filteredNotebooks.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-neutral-400">
            No notebooks found.
          </div>
        ) : (
          filteredNotebooks.map((nb) => {
            const isSelected = activeNotebook?.id === nb.id;
            return (
              <button
                key={nb.id}
                type="button"
                onClick={() => onSelectNotebook(nb)}
                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 font-medium shadow-sm'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder
                    className={`w-4 h-4 flex-none ${
                      isSelected
                        ? 'text-amber-600 dark:text-amber-400 fill-amber-500/20'
                        : 'text-amber-500/70 group-hover:text-amber-600'
                    }`}
                  />
                  <div className="truncate">
                    <span className="truncate block font-medium">{nb.name}</span>
                    <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                      <span className="flex items-center gap-0.5">
                        <GitBranch className="w-2.5 h-2.5" />
                        {nb.defaultBranch}
                      </span>
                      {nb.isPrivate && (
                        <Lock className="w-2.5 h-2.5 text-neutral-400" />
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-none">
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-amber-200/70 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300'
                        : 'bg-neutral-200/50 dark:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {nb.notesCount}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* GitHub Account / Demo Profile Footer */}
      <div className="flex-none p-3 border-t border-apple-borderLight dark:border-apple-borderDark bg-neutral-50/50 dark:bg-apple-sidebarDark/90">
        <button
          type="button"
          onClick={onOpenAuthModal}
          className="w-full text-left p-2 rounded-xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/70 dark:bg-neutral-900/60 hover:bg-white dark:hover:bg-neutral-900 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.login}
                className="w-7 h-7 rounded-full border border-neutral-300 dark:border-neutral-700 object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-neutral-800 text-white flex items-center justify-center">
                <Github className="w-3.5 h-3.5" />
              </div>
            )}
            <div className="truncate">
              <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 truncate">
                {currentUser?.name || currentUser?.login || 'Sign in with GitHub'}
              </div>
              <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                {currentUser?.isDemo ? (
                  <span className="text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    Demo Mode
                  </span>
                ) : currentUser ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    @{currentUser.login}
                  </span>
                ) : (
                  <span>Click to connect</span>
                )}
              </div>
            </div>
          </div>

          <Github className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-white transition flex-none" />
        </button>
      </div>
    </aside>
  );
};
