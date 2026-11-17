import html2pdf from 'html2pdf.js';
import { Note, Notebook, PDFExportOptions } from '../types';
import { markdownToHtml } from './markdown';

export const DEFAULT_PDF_OPTIONS: PDFExportOptions = {
  margin: 'narrow',
  includeHeader: true,
  includeDate: true,
  includeNotebookTag: true,
  fontSize: 'standard',
  pageSize: 'a4',
};

/**
 * Convert margin preset to mm dimensions [top, left, bottom, right]
 */
export function getMarginValues(preset: PDFExportOptions['margin']): [number, number, number, number] {
  switch (preset) {
    case 'narrow':
      return [10, 12, 12, 12]; // Clean & narrow printable margins
    case 'compact':
      return [6, 8, 8, 8];
    case 'normal':
    default:
      return [18, 20, 20, 20];
  }
}

/**
 * Format date for document header
 */
function formatHeaderDate(isoDate?: string): string {
  const d = isoDate ? new Date(isoDate) : new Date();
  return d.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Generate a standalone clean printable HTML string with narrow margins
 */
export function buildPrintableHtml(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): string {
  const [top, left, bottom, right] = getMarginValues(options.margin);
  const htmlContent = markdownToHtml(note.content);

  const fontSizeClass =
    options.fontSize === 'small'
      ? 'text-[13px] leading-relaxed'
      : options.fontSize === 'large'
      ? 'text-[16px] leading-relaxed'
      : 'text-[14.5px] leading-relaxed';

  return `
    <div class="printable-document font-sans text-neutral-900 bg-white" style="max-width: 100%; margin: 0 auto; padding: 4px;">
      ${
        options.includeHeader
          ? `
        <header class="document-header pb-4 mb-5 border-b border-neutral-300" style="break-inside: avoid;">
          <div class="flex items-center justify-between text-xs text-neutral-500 mb-1">
            ${
              options.includeNotebookTag && notebook
                ? `<span class="notebook-badge uppercase font-medium tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    📂 ${notebook.name}
                  </span>`
                : '<span></span>'
            }
            ${
              options.includeDate
                ? `<time class="print-date text-neutral-400 font-mono text-[11px]">${formatHeaderDate(
                    note.updatedAt
                  )}</time>`
                : ''
            }
          </div>
          <h1 class="document-title text-2xl font-bold text-neutral-900 tracking-tight mt-1 mb-0">${
            note.title || 'Untitled Note'
          }</h1>
        </header>
      `
          : ''
      }

      <main class="printable-body prose prose-neutral max-w-none ${fontSizeClass}">
        ${htmlContent}
      </main>

      <footer class="document-footer mt-8 pt-3 border-t border-neutral-200 flex justify-between text-[10px] text-neutral-400 font-mono" style="break-inside: avoid;">
        <span>Apple Notes (Git Markdown)</span>
        <span>${note.path}</span>
      </footer>
    </div>
  `;
}

/**
 * Export note to downloadable PDF file using html2pdf.js with narrow margins
 */
export async function exportNoteToPDF(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): Promise<void> {
  const container = document.createElement('div');
  container.className = 'pdf-export-container';
  container.innerHTML = buildPrintableHtml(note, notebook, options);

  // Apply printing style adjustments for the offscreen rendering
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = options.pageSize === 'letter' ? '216mm' : '210mm';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#111827';
  container.style.zIndex = '-9999';

  document.body.appendChild(container);

  const [top, left, bottom, right] = getMarginValues(options.margin);
  const cleanFilename = (note.title || 'Note')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);

  const opt = {
    margin: [top, left, bottom, right],
    filename: `${cleanFilename || 'notes'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: options.pageSize,
      orientation: 'portrait' as const,
    },
    pagebreak: {
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.page-break-before',
      after: '.page-break-after',
    },
  };

  try {
    await html2pdf().set(opt).from(container).save();
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Trigger native print dialog with clean and narrow margins layout.
 * This utilizes the browser's native print engine which yields vector-sharp PDFs on Mac.
 */
export function printNoteClean(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): void {
  // Create an iframe to cleanly isolate print styles without UI clutter
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';

  document.body.appendChild(printFrame);

  const [top, left, bottom, right] = getMarginValues(options.margin);
  const printableHtml = buildPrintableHtml(note, notebook, options);

  const doc = printFrame.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title || 'Note'}</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: ${options.pageSize};
            margin: ${top}mm ${right}mm ${bottom}mm ${left}mm;
          }
          * {
            box-sizing: border-box;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            color: #1a1a1a;
            background: #ffffff;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          h1, h2, h3, h4 {
            color: #111;
            break-after: avoid;
            page-break-after: avoid;
            margin-top: 1.2em;
            margin-bottom: 0.4em;
          }
          h1 { font-size: 1.7rem; font-weight: 700; }
          h2 { font-size: 1.35rem; font-weight: 600; border-bottom: 1px solid #eaeaea; padding-bottom: 4px; }
          h3 { font-size: 1.15rem; font-weight: 600; }
          p {
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 0.85em;
          }
          ul, ol {
            padding-left: 1.4rem;
            margin-bottom: 0.85em;
            line-height: 1.6;
          }
          li {
            margin-bottom: 0.25em;
          }
          blockquote {
            margin: 1em 0;
            padding: 0.4em 1em;
            color: #4b5563;
            border-left: 3.5px solid #d49420;
            background-color: #fdfaf3;
            font-style: italic;
          }
          code {
            font-family: "SF Mono", Menlo, Monaco, monospace;
            font-size: 0.88em;
            background: #f3f4f6;
            padding: 2px 5px;
            border-radius: 4px;
            color: #b45309;
          }
          pre {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 10px 14px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-break: break-word;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          pre code {
            background: transparent;
            padding: 0;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            break-inside: avoid;
          }
          th, td {
            border: 1px solid #e5e7eb;
            padding: 6px 10px;
            text-align: left;
            font-size: 0.9em;
          }
          th {
            background: #f9fafb;
            font-weight: 600;
          }
          hr {
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 1.4em 0;
          }
          .notebook-badge {
            display: inline-block;
            font-size: 11px;
            font-weight: 600;
            color: #b45309;
            background: #fffbeb;
            border: 1px solid #fef3c7;
            padding: 2px 6px;
            border-radius: 4px;
          }
          .print-date {
            font-size: 11px;
            color: #6b7280;
            float: right;
          }
          .document-header {
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .document-footer {
            border-top: 1px solid #f3f4f6;
            margin-top: 24px;
            padding-top: 10px;
            font-size: 10px;
            color: #9ca3af;
            display: flex;
            justify-content: space-between;
          }
          /* Task list item styling */
          input[type="checkbox"] {
            margin-right: 6px;
            vertical-align: middle;
          }
        </style>
      </head>
      <body>
        ${printableHtml}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    printFrame.contentWindow?.focus();
    printFrame.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 2000);
  }, 250);
}
