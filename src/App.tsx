import React, { useState, useEffect, useRef } from 'react';
import { Notebook, Note, GitHubUser } from './types';
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  getStoredTheme,
  setStoredTheme,
  getDemoNotebooks,
  saveDemoNotebooks,
  getDemoNotes,
  saveDemoNotes,
  getActiveNotebookId,
  setActiveNotebookId,
  getActiveNoteId,
  setActiveNoteId,
} from './services/storage';
import {
  verifyToken,
  listRepositories,
  createRepository,
  listMarkdownNotes,
  getNoteContent,
  saveNote,
  deleteNote,
} from './services/github';
import { extractTitle } from './services/markdown';
import { Sidebar } from './components/Sidebar';
import { NotesList } from './components/NotesList';
import { Editor } from './components/Editor';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { NewNotebookModal } from './components/NewNotebookModal';
import { MigrateDemoModal } from './components/MigrateDemoModal';
import { DEMO_USER } from './services/demoData';

export function App() {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(getStoredUser());
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme());

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewNotebookModal, setShowNewNotebookModal] = useState(false);
  const [showMigrateModal, setShowMigrateModal] = useState(false);

  // Responsive & Sidebar Toggle State
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mobileView, setMobileView] = useState<'notebooks' | 'notes' | 'editor'>('editor');

  // Apply theme to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    setStoredTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const toggleSidebar = () => {
    setIsSidebarVisible((prev) => !prev);
  };

  // Initial load
  useEffect(() => {
    if (token) {
      verifyToken(token)
        .then((user) => {
          setCurrentUser(user);
          setStoredUser(user);
          loadGitHubNotebooks(token);
        })
        .catch((err) => {
          console.warn('Stored token invalid, falling back to demo mode:', err);
          loadDemoEnvironment();
        });
    } else {
      loadDemoEnvironment();
    }
  }, [token]);

  const loadDemoEnvironment = () => {
    setCurrentUser(DEMO_USER);
    setStoredUser(DEMO_USER);
    const demoNbs = getDemoNotebooks();
    const demoNotesMap = getDemoNotes();

    const enriched = demoNbs.map((nb) => ({
      ...nb,
      notesCount: (demoNotesMap[nb.id] || []).length,
    }));

    setNotebooks(enriched);

    const savedNbId = getActiveNotebookId();
    const selectedNb = enriched.find((nb) => nb.id === savedNbId) || enriched[0] || null;
    setActiveNotebook(selectedNb);

    if (selectedNb) {
      const nbNotes = demoNotesMap[selectedNb.id] || [];
      setNotes(nbNotes);

      const savedNoteId = getActiveNoteId();
      const selectedNote = nbNotes.find((n) => n.id === savedNoteId) || nbNotes[0] || null;
      setActiveNote(selectedNote);
    }
  };

  const loadGitHubNotebooks = async (authToken: string) => {
    try {
      const repos = await listRepositories(authToken);
      setNotebooks(repos);

      const savedNbId = getActiveNotebookId();
      const selectedNb = repos.find((nb) => nb.id === savedNbId) || repos[0] || null;
      setActiveNotebook(selectedNb);
    } catch (err) {
      console.error('Failed to load GitHub repos:', err);
    }
  };

  // Load notes whenever active notebook changes
  useEffect(() => {
    if (!activeNotebook) {
      setNotes([]);
      setActiveNote(null);
      return;
    }

    setActiveNotebookId(activeNotebook.id);

    if (currentUser?.isDemo || !token) {
      const demoNotesMap = getDemoNotes();
      const currentNotes = demoNotesMap[activeNotebook.id] || [];
      setNotes(currentNotes);
      const savedNoteId = getActiveNoteId();
      const selected = currentNotes.find((n) => n.id === savedNoteId) || currentNotes[0] || null;
      setActiveNote(selected);
      return;
    }

    // Load live notes from GitHub
    let isSubscribed = true;
    listMarkdownNotes(
      token,
      activeNotebook.owner,
      activeNotebook.name,
      activeNotebook.defaultBranch
    ).then(async (mdNotes) => {
      if (!isSubscribed) return;

      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebook.id ? { ...nb, notesCount: mdNotes.length } : nb
        )
      );

      setNotes(mdNotes);

      if (mdNotes.length > 0) {
        const savedNoteId = getActiveNoteId();
        const initialNote = mdNotes.find((n) => n.id === savedNoteId) || mdNotes[0];

        try {
          const { content, sha } = await getNoteContent(
            token,
            activeNotebook.owner,
            activeNotebook.name,
            initialNote.path,
            activeNotebook.defaultBranch
          );
          if (isSubscribed) {
            const enrichedNote = {
              ...initialNote,
              content,
              sha,
              title: extractTitle(content, initialNote.path),
            };
            setActiveNote(enrichedNote);
            setNotes((prevNotes) =>
              prevNotes.map((n) => (n.id === initialNote.id ? enrichedNote : n))
            );
          }
        } catch (err) {
          console.error('Failed to fetch initial note content:', err);
          if (isSubscribed) setActiveNote(initialNote);
        }
      } else {
        setActiveNote(null);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [activeNotebook, token, currentUser?.isDemo]);

  // Note Selection
  const handleSelectNote = async (note: Note) => {
    setActiveNoteId(note.id);
    setMobileView('editor'); // On mobile: navigate to editor

    if (!note.content && token && activeNotebook && !currentUser?.isDemo) {
      try {
        const { content, sha } = await getNoteContent(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          note.path,
          activeNotebook.defaultBranch
        );
        const enriched = {
          ...note,
          content,
          sha,
          title: extractTitle(content, note.path),
        };
        setActiveNote(enriched);
        setNotes((prev) => prev.map((n) => (n.id === note.id ? enriched : n)));
        return;
      } catch (err) {
        console.error('Failed to load note content:', err);
      }
    }

    setActiveNote(note);
  };

  const handleSelectNotebook = (nb: Notebook) => {
    setActiveNotebook(nb);
    setMobileView('notes'); // On mobile: navigate to notes list
  };

  // Content Change
  const handleChangeContent = (newContent: string) => {
    if (!activeNote || !activeNotebook) return;

    const newTitle = extractTitle(newContent, activeNote.path);
    const updatedNote: Note = {
      ...activeNote,
      content: newContent,
      title: newTitle,
      updatedAt: new Date().toISOString(),
      isDirty: true,
      syncStatus: 'dirty',
    };

    setActiveNote(updatedNote);
    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === activeNote.id ? updatedNote : n))
    );

    if (currentUser?.isDemo || !token) {
      const demoNotesMap = getDemoNotes();
      const nbNotes = demoNotesMap[activeNotebook.id] || [];
      const updatedList = nbNotes.map((n) =>
        n.id === updatedNote.id ? updatedNote : n
      );
      demoNotesMap[activeNotebook.id] = updatedList;
      saveDemoNotes(demoNotesMap);
    }
  };

  // Commit changes to Git repository
  const handleCommit = async () => {
    if (!activeNote || !activeNotebook) return;

    setIsSaving(true);
    try {
      if (currentUser?.isDemo || !token) {
        await new Promise((res) => setTimeout(res, 400));
        const newSha = Math.random().toString(16).slice(2, 10);
        const cleanNote: Note = {
          ...activeNote,
          sha: newSha,
          lastCommitSha: newSha.slice(0, 7),
          lastCommittedAt: new Date().toISOString(),
          isDirty: false,
          syncStatus: 'synced',
        };
        setActiveNote(cleanNote);
        setNotes((prev) =>
          prev.map((n) => (n.id === cleanNote.id ? cleanNote : n))
        );

        const demoNotesMap = getDemoNotes();
        demoNotesMap[activeNotebook.id] = (demoNotesMap[activeNotebook.id] || []).map(
          (n) => (n.id === cleanNote.id ? cleanNote : n)
        );
        saveDemoNotes(demoNotesMap);
        return;
      }

      const result = await saveNote(
        token,
        activeNotebook.owner,
        activeNotebook.name,
        activeNote.path,
        activeNote.content,
        activeNote.sha,
        undefined,
        activeNotebook.defaultBranch
      );

      const committedNote: Note = {
        ...activeNote,
        sha: result.sha,
        lastCommitSha: result.commitSha.slice(0, 7),
        lastCommittedAt: new Date().toISOString(),
        isDirty: false,
        syncStatus: 'synced',
      };

      setActiveNote(committedNote);
      setNotes((prev) =>
        prev.map((n) => (n.id === committedNote.id ? committedNote : n))
      );
    } catch (err: any) {
      console.error('Failed to commit note to GitHub:', err);
      alert(`Git commit failed: ${err.message || 'Please check repository permissions.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Create New Note
  const handleCreateNote = async () => {
    if (!activeNotebook) return;

    const baseTitle = 'New Note';
    const timestamp = Date.now().toString(36).slice(-4);
    const filename = `note-${timestamp}.md`;
    const initialContent = `# ${baseTitle}\n\nClick here and write your thoughts...`;

    const newNote: Note = {
      id: filename,
      notebookId: activeNotebook.id,
      path: filename,
      title: baseTitle,
      content: initialContent,
      sha: 'initial',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      isDirty: true,
      syncStatus: 'dirty',
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setActiveNote(newNote);
    setActiveNoteId(newNote.id);
    setMobileView('editor'); // On mobile: view editor

    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === activeNotebook.id
          ? { ...nb, notesCount: (nb.notesCount || 0) + 1 }
          : nb
      )
    );

    if (currentUser?.isDemo || !token) {
      const demoNotesMap = getDemoNotes();
      demoNotesMap[activeNotebook.id] = updatedNotes;
      saveDemoNotes(demoNotesMap);
    } else {
      try {
        const result = await saveNote(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          newNote.path,
          newNote.content,
          undefined,
          `Create note: ${newNote.title}`,
          activeNotebook.defaultBranch
        );
        const persistedNote = {
          ...newNote,
          sha: result.sha,
          lastCommitSha: result.commitSha.slice(0, 7),
          isDirty: false,
          syncStatus: 'synced' as const,
        };
        setActiveNote(persistedNote);
        setNotes((prev) =>
          prev.map((n) => (n.id === newNote.id ? persistedNote : n))
        );
      } catch (err) {
        console.error('Failed to initialize note file on GitHub:', err);
      }
    }
  };

  // Delete Note
  const handleDeleteNote = async (noteToDelete?: Note) => {
    const target = noteToDelete || activeNote;
    if (!target || !activeNotebook) return;

    const remainingNotes = notes.filter((n) => n.id !== target.id);
    setNotes(remainingNotes);

    if (activeNote?.id === target.id) {
      setActiveNote(remainingNotes[0] || null);
    }

    setNotebooks((prev) =>
      prev.map((nb) =>
        nb.id === activeNotebook.id
          ? { ...nb, notesCount: Math.max(0, (nb.notesCount || 1) - 1) }
          : nb
      )
    );

    if (currentUser?.isDemo || !token) {
      const demoNotesMap = getDemoNotes();
      demoNotesMap[activeNotebook.id] = remainingNotes;
      saveDemoNotes(demoNotesMap);
    } else {
      try {
        await deleteNote(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          target.path,
          target.sha,
          activeNotebook.defaultBranch
        );
      } catch (err: any) {
        console.error('Failed to delete note from GitHub:', err);
        alert(`Failed to delete note from Git: ${err.message}`);
      }
    }
  };

  // Create New Notebook
  const handleCreateNotebook = async (
    name: string,
    description: string,
    isPrivate: boolean
  ) => {
    if (currentUser?.isDemo || !token) {
      const newNb: Notebook = {
        id: `demo/${name}`,
        name,
        owner: 'gitnotes-author',
        fullName: `gitnotes-author/${name}`,
        defaultBranch: 'main',
        description: description || 'New notebook repository',
        isPrivate,
        notesCount: 1,
        updatedAt: new Date().toISOString(),
        htmlUrl: `https://github.com/gitnotes-author/${name}`,
      };

      const initialNote: Note = {
        id: 'welcome.md',
        notebookId: newNb.id,
        path: 'welcome.md',
        title: `Welcome to ${name}`,
        sha: 'init123',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastCommitSha: 'init123',
        content: `# Welcome to ${name}\n\nThis is your new Git-backed notebook.\n\n- [ ] Add your first checklist item\n- [ ] Toggle between Rich Text and Markdown\n- [ ] Print or export as PDF\n`,
      };

      const updatedNotebooks = [newNb, ...notebooks];
      setNotebooks(updatedNotebooks);
      saveDemoNotebooks(updatedNotebooks);

      const demoNotesMap = getDemoNotes();
      demoNotesMap[newNb.id] = [initialNote];
      saveDemoNotes(demoNotesMap);

      setActiveNotebook(newNb);
      setNotes([initialNote]);
      setActiveNote(initialNote);
      setMobileView('editor');
      return;
    }

    const created = await createRepository(token, name, description, isPrivate);
    const updatedNotebooks = [created, ...notebooks];
    setNotebooks(updatedNotebooks);
    setActiveNotebook(created);
    setMobileView('notes');
  };

  const handleLoginSuccess = (newToken: string, user: GitHubUser) => {
    setToken(newToken);
    setStoredToken(newToken);
    setCurrentUser(user);
    setStoredUser(user);
    loadGitHubNotebooks(newToken);

    // Check if user has demo notebooks to offer migration
    const demoNbs = getDemoNotebooks();
    if (demoNbs.length > 0) {
      setShowMigrateModal(true);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStoredToken(null);
    loadDemoEnvironment();
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-apple-grayBg dark:bg-apple-sidebarDark font-sans relative">
      {/* Column 1: Notebooks Sidebar */}
      <div
        className={`${
          mobileView === 'notebooks' ? 'flex w-full' : 'hidden'
        } md:flex ${
          isSidebarVisible ? 'md:w-64' : 'md:hidden'
        } flex-none h-full transition-all`}
      >
        <Sidebar
          notebooks={notebooks}
          activeNotebook={activeNotebook}
          onSelectNotebook={handleSelectNotebook}
          onOpenNewNotebookModal={() => setShowNewNotebookModal(true)}
          onOpenAuthModal={() => setShowAuthModal(true)}
          currentUser={currentUser}
          theme={theme}
          onToggleTheme={toggleTheme}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Column 2: Notes List */}
      <div
        className={`${
          mobileView === 'notes' ? 'flex w-full' : 'hidden'
        } md:flex md:w-80 flex-none h-full`}
      >
        <NotesList
          notes={notes}
          activeNote={activeNote}
          activeNotebook={activeNotebook}
          onSelectNote={handleSelectNote}
          onCreateNote={handleCreateNote}
          onDeleteNote={handleDeleteNote}
          onBackToNotebooks={() => setMobileView('notebooks')}
          onToggleSidebar={toggleSidebar}
          isSidebarVisible={isSidebarVisible}
        />
      </div>

      {/* Column 3: Active Note Editor */}
      <div
        className={`${
          mobileView === 'editor' ? 'flex w-full' : 'hidden'
        } md:flex flex-1 h-full`}
      >
        <Editor
          note={activeNote}
          notebook={activeNotebook}
          token={token}
          onChangeContent={handleChangeContent}
          onCommit={handleCommit}
          onDeleteNote={handleDeleteNote}
          onCreateNote={handleCreateNote}
          isSaving={isSaving}
          onBackToNotes={() => setMobileView('notes')}
          onToggleSidebar={toggleSidebar}
          isSidebarVisible={isSidebarVisible}
        />
      </div>

      {/* Modals */}
      <GitHubAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onUseDemoMode={loadDemoEnvironment}
      />

      <NewNotebookModal
        isOpen={showNewNotebookModal}
        onClose={() => setShowNewNotebookModal(false)}
        onCreate={handleCreateNotebook}
      />

      {token && (
        <MigrateDemoModal
          isOpen={showMigrateModal}
          onClose={() => setShowMigrateModal(false)}
          token={token}
          demoNotebooks={getDemoNotebooks()}
          demoNotes={getDemoNotes()}
          onMigrationComplete={() => loadGitHubNotebooks(token)}
        />
      )}
    </div>
  );
}

export default App;
