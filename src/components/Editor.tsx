import React, { useState } from 'react';
import { Note, Notebook, EditorMode } from '../types';
import { EditorToolbar } from './EditorToolbar';
import { RichTextEditor } from './RichTextEditor';
import { MarkdownEditor } from './MarkdownEditor';
import { PDFExportModal } from './PDFExportModal';
import { CommitHistoryModal } from './CommitHistoryModal';
import { PenSquare } from 'lucide-react';

interface EditorProps {
  note: Note | null;
  notebook: Notebook | null;
  token?: string | null;
  onChangeContent: (content: string) => void;
  onCommit: () => Promise<void>;
  onDeleteNote: () => void;
  onCreateNote: () => void;
  isSaving: boolean;
}

export const Editor: React.FC<EditorProps> = ({
  note,
  notebook,
  token,
  onChangeContent,
  onCommit,
  onDeleteNote,
  onCreateNote,
  isSaving,
}) => {
  const [mode, setMode] = useState<EditorMode>('richtext');
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showCommitHistory, setShowCommitHistory] = useState(false);

  if (!note || !notebook) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-apple-editorLight dark:bg-apple-editorDark text-neutral-400 select-none p-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
          <PenSquare className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
          No Note Selected
        </h3>
        <p className="text-xs text-neutral-400 text-center max-w-sm mb-4">
          Select a note from the left or create a new markdown file to start writing.
        </p>
        <button
          type="button"
          onClick={onCreateNote}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-semibold shadow transition flex items-center gap-2"
        >
          <PenSquare className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white dark:bg-apple-editorDark">
      {/* Editor Top Toolbar with Toggle Switch & PDF Export */}
      <EditorToolbar
        note={note}
        notebook={notebook}
        mode={mode}
        onToggleMode={setMode}
        onCommit={onCommit}
        onOpenPDFModal={() => setShowPDFModal(true)}
        onOpenCommitHistory={() => setShowCommitHistory(true)}
        onDeleteNote={onDeleteNote}
        isSaving={isSaving}
      />

      {/* Main Click & Write Editor Area */}
      <div className="flex-1 overflow-hidden relative">
        {mode === 'richtext' ? (
          <RichTextEditor
            key={`rich-${note.id}`}
            content={note.content}
            onChange={onChangeContent}
          />
        ) : (
          <MarkdownEditor
            key={`md-${note.id}`}
            content={note.content}
            onChange={onChangeContent}
          />
        )}
      </div>

      {/* PDF Export Modal */}
      <PDFExportModal
        note={note}
        notebook={notebook}
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
      />

      {/* Commit History Modal */}
      <CommitHistoryModal
        note={note}
        notebook={notebook}
        token={token}
        isOpen={showCommitHistory}
        onClose={() => setShowCommitHistory(false)}
      />
    </div>
  );
};
