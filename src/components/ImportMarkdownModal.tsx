import React, { useRef, useState } from 'react';
import { FolderOpen, Upload, X } from 'lucide-react';

interface ImportMarkdownModalProps {
  isOpen: boolean;
  branches: string[];
  defaultBranch: string;
  isImporting: boolean;
  onClose: () => void;
  onImport: (files: File[], branch: string, folder: string) => Promise<void>;
}

export const ImportMarkdownModal: React.FC<ImportMarkdownModalProps> = ({
  isOpen,
  branches,
  defaultBranch,
  isImporting,
  onClose,
  onImport,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [branch, setBranch] = useState(defaultBranch);
  const [folder, setFolder] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const close = () => {
    setFiles([]);
    setFolder('');
    setBranch(defaultBranch);
    onClose();
  };

  const importFiles = async () => {
    if (!files.length || !branch) return;
    await onImport(files, branch, folder);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div>
            <h2 className="text-sm font-semibold text-neutral-900 dark:text-white">Import Markdown files</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Choose where these files should go.</p>
          </div>
          <button type="button" onClick={close} disabled={isImporting} className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="Close import dialog">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Branch</span>
            <select
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              disabled={isImporting || branches.length === 0}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 outline-none focus:border-amber-500"
            >
              {branches.map((name) => <option key={name} value={name}>{name}</option>)}
            </select>
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Folder path <span className="font-normal text-neutral-400">(optional)</span></span>
            <input
              value={folder}
              onChange={(event) => setFolder(event.target.value)}
              placeholder="e.g. meeting-notes/2026"
              disabled={isImporting}
              className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:border-amber-500"
            />
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept=".md,.markdown,text/markdown"
            multiple
            className="hidden"
            onChange={(event) => setFiles(Array.from(event.currentTarget.files || []))}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-3 text-sm text-neutral-600 dark:text-neutral-300 hover:border-amber-500 hover:text-amber-600 transition disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            {files.length ? `${files.length} file(s) selected` : 'Choose .md or .markdown files'}
          </button>
          {files.length > 0 && (
            <p className="text-[11px] text-neutral-500 truncate">{files.map((file) => file.name).join(', ')}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 bg-neutral-50 dark:bg-neutral-950/50 border-t border-neutral-200 dark:border-neutral-800">
          <button type="button" onClick={close} disabled={isImporting} className="px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={importFiles} disabled={isImporting || !files.length || !branch} className="px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
            <Upload className="w-3.5 h-3.5" />
            {isImporting ? 'Importing…' : 'Import files'}
          </button>
        </div>
      </div>
    </div>
  );
};
