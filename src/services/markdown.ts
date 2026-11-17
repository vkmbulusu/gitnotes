import { marked } from 'marked';
import TurndownService from 'turndown';

// Configure Marked for safe and clean HTML rendering
marked.setOptions({
  gfm: true,
  breaks: true,
});

// Configure Turndown for clean Markdown serialization
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
  strongDelimiter: '**',
});

// Add support for task lists in Turndown
turndownService.addRule('taskList', {
  filter: (node: HTMLElement) => {
    return (
      node.nodeName === 'LI' &&
      node.classList.contains('task-list-item')
    );
  },
  replacement: (_content: string, node: HTMLElement) => {
    const checkbox = node.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    const isChecked = checkbox?.checked || node.getAttribute('data-checked') === 'true';
    const text = node.textContent?.trim() || '';
    return `- [${isChecked ? 'x' : ' '}] ${text}\n`;
  },
});

/**
 * Extract a clean display title from Markdown content.
 * Prioritizes first `# Header`, or first non-empty line.
 */
export function extractTitle(markdown: string, fallback = 'New Note'): string {
  if (!markdown || !markdown.trim()) return fallback;
  const lines = markdown.split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    // Check if it's a markdown header
    const headerMatch = line.match(/^#{1,6}\s+(.+)$/);
    if (headerMatch && headerMatch[1]) {
      return headerMatch[1].trim();
    }
    // Return first clean text line
    return line.replace(/^[\*\-_\s>#]+/, '').trim() || fallback;
  }
  return fallback;
}

/**
 * Generate a clean 2-line snippet preview for note list,
 * stripping markdown formatting syntax.
 */
export function extractSnippet(markdown: string, titleToSkip?: string): string {
  if (!markdown) return 'No additional text';
  const lines = markdown.split('\n');
  const cleanedLines: string[] = [];

  for (const line of lines) {
    let clean = line
      .replace(/^#{1,6}\s+/, '') // headings
      .replace(/^[\*\-\+]\s+\[[ xX]\]\s+/, '') // task list
      .replace(/^[\*\-\+]\s+/, '') // bullets
      .replace(/^\d+\.\s+/, '') // numbered
      .replace(/^>\s+/, '') // quotes
      .replace(/\*\*([^*]+)\*\*/g, '$1') // bold
      .replace(/\*([^*]+)\*/g, '$1') // italic
      .replace(/`([^`]+)`/g, '$1') // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/<[^>]*>/g, '') // html tags
      .trim();

    if (clean) {
      if (titleToSkip && clean.toLowerCase() === titleToSkip.toLowerCase()) {
        continue; // skip the title line so preview shows the actual body
      }
      cleanedLines.push(clean);
      if (cleanedLines.length >= 2) break;
    }
  }

  if (cleanedLines.length === 0) return 'No additional text';
  return cleanedLines.join(' · ');
}

/**
 * Convert Markdown string to HTML for rich text editor.
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p></p>';
  try {
    const rawHtml = marked.parse(markdown) as string;
    return rawHtml;
  } catch (err) {
    console.error('Error parsing markdown:', err);
    return `<p>${escapeHtml(markdown)}</p>`;
  }
}

/**
 * Convert HTML from rich text editor back to clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === '<p></p>') return '';
  try {
    return turndownService.turndown(html);
  } catch (err) {
    console.error('Error converting HTML to markdown:', err);
    return html;
  }
}

/**
 * Generate a clean git-friendly filename from note title
 */
export function titleToFilename(title: string): string {
  const clean = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 50);

  return clean ? `${clean}.md` : `note-${Date.now().toString(36)}.md`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
