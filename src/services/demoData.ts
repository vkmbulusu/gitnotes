import { Notebook, Note, GitHubUser } from '../types';

export const DEMO_USER: GitHubUser = {
  login: 'apple-craftsman',
  name: 'Apple Notes User',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Writing notes in Markdown backed by Git repositories',
  publicRepos: 3,
  isDemo: true,
};

export const INITIAL_NOTEBOOKS: Notebook[] = [
  {
    id: 'demo/personal-vault',
    name: 'personal-vault',
    owner: 'apple-craftsman',
    fullName: 'apple-craftsman/personal-vault',
    defaultBranch: 'main',
    description: 'Personal notes, daily thoughts, and checklists',
    isPrivate: true,
    notesCount: 3,
    updatedAt: new Date().toISOString(),
    htmlUrl: 'https://github.com/apple-craftsman/personal-vault',
  },
  {
    id: 'demo/engineering-handbook',
    name: 'engineering-handbook',
    owner: 'apple-craftsman',
    fullName: 'apple-craftsman/engineering-handbook',
    defaultBranch: 'main',
    description: 'Architecture specifications, code snippets, and postmortems',
    isPrivate: false,
    notesCount: 2,
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    htmlUrl: 'https://github.com/apple-craftsman/engineering-handbook',
  },
  {
    id: 'demo/creative-ideas',
    name: 'creative-ideas',
    owner: 'apple-craftsman',
    fullName: 'apple-craftsman/creative-ideas',
    defaultBranch: 'main',
    description: 'Product concepts, sketches, and inspiration logs',
    isPrivate: false,
    notesCount: 1,
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    htmlUrl: 'https://github.com/apple-craftsman/creative-ideas',
  },
];

export const INITIAL_NOTES: Record<string, Note[]> = {
  'demo/personal-vault': [
    {
      id: 'welcome-apple-notes.md',
      notebookId: 'demo/personal-vault',
      path: 'welcome-apple-notes.md',
      title: 'Welcome to Apple Notes for Git',
      sha: '8f2a1b3c4d5e6f7a',
      updatedAt: new Date().toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      lastCommittedAt: new Date().toISOString(),
      lastCommitSha: '8f2a1b3',
      content: `# Welcome to Apple Notes for Git

This app brings the beloved **Apple Notes aesthetic** together with the freedom and safety of **Git repositories** and plain **Markdown files**.

Every notebook is a real Git repository, and each note is a standard \`.md\` file directly synced to your GitHub account!

---

### Key Features

- [x] **Apple Notes 3-Panel Experience**: Familiar folders, note previews, and instant click & write editor.
- [x] **Dual Editor**: Seamlessly toggle between **Rich Text (WYSIWYG)** and **Raw Markdown** with the pill switch above.
- [x] **Git-Backed Version Control**: Every change is versioned with Git commits and branch tracking.
- [x] **Clean & Narrow Printable PDF Export**: Export any note to print or save as PDF with tight, professional margins.
- [ ] Connect your GitHub account with a Personal Access Token or OAuth to sync your live repos!

---

### Formatting Showcase

You can mix **bold text**, *italic emphasis*, and \`inline code\` effortlessly.

> "Simplicity is the ultimate sophistication." — Leonardo da Vinci

#### Project Milestones:
1. Initialize local repository cache
2. Draft meeting agenda
3. Review pull request \`#42\`

\`\`\`javascript
// Clean code snippets are formatted beautifully
function syncToGit(note) {
  const commit = git.commit({
    message: \`Update note: \${note.title}\`,
    file: note.path,
  });
  return commit.sha;
}
\`\`\`

Enjoy distraction-free writing!
`,
    },
    {
      id: 'weekly-priorities.md',
      notebookId: 'demo/personal-vault',
      path: 'weekly-priorities.md',
      title: 'Weekly Priorities & Habits',
      sha: '1a2b3c4d5e6f7a8b',
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      lastCommittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      lastCommitSha: '1a2b3c4',
      content: `# Weekly Priorities & Habits

### Focus Goals for This Week
- [x] Finalize Q4 architecture review
- [x] Clean up desk setup & backup local drives
- [ ] Prepare pitch deck for new markdown sync protocol
- [ ] Schedule 1:1 check-ins with team

### Daily Routine Checklist
- [x] Morning coffee & review Git notifications
- [x] 45 minutes focused deep work sprint
- [ ] 30 minutes physical workout or outdoor walk
- [ ] Read 1 chapter before bed
`,
    },
    {
      id: 'coffee-tasting-notes.md',
      notebookId: 'demo/personal-vault',
      path: 'coffee-tasting-notes.md',
      title: 'Coffee Beans & Brew Recipes',
      sha: '9c8b7a6d5e4f3a2b',
      updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      lastCommittedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      lastCommitSha: '9c8b7a6',
      content: `# Coffee Beans & Brew Recipes

Notes on pour-overs, bean origins, and grind size settings.

### Ethiopian Yirgacheffe (Natural Process)
- **Roaster**: Blue Bottle
- **Notes**: Jasmine, bergamot, sweet blueberry
- **Dripper**: Hario V60
- **Dose**: 18g coffee to 300g water (1:16.6 ratio)
- **Grind**: Medium-fine (Commandate 22 clicks)
- **Water Temp**: 93°C
`,
    },
  ],
  'demo/engineering-handbook': [
    {
      id: 'architecture-principles.md',
      notebookId: 'demo/engineering-handbook',
      path: 'architecture-principles.md',
      title: 'System Architecture Principles',
      sha: '3c4d5e6f7a8b9c0d',
      updatedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      lastCommittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      lastCommitSha: '3c4d5e6',
      content: `# System Architecture Principles

Core tenets guiding our system design and software maintenance.

### 1. Plain Text as Universal Format
Data stored in Markdown survives proprietary platform closures and retains full git history forever.

### 2. Client-First Performance
Editing must feel instant:
- Local optimistic updates with zero UI lag
- Background debounced Git commits
- Offline-resilient local storage fallback

### 3. Clean Separation of Layers
- View: Pure React with Tailwind & Apple Notes UI tokens
- State: Local reactive store
- Sync: GitHub REST API v3
`,
    },
    {
      id: 'git-commit-convention.md',
      notebookId: 'demo/engineering-handbook',
      path: 'git-commit-convention.md',
      title: 'Git Commit Standards',
      sha: '4d5e6f7a8b9c0d1e',
      updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      lastCommittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      lastCommitSha: '4d5e6f7',
      content: `# Git Commit Standards

Standardizing commit messages across all notebooks:

- \`feat:\` New note or major section added
- \`docs:\` Content edits, typo fixes, or formatting changes
- \`chore:\` Note reorganization, tag updates, or file renaming
`,
    },
  ],
  'demo/creative-ideas': [
    {
      id: 'ambient-sound-app.md',
      notebookId: 'demo/creative-ideas',
      path: 'ambient-sound-app.md',
      title: 'Ambient Soundscape Generator Concept',
      sha: '5e6f7a8b9c0d1e2f',
      updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 140).toISOString(),
      lastCommittedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
      lastCommitSha: '5e6f7a8',
      content: `# Ambient Soundscape Generator Concept

An audio companion app designed for focused writing sessions.

### Sound Layers
- Rain on cafe window
- Subtle tape hiss / lo-fi vinyl crackle
- Distant thunder rumble
- Forest breeze through pines

### UI Mood
Minimalist dark theme with subtle particle animations synchronized with audio frequencies.
`,
    },
  ],
};
