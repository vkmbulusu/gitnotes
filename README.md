# Chorus Notes — Apple Notes for Git

A modern web application with the iconic **Apple Notes** look and feel, where **each notebook is a Git repository** and **each note is a Markdown file (`.md`)**, synced directly with **GitHub**.

![Apple Notes Git](https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Markdown-Dark.svg)

---

## ✨ Features

- **Apple Notes Aesthetic**:
  - Classic 3-column macOS split view (Notebooks / Repositories ➔ Note Previews ➔ Active Editor).
  - Authentic Apple Notes typography, warm yellow/gold accent styling (`#e5a93c`), frosted glassmorphism, and macOS window controls.
  - Dark mode and light mode with seamless switching.
  - Interactive checklists that turn into completed tasks with custom circular checkmarks.

- **Dual Editor with Instant Toggle**:
  - **✏️ Rich Text Mode**: Full WYSIWYG editor powered by TipTap (Headings H1-H3, Bold, Italic, Strikethrough, Bullet Lists, Numbered Lists, Task Lists, Blockquotes, Code Blocks, Tables, Dividers).
  - **⚡️ Markdown Mode**: Clean raw Markdown editor with line numbers, live word and character counters, and markdown snippet helpers.
  - Seamless two-way bidirectional sync with zero data loss when toggling.

- **Git & GitHub Backed**:
  - **Every Notebook is a Git Repository**: Switch between your GitHub repositories as separate notebooks.
  - **Every Note is a `.md` File**: Standard plain-text Markdown files committed to your Git tree.
  - **Instant Zero-Setup Demo Mode**: Pre-loaded with sample notebooks and notes so you can explore immediately without entering credentials.
  - **GitHub Authentication**: Connect with a GitHub Personal Access Token (`repo` scope) or GitHub account.
  - **Git Operations**:
    - Automatic note file creation and deletion commits.
    - Status pill showing uncommitted changes, commit SHAs, and sync timestamps.
    - Interactive **Git Commit History** viewer for any note file.
    - Create new Git repository notebooks directly from the app (public or private).

- **Clean & Narrow Printable PDF Export**:
  - Clean publication-ready styling specifically tuned for printing or saving as PDF.
  - **Narrow Margins (10mm)** preset that maximizes readable space while preserving clean document borders.
  - Two export workflows:
    - **Print / Save via Browser**: Native browser print window with `@page { margin: 10mm 12mm; }` for vector-sharp PDF generation.
    - **Download PDF File**: Client-side PDF generation via `html2pdf.js` with customizable headers, dates, and paper formats (A4 / US Letter).

---

## 🚀 Quick Start

### 1. Start the Development Server

The application runs locally using Vite:

```bash
# If not already running:
npm run dev
```

Open your browser at:
👉 **[http://localhost:3000](http://localhost:3000)**

### 2. Connect Your GitHub Account

1. Click **Sign in with GitHub** or your profile card in the bottom-left corner of the sidebar.
2. Enter a GitHub Personal Access Token (PAT) with `repo` scope.
   - *Quick link provided in the dialog: `https://github.com/settings/tokens/new?scopes=repo`*
3. Or click **Try Demo Repositories** to use the built-in offline Git simulation.

### 3. Click and Write

- Click any note from the middle list to begin editing immediately.
- Use the segmented pill switch in the top toolbar to toggle between **Rich Text** and **Markdown**.
- Click the **Export PDF** button in the top toolbar to preview and print or download with clean, narrow margins.

---

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom Apple Notes color tokens and dark mode support
- **Rich Text Editor**: TipTap (StarterKit, TaskList, TaskItem, Table, Highlight, Link)
- **Markdown Engines**: `marked` (Markdown ➔ HTML) + `turndown` (HTML ➔ Markdown)
- **PDF Generation**: Native `@page` print stylesheet + `html2pdf.js`
- **Icons**: Lucide React (SF Symbols style)
- **API**: GitHub REST API v3 with Base64 UTF-8 serialization
