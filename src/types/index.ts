export type EditorMode = 'richtext' | 'markdown';

export type SyncStatus = 'synced' | 'saving' | 'dirty' | 'error';

export type GitProvider = 'github' | 'gitlab' | 'gitea' | 'selfhosted';

export interface GitHubUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio?: string | null;
  publicRepos: number;
  totalPrivateRepos?: number;
  isDemo?: boolean;
  provider?: GitProvider;
  customHost?: string;
}

export interface Notebook {
  id: string; // full_name or unique id
  name: string;
  owner: string;
  fullName: string;
  defaultBranch: string;
  description: string;
  isPrivate: boolean;
  notesCount: number;
  updatedAt: string;
  htmlUrl: string;
}

export interface Note {
  id: string;
  notebookId: string;
  path: string; // e.g. "quick-notes.md"
  branch?: string;
  title: string;
  content: string; // Markdown source
  sha: string; // Git blob SHA
  updatedAt: string;
  createdAt: string;
  isDirty?: boolean;
  syncStatus?: SyncStatus;
  lastCommittedAt?: string;
  lastCommitSha?: string;
}

export interface GitCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  avatarUrl?: string;
  htmlUrl?: string;
}

export interface PDFExportOptions {
  margin: 'narrow' | 'normal' | 'compact';
  includeHeader: boolean;
  includeDate: boolean;
  includeNotebookTag: boolean;
  fontSize: 'small' | 'standard' | 'large';
  pageSize: 'a4' | 'letter';
}
