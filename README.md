# GitNotes (`gitnotes.dev`)

> **The Git & Markdown Notebook** — Every notebook is a Git repository, every note is a Markdown file (`.md`).

A clean, distraction-free web application combining the intuitive simplicity of modern desktop note-taking with the permanence, version control, and privacy of Git repositories.

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF.svg)](https://vitejs.dev)
[![Deploy to Cloudflare](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020.svg)](https://pages.cloudflare.com)

---

## ✨ Features

- **Clean Minimalist 3-Pane Layout**:
  - Notebooks (Git Repositories) ➔ Note List with date stamps & previews ➔ Instant Click & Write Editor.
  - Native window controls, frosted glassmorphic sidebars, and dark/light mode toggle.
  - Interactive checklists that turn into completed tasks with custom circular checkmarks.

- **Dual Editor with Instant Toggle**:
  - **✏️ Rich Text Mode**: Full WYSIWYG editor powered by TipTap (Headings H1-H3, Bold, Italic, Strikethrough, Bullet Lists, Numbered Lists, Task Lists, Blockquotes, Code Blocks, Tables, Dividers).
  - **⚡️ Markdown Mode**: Clean raw Markdown editor with line numbers, live word and character counters, and quick markdown insertion helpers.
  - Seamless bidirectional synchronization between Markdown and Rich Text with zero data loss.

- **Git-Backed by Design**:
  - **Every Notebook is a Git Repository**: Works with GitHub, GitLab, Gitea, or self-hosted Git servers.
  - **Every Note is a Plain `.md` File**: Standard plain-text Markdown committed to your Git tree.
  - **Zero-Setup Demo Mode**: Pre-loaded with realistic sample notebooks so anyone can explore immediately without entering credentials.
  - **Commit History**: Inspect commit SHAs, author info, and timestamps for any note.
  - **New Notebook Repository**: Create new Git repositories (public or private) directly from the app.

- **Clean & Narrow Printable PDF Export**:
  - Publication-ready printable layout tuned with `@page { margin: 10mm 12mm; }`.
  - Margin presets: Clean & Narrow (10mm), Ultra-Compact (6mm), Standard (18mm).
  - Two export workflows:
    - **Native Browser Print**: Vector-sharp PDF saving via browser print engine.
    - **Direct Download**: 1-click `.pdf` download with custom headers, dates, and A4/US Letter sizing.

---

## 🚀 Quick Start

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build for production
npm run build
```

Open your browser at **http://localhost:3000**.

---

## ☁️ Deploying to Cloudflare Pages (`gitnotes.dev`)

Because GitNotes is a 100% client-side web application without a backend database, it can be deployed on Cloudflare Pages in less than 2 minutes:

### Method 1: Git Integration (Recommended)
1. Push this project to your GitHub/GitLab account.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com):
   - Go to **Workers & Pages** ➔ **Create application** ➔ **Pages** ➔ **Connect to Git**.
   - Select your repository.
   - Build settings:
     - **Framework preset**: `Vite`
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
3. Click **Save and Deploy**.
4. Go to **Custom domains** ➔ Enter `gitnotes.dev`.

### Method 2: Direct Wrangler CLI Deploy
```bash
npm run build
npx wrangler pages deploy dist --project-name gitnotes
```

---

## 📱 Mobile App (iOS & Android)

GitNotes is ready to be packaged as a native mobile application using **Capacitor**:

```bash
# Add native platforms
npm i @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init GitNotes dev.gitnotes.app --web-dir dist
npx cap add ios
npx cap add android

# Build and sync
npm run build
npx cap sync
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
