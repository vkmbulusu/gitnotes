import React, { useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  CheckSquare,
  List,
  Quote,
  Code,
  Table as TableIcon,
  Link as LinkIcon,
} from 'lucide-react';

interface MarkdownEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate lines for line number display
  const lines = useMemo(() => {
    return content.split('\n');
  }, [content]);

  // Insert helper markdown snippets around selection
  const insertSnippet = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea || readOnly) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;

    const newContent =
      content.substring(0, start) +
      before +
      selectedText +
      after +
      content.substring(end);

    onChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  const wordCount = useMemo(() => {
    const trimmed = content.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
  }, [content]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-apple-editorDark">
      {/* Markdown Helper Action Bar */}
      <div className="flex-none px-4 py-2 border-b border-apple-borderLight dark:border-apple-borderDark bg-neutral-50/70 dark:bg-apple-sidebarDark/80 backdrop-blur-md flex items-center justify-between select-none">
        <div className="flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => insertSnippet('**', '**', 'bold text')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('*', '*', 'italic text')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet('# ', '', 'Heading 1')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Heading 1 (# )"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('## ', '', 'Heading 2')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Heading 2 (## )"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet('- [ ] ', '', 'Task item')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Checklist item (- [ ] )"
          >
            <CheckSquare className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('- ', '', 'List item')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Bullet list item (- )"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('> ', '', 'Quote')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Blockquote (> )"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

          <button
            type="button"
            onClick={() => insertSnippet('```\n', '\n```', 'code here')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Code Block"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              insertSnippet(
                '| Item | Status |\n|------|--------|\n| ',
                ' | Done |',
                'Task'
              )
            }
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Table"
          >
            <TableIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertSnippet('[', '](https://example.com)', 'link text')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
            title="Insert Link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-neutral-400 font-mono flex items-center gap-3">
          <span>{lines.length} lines</span>
          <span>{wordCount} words</span>
          <span>{content.length} chars</span>
        </div>
      </div>

      {/* Editor with Line Numbers */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers Column */}
        <div className="w-12 py-6 select-none bg-neutral-50/50 dark:bg-apple-sidebarDark/40 border-r border-apple-borderLight dark:border-apple-borderDark text-right pr-3 font-mono text-xs text-neutral-300 dark:text-neutral-600 overflow-hidden">
          {lines.map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>

        {/* Markdown Source Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readOnly}
          placeholder="# Type markdown here..."
          spellCheck={false}
          className="flex-1 h-full p-6 font-mono text-[14.5px] leading-6 resize-none outline-none bg-transparent text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
        />
      </div>
    </div>
  );
};
