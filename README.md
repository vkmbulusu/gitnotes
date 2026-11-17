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

## ☁️ Deploying to Cloudflare Workers (`gitnotes.dev`)

GitNotes serves its Vite build as static assets, with a small Worker handling GitHub OAuth code exchange.

### Deploy with Wrangler
```bash
npm run build
npx wrangler deploy
```

### GitHub OAuth configuration
This project must be deployed as a Worker with Static Assets using the checked-in `wrangler.jsonc` (including `main` and the `ASSETS` binding), not as an assets-only Worker or a Pages project. In the Worker settings, add `GITHUB_CLIENT_SECRET` under **Settings → Variables and Secrets → Secrets**. Never put the secret in source code or a `VITE_` variable. The GitHub OAuth App's callback URL must be `https://gitnotes.dev/api/auth/callback`. The client ID is public; the client secret must remain server-side.

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
