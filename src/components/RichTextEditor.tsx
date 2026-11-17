import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import { markdownToHtml, htmlToMarkdown } from '../services/markdown';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  Minus,
} from 'lucide-react';

interface RichTextEditorProps {
  content: string; // Markdown source
  onChange: (newMarkdown: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  readOnly = false,
}) => {
  const isInternalUpdateRef = useRef(false);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Click and write your note here...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: markdownToHtml(content),
    onUpdate: ({ editor }) => {
      isInternalUpdateRef.current = true;
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
      setTimeout(() => {
        isInternalUpdateRef.current = false;
      }, 50);
    },
  });

  // Keep editor content in sync when incoming markdown prop changes from external source
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdateRef.current) return;

    const currentHtml = editor.getHTML();
    const incomingHtml = markdownToHtml(content);

    // Only update if meaningfully different to prevent cursor jumps
    if (htmlToMarkdown(currentHtml).trim() !== content.trim()) {
      editor.commands.setContent(incomingHtml, false);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="flex-1 flex items-center justify-center text-neutral-400">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-apple-editorDark">
      {/* Apple Notes Floating Formatting Bar */}
      <div className="flex-none px-4 py-2 border-b border-apple-borderLight dark:border-apple-borderDark bg-neutral-50/70 dark:bg-apple-sidebarDark/80 backdrop-blur-md flex items-center gap-1 flex-wrap select-none">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('bold')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Bold (Cmd+B)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('italic')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Italic (Cmd+I)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('strike')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Title / Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Subheading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('taskList')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Checklist / Task list"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('bulletList')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('orderedList')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-700 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('blockquote')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition ${
            editor.isActive('codeBlock')
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold'
              : 'text-neutral-600 dark:text-neutral-300'
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area (Click & Write) */}
      <div
        className="flex-1 overflow-y-auto px-10 py-8 cursor-text"
        onClick={() => {
          if (!editor.isFocused) {
            editor.chain().focus('end').run();
          }
        }}
      >
        <div className="max-w-3xl mx-auto min-h-full">
          <EditorContent editor={editor} className="min-h-[500px]" />
        </div>
      </div>
    </div>
  );
};
