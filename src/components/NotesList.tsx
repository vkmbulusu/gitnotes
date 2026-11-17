import React, { useState } from 'react';
import { Note, Notebook } from '../types';
import { extractSnippet } from '../services/markdown';
import {
  PenSquare,
  Search,
  Trash2,
  GitCommit,
  Check,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface NotesListProps {
  notes: Note[];
  activeNote: Note | null;
  activeNotebook: Notebook | null;
  onSelectNote: (note: Note) => void;
  onCreateNote: () => void;
  onDeleteNote: (note: Note) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  notes,
  activeNote,
  activeNotebook,
  onSelectNote,
  onCreateNote,
  onDeleteNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.path.toLowerCase().includes(q)
    );
  });

  const formatNoteDate = (isoDate?: string): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-80 flex-none h-full flex flex-col bg-apple-listLight dark:bg-apple-listDark border-r border-apple-borderLight dark:border-apple-borderDark select-none">
      {/* Header with Notebook title & New Note Action */}
      <div className="flex-none px-4 pt-3.5 pb-2 flex items-center justify-between">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
            {activeNotebook?.name || 'Notes'}
          </h2>
          <p className="text-[11px] text-neutral-400">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'} (.md)
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateNote}
          className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm transition"
          title="New Note (Create Markdown File)"
        >
          <PenSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Search Notes in current notebook */}
      <div className="flex-none px-3 py-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in notebook..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 outline-none border border-transparent focus:border-amber-500/40"
          />
        </div>
      </div>

      {/* Notes List Cards */}
      <div className="flex-1 overflow-y-auto px-2 py-1 space-y-1">
        {filteredNotes.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-400">
            {searchQuery ? (
              <span>No notes match "{searchQuery}"</span>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
                <span>No notes in this repository.</span>
                <button
                  type="button"
                  onClick={onCreateNote}
                  className="mt-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                >
                  Create your first note
                </button>
              </div>
            )}
          </div>
        ) : (
          filteredNotes.map((note) => {
            const isSelected = activeNote?.id === note.id;
            const snippet = extractSnippet(note.content, note.title);

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note)}
                className={`group relative p-3 rounded-xl cursor-pointer transition border text-left ${
                  isSelected
                    ? 'bg-[#faecd1] dark:bg-[#342711] border-amber-300 dark:border-amber-700/60 shadow-sm'
                    : 'bg-white/60 dark:bg-neutral-900/40 border-neutral-200/50 dark:border-neutral-800/40 hover:bg-white dark:hover:bg-neutral-900'
                }`}
              >
                {/* Title & Date */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3
                    className={`text-xs font-semibold truncate ${
                      isSelected
                        ? 'text-amber-950 dark:text-amber-100'
                        : 'text-neutral-900 dark:text-white'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </h3>

                  <span className="text-[10px] text-neutral-400 flex-none font-mono">
                    {formatNoteDate(note.updatedAt)}
                  </span>
                </div>

                {/* 2-line snippet preview */}
                <p
                  className={`text-[11px] line-clamp-2 leading-relaxed ${
                    isSelected
                      ? 'text-amber-900/80 dark:text-amber-200/70'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {snippet}
                </p>

                {/* Git Metadata & Delete Action footer */}
                <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
                  <div className="flex items-center gap-1.5">
                    {note.isDirty ? (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Uncommitted
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-neutral-400">
                        <GitCommit className="w-2.5 h-2.5" />
                        {note.lastCommitSha || note.sha?.slice(0, 7) || 'git'}
                      </span>
                    )}
                  </div>

                  {/* Delete note button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm(
                          `Delete "${note.title}"? This will delete ${note.path} from the Git repository.`
                        )
                      ) {
                        onDeleteNote(note);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 rounded transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
