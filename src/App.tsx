import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Notebook, Note, GitHubUser } from './types';
import {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
  getStoredTheme,
  setStoredTheme,
  getCachedNoteTitles,
  cacheNoteTitle,
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
  listBranches,
  createBranch,
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
import { NewNoteDestinationModal } from './components/NewNoteDestinationModal';
import { GitHubAuthModal } from './components/GitHubAuthModal';
import { NewNotebookModal } from './components/NewNotebookModal';
import { MigrateDemoModal } from './components/MigrateDemoModal';
import { DEMO_USER } from './services/demoData';

const noteTitleCacheKey = (repo: string, branch: string, path: string, sha: string) =>
  JSON.stringify([repo.toLowerCase(), branch, path, sha]);

export function App() {
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [currentUser, setCurrentUser] = useState<GitHubUser | null>(getStoredUser());
  const [theme, setTheme] = useState<'light' | 'dark'>(getStoredTheme());

  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [activeBranch, setActiveBranch] = useState('');

  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showNewNoteModal, setShowNewNoteModal] = useState(false);
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

  const noteContentRequests = useRef(new Map<string, Promise<{ content: string; sha: string }>>());
  const fetchNoteContentOnce = useCallback((
    authToken: string,
    owner: string,
    repo: string,
    path: string,
    branch: string
  ): Promise<{ content: string; sha: string }> => {
    const requestKey = `${owner}/${repo}:${branch}:${path}`;
    const existingRequest = noteContentRequests.current.get(requestKey);
    if (existingRequest) return existingRequest;

    const request = getNoteContent(authToken, owner, repo, path, branch)
      .finally(() => noteContentRequests.current.delete(requestKey));
    noteContentRequests.current.set(requestKey, request);
    return request;
  }, []);

  // Check for OAuth tokens or callbacks in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get('code');
    const authState = params.get('state');
    const authError = params.get('auth_error');

    if (authCode || authError) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    if (authError) {
      alert(`GitHub authentication error: ${authError}`);
      return;
    }

    if (authCode) {
      const expectedState = sessionStorage.getItem('gitnotes_oauth_state');
      sessionStorage.removeItem('gitnotes_oauth_state');
      if (!expectedState || !authState || expectedState !== authState) {
        alert('GitHub sign-in could not be verified. Please try again.');
        return;
      }

      (async () => {
        try {
          const response = await fetch('/api/auth/callback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: authCode }),
          });
          const data = await response.json();
          if (!response.ok || !data.access_token) {
            throw new Error(data.error || 'GitHub could not complete sign-in.');
          }
          const user = await verifyToken(data.access_token);
          handleLoginSuccess(data.access_token, user);
        } catch (err: any) {
          console.error('OAuth sign-in failed:', err);
          alert(`GitHub sign-in failed: ${err.message || 'Please try again.'}`);
        }
      })();
    }
  }, []);

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
    const branch = activeBranch || activeNotebook.defaultBranch;

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
      branch
    ).then(async (mdNotes) => {
      if (!isSubscribed) return;

      setNotebooks((prev) =>
        prev.map((nb) =>
          nb.id === activeNotebook.id ? { ...nb, notesCount: mdNotes.length } : nb
        )
      );

      const titleCache = getCachedNoteTitles();
      const cachedNotes = mdNotes.map((note) => {
        const cacheKey = noteTitleCacheKey(activeNotebook.fullName, branch, note.path, note.sha);
        const cachedTitle = titleCache[cacheKey];
        return cachedTitle ? { ...note, title: cachedTitle } : note;
      });
      setNotes(cachedNotes);

      if (cachedNotes.length > 0) {
        const savedNoteId = getActiveNoteId();
        const initialNote = cachedNotes.find((note) => note.id === savedNoteId) || cachedNotes[0];
        setActiveNote(initialNote);

        const uncachedNotes = mdNotes.filter(
          (note) => !titleCache[noteTitleCacheKey(activeNotebook.fullName, branch, note.path, note.sha)]
        );
        let nextNoteIndex = 0;
        const resolvedTitles: Record<string, string> = {};
        const titleWorkers = Array.from(
          { length: Math.min(4, uncachedNotes.length) },
          async () => {
            while (isSubscribed && nextNoteIndex < uncachedNotes.length) {
              const note = uncachedNotes[nextNoteIndex++];
              try {
                const { content, sha } = await fetchNoteContentOnce(
                  token,
                  activeNotebook.owner,
                  activeNotebook.name,
                  note.path,
                  branch
                );
                const title = extractTitle(content, note.path);
                resolvedTitles[noteTitleCacheKey(activeNotebook.fullName, branch, note.path, sha)] = title;
                if (!isSubscribed) continue;

                setNotes((previous) => previous.map((item) =>
                  item.id === note.id && (item.branch || branch) === branch ? { ...item, title, sha } : item
                ));
                setActiveNote((previous) => previous?.id === note.id
                  && (previous.branch || branch) === branch ? { ...previous, title, sha }
                  : previous
                );
              } catch (error) {
                console.warn(`Could not resolve the title for ${note.path}:`, error);
              }
            }
          }
        );

        void Promise.all(titleWorkers).then(() => cacheNoteTitles(resolvedTitles));

        try {
          const { content, sha } = await fetchNoteContentOnce(
            token,
            activeNotebook.owner,
            activeNotebook.name,
            initialNote.path,
            branch
          );
          if (isSubscribed) {
            const enrichedNote = {
              ...initialNote,
              content,
              sha,
              title: extractTitle(content, initialNote.path),
            };
            cacheNoteTitle(noteTitleCacheKey(activeNotebook.fullName, branch, initialNote.path, sha), enrichedNote.title);
            setActiveNote((previous) => previous?.id === initialNote.id ? enrichedNote : previous);
            setNotes((previous) =>
              previous.map((note) => (note.id === initialNote.id ? enrichedNote : note))
            );
          }
        } catch (error) {
          console.error('Failed to fetch the selected note:', error);
        }
      } else {
        setActiveNote(null);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [activeNotebook, activeBranch, token, currentUser?.isDemo, fetchNoteContentOnce]);

  // Note Selection
  const handleSelectNote = async (note: Note) => {
    setActiveNoteId(note.id);
    if (note.branch) setActiveBranch(note.branch);
    setMobileView('editor'); // On mobile: navigate to editor

    if (!note.content && token && activeNotebook && !currentUser?.isDemo) {
      try {
        const { content, sha } = await fetchNoteContentOnce(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          note.path,
          note.branch || activeBranch || activeNotebook.defaultBranch
        );
        const enriched = {
          ...note,
          content,
          sha,
          title: extractTitle(content, note.path),
        };
        cacheNoteTitle(
          noteTitleCacheKey(
            activeNotebook.fullName,
            note.branch || activeBranch || activeNotebook.defaultBranch,
            note.path,
            sha
          ),
          enriched.title
        );
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
    setActiveBranch(nb.defaultBranch);
    setMobileView('notes'); // On mobile: navigate to notes list
  };

  const handleSelectBranch = (branch: string) => {
    setActiveBranch(branch);
    setActiveNote(null);
    setMobileView('notes');
  };

  useEffect(() => {
    if (activeNotebook) setActiveBranch(activeNotebook.defaultBranch);
  }, [activeNotebook?.id]);

  useEffect(() => {
    if (!activeNotebook) {
      setBranches([]);
      return;
    }

    setBranches([activeNotebook.defaultBranch]);
    if (!token || currentUser?.isDemo || (currentUser?.provider && currentUser.provider !== 'github')) return;

    let isSubscribed = true;
    listBranches(token, activeNotebook.owner, activeNotebook.name)
      .then((repoBranches) => {
        if (isSubscribed) {
          setBranches(Array.from(new Set([activeNotebook.defaultBranch, ...repoBranches])));
        }
      })
      .catch((error) => console.error('Failed to load repository branches:', error));

    return () => {
      isSubscribed = false;
    };
  }, [activeNotebook, token, currentUser?.isDemo]);

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
        activeNote.branch || activeBranch || activeNotebook.defaultBranch
      );

      const committedNote: Note = {
        ...activeNote,
        sha: result.sha,
        lastCommitSha: result.commitSha.slice(0, 7),
        lastCommittedAt: new Date().toISOString(),
        isDirty: false,
        syncStatus: 'synced',
      };
      cacheNoteTitle(noteTitleCacheKey(activeNotebook.fullName, activeNote.branch || activeBranch || activeNotebook.defaultBranch, activeNote.path, result.sha), committedNote.title);

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

  // Create a new note at a chosen branch and folder.
  const handleCreateNote = async (
    targetBranch: string,
    destinationFolder: string,
    shouldCreateBranch = false,
    baseBranch = activeBranch || activeNotebook?.defaultBranch || 'main'
  ) => {
    if (!activeNotebook || isCreatingNote) return;

    const folderSegments = destinationFolder
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (folderSegments.some((segment) => segment === '.' || segment === '..' || segment.includes('\\'))) {
      throw new Error('Enter a folder path using normal folder names. Relative path segments are not allowed.');
    }
    const folderPrefix = folderSegments.length ? `${folderSegments.join('/')}/` : '';

    setIsCreatingNote(true);
    try {
      let branchToUse = targetBranch;
      if (shouldCreateBranch) {
        if (!token || currentUser?.isDemo || (currentUser?.provider && currentUser.provider !== 'github')) {
          throw new Error('Sign in with GitHub to create a repository branch.');
        }
        const existingBranches = await listBranches(token, activeNotebook.owner, activeNotebook.name);
        if (existingBranches.includes(targetBranch)) {
          throw new Error(`The branch "${targetBranch}" already exists. Reopen this dialog and choose it from the branch list.`);
        }
        branchToUse = await createBranch(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          targetBranch,
          baseBranch
        );
        setBranches((previous) => Array.from(new Set([...previous, branchToUse])));
      }

      const existingNotes = currentUser?.isDemo || !token
        ? getDemoNotes()[activeNotebook.id] || []
        : await listMarkdownNotes(token, activeNotebook.owner, activeNotebook.name, branchToUse);
      const occupiedPaths = new Set(existingNotes.map((note) => note.path.toLowerCase()));

      const baseTitle = 'New Note';
      const timestamp = Date.now().toString(36).slice(-4);
      let filename = `${folderPrefix}note-${timestamp}.md`;
      let suffix = 2;
      while (occupiedPaths.has(filename.toLowerCase())) {
        filename = `${folderPrefix}note-${timestamp}-${suffix}.md`;
        suffix += 1;
      }
      const initialContent = `# ${baseTitle}\n\nClick here and write your thoughts...`;
      const now = new Date().toISOString();
      const newNote: Note = {
        id: filename,
        notebookId: activeNotebook.id,
        path: filename,
        branch: branchToUse,
        title: baseTitle,
        content: initialContent,
        sha: 'initial',
        updatedAt: now,
        createdAt: now,
        isDirty: true,
        syncStatus: 'dirty',
      };

      setNotes((previous) => [newNote, ...previous]);
      setActiveNote(newNote);
      setActiveNoteId(newNote.id);
      setMobileView('editor');

      if (currentUser?.isDemo || !token) {
        const demoNotesMap = getDemoNotes();
        demoNotesMap[activeNotebook.id] = [...(demoNotesMap[activeNotebook.id] || []), newNote];
        saveDemoNotes(demoNotesMap);
      } else {
        const result = await saveNote(
          token,
          activeNotebook.owner,
          activeNotebook.name,
          newNote.path,
          newNote.content,
          undefined,
          `Create note: ${newNote.title}`,
          branchToUse
        );
        const persistedNote = {
          ...newNote,
          sha: result.sha,
          lastCommitSha: result.commitSha.slice(0, 7),
          isDirty: false,
          syncStatus: 'synced' as const,
        };
        cacheNoteTitle(noteTitleCacheKey(activeNotebook.fullName, branchToUse, filename, result.sha), persistedNote.title);
        setActiveNote(persistedNote);
        setNotes((previous) => previous.map((note) => note.id === newNote.id ? persistedNote : note));
      }

      setNotebooks((previous) => previous.map((notebook) =>
        notebook.id === activeNotebook.id
          ? { ...notebook, notesCount: (notebook.notesCount || 0) + 1 }
          : notebook
      ));
      setActiveBranch(branchToUse);
      setShowNewNoteModal(false);
    } catch (error: any) {
      console.error('Failed to create note:', error);
      throw new Error(error.message || 'Could not create the note. Please check repository permissions.');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleImportFiles = async (files: File[], targetBranch: string, destinationFolder: string) => {
    if (!activeNotebook || isImporting) return;

    const markdownFiles = files.filter((file) => /\.(md|markdown)$/i.test(file.name));
    if (markdownFiles.length !== files.length) {
      alert('Only .md and .markdown files can be imported.');
    }
    if (markdownFiles.length === 0) return;

    const folderSegments = destinationFolder
      .split('/')
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (folderSegments.some((segment) => segment === '.' || segment === '..' || segment.includes('\\'))) {
      alert('Enter a folder path using normal folder names. Relative path segments are not allowed.');
      return;
    }
    const folderPrefix = folderSegments.length ? `${folderSegments.join('/')}/` : '';

    setIsImporting(true);
    const imported: Note[] = [];
    const failures: string[] = [];

    try {
      const existingNotes = currentUser?.isDemo || !token || targetBranch === activeBranch
        ? notes
        : await listMarkdownNotes(token, activeNotebook.owner, activeNotebook.name, targetBranch);
      const usedPaths = new Set(existingNotes.map((note) => note.path.toLowerCase()));

      for (const file of markdownFiles) {
        const originalName = file.name.replace(/[\\/]/g, '-');
        const extension = originalName.match(/\.(md|markdown)$/i)?.[0] || '.md';
        const stem = originalName.slice(0, -extension.length).trim() || 'Untitled';
        let path = `${folderPrefix}${stem}${extension}`;
        let suffix = 2;
        while (usedPaths.has(path.toLowerCase())) {
          path = `${folderPrefix}${stem}-${suffix}${extension}`;
          suffix += 1;
        }
        usedPaths.add(path.toLowerCase());

        try {
          const content = await file.text();
          const now = new Date().toISOString();
          const createdNote: Note = {
            id: path,
            notebookId: activeNotebook.id,
            path,
            branch: targetBranch,
            title: extractTitle(content, stem),
            content,
            sha: 'initial',
            updatedAt: now,
            createdAt: now,
            isDirty: false,
            syncStatus: 'synced',
          };

          if (currentUser?.isDemo || !token) {
            const demoNotesMap = getDemoNotes();
            demoNotesMap[activeNotebook.id] = [...(demoNotesMap[activeNotebook.id] || []), createdNote];
            saveDemoNotes(demoNotesMap);
            imported.push({ ...createdNote, sha: Math.random().toString(16).slice(2, 10) });
          } else {
            const result = await saveNote(
              token,
              activeNotebook.owner,
              activeNotebook.name,
              path,
              content,
              undefined,
              `Import note: ${createdNote.title}`,
              targetBranch
            );
            imported.push({
              ...createdNote,
              sha: result.sha,
              lastCommitSha: result.commitSha.slice(0, 7),
              lastCommittedAt: new Date().toISOString(),
            });
            cacheNoteTitle(noteTitleCacheKey(activeNotebook.fullName, targetBranch, path, result.sha), createdNote.title);
          }
        } catch (error) {
          usedPaths.delete(path.toLowerCase());
          failures.push(file.name);
          console.error(`Failed to import ${file.name}:`, error);
        }
      }

      if (imported.length && targetBranch === activeBranch) {
        const updatedNotes = [...imported, ...notes];
        setNotes(updatedNotes);
        setNotebooks((previous) => previous.map((notebook) =>
          notebook.id === activeNotebook.id
            ? { ...notebook, notesCount: (notebook.notesCount || 0) + imported.length }
            : notebook
        ));
        setMobileView('notes');
      } else if (imported.length) {
        setActiveBranch(targetBranch);
      }

      const destination = `${activeNotebook.fullName}/${folderPrefix || ''} (${targetBranch})`;
      if (failures.length) {
        alert(`Imported ${imported.length} file(s) to ${destination}. Could not import: ${failures.join(', ')}.`);
      } else {
        alert(`Imported ${imported.length} Markdown file(s) to ${destination}.`);
      }
    } finally {
      setIsImporting(false);
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
          target.branch || activeBranch || activeNotebook.defaultBranch
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
          branches={branches}
          onSelectNote={handleSelectNote}
          onCreateNote={() => setShowNewNoteModal(true)}
          onImportFiles={handleImportFiles}
          isImporting={isImporting}
          activeBranch={activeBranch || activeNotebook?.defaultBranch || ''}
          onSelectBranch={handleSelectBranch}
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
          onCreateNote={() => setShowNewNoteModal(true)}
          isSaving={isSaving}
          onBackToNotes={() => setMobileView('notes')}
          onToggleSidebar={toggleSidebar}
          isSidebarVisible={isSidebarVisible}
          currentUser={currentUser}
          onOpenAuthModal={() => setShowAuthModal(true)}
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

      {activeNotebook && (
        <NewNoteDestinationModal
          key={`${activeNotebook.id}:${activeBranch}`}
          isOpen={showNewNoteModal}
          branches={branches}
          defaultBranch={activeBranch || activeNotebook.defaultBranch}
          canCreateBranch={Boolean(token && !currentUser?.isDemo && (!currentUser?.provider || currentUser.provider === 'github'))}
          isCreating={isCreatingNote}
          onClose={() => setShowNewNoteModal(false)}
          onCreate={handleCreateNote}
        />
      )}

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
