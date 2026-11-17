import React, { useState } from 'react';
import { Note, Notebook, PDFExportOptions } from '../types';
import {
  DEFAULT_PDF_OPTIONS,
  exportNoteToPDF,
  printNoteClean,
  buildPrintableHtml,
} from '../services/pdf';
import { Printer, Download, X, Settings2, CheckCircle2, FileText } from 'lucide-react';

interface PDFExportModalProps {
  note: Note;
  notebook?: Notebook;
  isOpen: boolean;
  onClose: () => void;
}

export const PDFExportModal: React.FC<PDFExportModalProps> = ({
  note,
  notebook,
  isOpen,
  onClose,
}) => {
  const [options, setOptions] = useState<PDFExportOptions>(DEFAULT_PDF_OPTIONS);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await exportNoteToPDF(note, notebook, options);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Failed to generate PDF. You can also use the "Print / Save as PDF" option.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativePrint = () => {
    printNoteClean(note, notebook, options);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-apple-sidebarDark rounded-2xl shadow-2xl border border-apple-borderLight dark:border-apple-borderDark w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex-none px-6 py-4 border-b border-apple-borderLight dark:border-apple-borderDark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Export as Printable PDF
              </h2>
              <p className="text-xs text-neutral-500">
                Clean, publication-ready typography with narrow margins
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

        {/* Modal Body: Left Settings, Right Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Options Column */}
          <div className="w-full md:w-80 p-6 border-r border-apple-borderLight dark:border-apple-borderDark bg-neutral-50/50 dark:bg-apple-listDark/50 overflow-y-auto space-y-6">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
                Print Margins
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'narrow',
                    title: 'Clean & Narrow (10mm)',
                    desc: 'Optimal Apple Notes compact layout',
                    recommended: true,
                  },
                  {
                    id: 'compact',
                    title: 'Ultra-Compact (6mm)',
                    desc: 'Maximum printable area',
                  },
                  {
                    id: 'normal',
                    title: 'Standard (18mm)',
                    desc: 'Traditional letter document margins',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setOptions((prev) => ({
                        ...prev,
                        margin: item.id as PDFExportOptions['margin'],
                      }))
                    }
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-2.5 ${
                      options.margin === item.id
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200'
                        : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div className="mt-0.5">
                      {options.margin === item.id ? (
                        <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-600" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        {item.title}
                        {item.recommended && (
                          <span className="text-[10px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300 px-1.5 py-0.2 rounded font-medium">
                            Clean
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-0.5">
                        {item.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
                Page Format
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['a4', 'letter'] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setOptions((prev) => ({ ...prev, pageSize: size }))}
                    className={`py-2 px-3 text-xs rounded-lg border text-center font-medium uppercase transition ${
                      options.pageSize === size
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {size === 'a4' ? 'A4 Paper' : 'US Letter'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 block mb-2.5">
                Header Elements
              </label>
              <div className="space-y-2.5 text-xs text-neutral-700 dark:text-neutral-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeHeader}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeHeader: e.target.checked }))
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span>Document title header</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeDate}
                    onChange={(e) =>
                      setOptions((prev) => ({ ...prev, includeDate: e.target.checked }))
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span>Date & time watermark</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includeNotebookTag}
                    onChange={(e) =>
                      setOptions((prev) => ({
                        ...prev,
                        includeNotebookTag: e.target.checked,
                      }))
                    }
                    className="accent-amber-500 rounded"
                  />
                  <span>Repository notebook badge</span>
                </label>
              </div>
            </div>
          </div>

          {/* Printable Preview Pane */}
          <div className="flex-1 bg-neutral-100 dark:bg-neutral-950 p-6 flex flex-col items-center justify-start overflow-y-auto">
            <div className="text-[11px] font-medium text-neutral-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
              <span>Print Preview</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span>Narrow Margins Applied</span>
            </div>

            {/* Document sheet representation */}
            <div className="w-full max-w-xl bg-white text-neutral-900 shadow-xl rounded-sm p-8 min-h-[500px] border border-neutral-200">
              <div
                dangerouslySetInnerHTML={{
                  __html: buildPrintableHtml(note, notebook, options),
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex-none px-6 py-4 border-t border-apple-borderLight dark:border-apple-borderDark bg-neutral-50 dark:bg-apple-sidebarDark flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNativePrint}
              className="px-4 py-2 rounded-xl text-xs font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save via Browser</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isExporting}
              className="px-5 py-2 rounded-xl text-xs font-medium bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
