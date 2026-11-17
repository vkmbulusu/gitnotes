import { GitHubUser, Notebook, Note } from '../types';
import { DEMO_USER, INITIAL_NOTEBOOKS, INITIAL_NOTES } from './demoData';

const TOKEN_KEY = 'chorus_gh_token';
const USER_KEY = 'chorus_gh_user';
const ACTIVE_NOTEBOOK_KEY = 'chorus_active_notebook';
const ACTIVE_NOTE_KEY = 'chorus_active_note';
const DEMO_NOTEBOOKS_KEY = 'chorus_demo_notebooks';
const DEMO_NOTES_KEY = 'chorus_demo_notes';
const THEME_KEY = 'chorus_theme';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): GitHubUser | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function setStoredUser(user: GitHubUser | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function getStoredTheme(): 'light' | 'dark' {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === 'dark' || theme === 'light') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  localStorage.setItem(THEME_KEY, theme);
}

// Demo state storage for zero-setup exploration
export function getDemoNotebooks(): Notebook[] {
  const data = localStorage.getItem(DEMO_NOTEBOOKS_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return INITIAL_NOTEBOOKS;
}

export function saveDemoNotebooks(notebooks: Notebook[]): void {
  localStorage.setItem(DEMO_NOTEBOOKS_KEY, JSON.stringify(notebooks));
}

export function getDemoNotes(): Record<string, Note[]> {
  const data = localStorage.getItem(DEMO_NOTES_KEY);
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      // fallback
    }
  }
  return INITIAL_NOTES;
}

export function saveDemoNotes(notesMap: Record<string, Note[]>): void {
  localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(notesMap));
}

export function getActiveNotebookId(): string | null {
  return localStorage.getItem(ACTIVE_NOTEBOOK_KEY);
}

export function setActiveNotebookId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_NOTEBOOK_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_NOTEBOOK_KEY);
  }
}

export function getActiveNoteId(): string | null {
  return localStorage.getItem(ACTIVE_NOTE_KEY);
}

export function setActiveNoteId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_NOTE_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_NOTE_KEY);
  }
}
