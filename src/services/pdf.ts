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

export function getMarginValues(preset: PDFExportOptions['margin']): [number, number, number, number] {
  switch (preset) {
    case 'narrow':
      return [10, 12, 10, 12]; // Clean & narrow printable margins in mm
    case 'compact':
      return [6, 8, 8, 8];
    case 'normal':
    default:
      return [18, 20, 20, 20];
  }
}

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
 * Returns self-contained styled HTML with all fonts, colors, and layouts baked in.
 * This guarantees zero blank renders regardless of external stylesheets.
 */
export function buildPrintableHtml(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): string {
  const htmlContent = markdownToHtml(note.content);
  const fontSize = options.fontSize === 'small' ? '13px' : options.fontSize === 'large' ? '16px' : '14.5px';

  return `
    <div class="printable-document" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; background: #ffffff; width: 100%; box-sizing: border-box; padding: 4px; font-size: ${fontSize}; line-height: 1.65;">
      <style>
        .printable-document h1, .printable-document h2, .printable-document h3 { color: #111827; font-weight: 700; margin-top: 1.2em; margin-bottom: 0.4em; break-after: avoid; }
        .printable-document h1 { font-size: 1.8em; border-bottom: 1.5px solid #e5e7eb; padding-bottom: 6px; }
        .printable-document h2 { font-size: 1.4em; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
        .printable-document h3 { font-size: 1.15em; }
        .printable-document p { margin-top: 0; margin-bottom: 0.85em; }
        .printable-document ul, .printable-document ol { padding-left: 1.5em; margin-top: 0; margin-bottom: 0.85em; }
        .printable-document li { margin-bottom: 0.25em; }
        .printable-document blockquote { border-left: 3.5px solid #e5a93c; background-color: #fefce8; padding: 8px 14px; margin: 1em 0; color: #4b5563; font-style: italic; border-radius: 0 4px 4px 0; }
        .printable-document code { font-family: ui-monospace, Menlo, Monaco, Consolas, monospace; font-size: 0.88em; background-color: #f3f4f6; padding: 2px 5px; border-radius: 4px; color: #b45309; }
        .printable-document pre { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px 14px; overflow-x: auto; white-space: pre-wrap; word-break: break-word; break-inside: avoid; }
        .printable-document pre code { background-color: transparent; padding: 0; color: #1e293b; }
        .printable-document table { width: 100%; border-collapse: collapse; margin: 1em 0; break-inside: avoid; }
        .printable-document th, .printable-document td { border: 1px solid #e5e7eb; padding: 6px 10px; text-align: left; }
        .printable-document th { background-color: #f9fafb; font-weight: 600; }
        .printable-document hr { border: none; border-top: 1px solid #e5e7eb; margin: 1.5em 0; }
        .printable-document input[type="checkbox"] { margin-right: 6px; vertical-align: middle; accent-color: #e5a93c; }
      </style>

      ${
        options.includeHeader
          ? `
        <header style="border-bottom: 1.5px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 18px; break-inside: avoid;">
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #6b7280; margin-bottom: 6px;">
            ${
              options.includeNotebookTag && notebook
                ? `<span style="font-weight: 600; color: #b45309; background: #fef3c7; border: 1px solid #fde68a; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">
                    📂 ${notebook.name}
                  </span>`
                : '<span></span>'
            }
            ${
              options.includeDate
                ? `<time style="font-family: monospace; color: #9ca3af;">${formatHeaderDate(note.updatedAt)}</time>`
                : ''
            }
          </div>
          <h1 style="margin: 4px 0 0 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.02em; border: none; padding: 0;">
            ${note.title || 'Untitled Note'}
          </h1>
        </header>
      `
          : ''
      }

      <main>
        ${htmlContent}
      </main>

      <footer style="margin-top: 32px; padding-top: 10px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #9ca3af; font-family: monospace; break-inside: avoid;">
        <span>GitNotes (gitnotes.dev)</span>
        <span>${note.path}</span>
      </footer>
    </div>
  `;
}

/**
 * Export note to downloadable PDF using html2pdf.js.
 * Mounts in a visible-to-renderer container to prevent html2canvas blank page clipping.
 */
export async function exportNoteToPDF(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS,
  sourceElement?: HTMLElement | null
): Promise<void> {
  const [top, left, bottom, right] = getMarginValues(options.margin);
  const cleanFilename = (note.title || 'Note')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40);

  const opt = {
    margin: [top, left, bottom, right],
    filename: `${cleanFilename || 'gitnote'}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
      backgroundColor: '#ffffff',
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

  // If source element from modal preview is passed and has content, use it directly!
  if (sourceElement && sourceElement.children.length > 0) {
    await html2pdf().set(opt).from(sourceElement).save();
    return;
  }

  // Otherwise, construct clean container in DOM with positive coordinates
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.top = '0';
  wrapper.style.left = '0';
  wrapper.style.width = options.pageSize === 'letter' ? '816px' : '794px';
  wrapper.style.backgroundColor = '#ffffff';
  wrapper.style.zIndex = '999999';
  wrapper.style.opacity = '0.01'; // Invisible to user but fully rendered by browser engine
  wrapper.style.pointerEvents = 'none';
  wrapper.innerHTML = buildPrintableHtml(note, notebook, options);

  document.body.appendChild(wrapper);

  try {
    // Small delay to ensure browser layout engine calculates all heights
    await new Promise((r) => setTimeout(r, 60));
    await html2pdf().set(opt).from(wrapper).save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

/**
 * Clean native print dialog. Injects a full-page print view and triggers native print.
 */
export function printNoteClean(
  note: Note,
  notebook?: Notebook,
  options: PDFExportOptions = DEFAULT_PDF_OPTIONS
): void {
  const [top, left, bottom, right] = getMarginValues(options.margin);
  const printableHtml = buildPrintableHtml(note, notebook, options);

  // Open an isolated print window
  const printWindow = window.open('', '_blank', 'width=850,height=900');
  if (!printWindow) {
    // Popup blocked: fallback to current window print
    window.print();
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${note.title || 'Note'} — GitNotes</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          @page {
            size: ${options.pageSize};
            margin: ${top}mm ${right}mm ${bottom}mm ${left}mm;
          }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 16px;
            background: #ffffff;
            color: #111827;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${printableHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }, 150);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
