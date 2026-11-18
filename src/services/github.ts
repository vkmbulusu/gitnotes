import { GitHubUser, Notebook, Note, GitCommit } from '../types';
import { extractTitle } from './markdown';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Robust UTF-8 to Base64 encoding supporting emojis, symbols, and Unicode.
 */
export function encodeBase64Utf8(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Robust Base64 to UTF-8 decoding.
 */
export function decodeBase64Utf8(base64: string): string {
  // Strip whitespace/newlines that GitHub API can return
  const clean = base64.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Helper to make authenticated GitHub API calls
 */
async function githubFetch(endpoint: string, token: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${GITHUB_API_BASE}${endpoint}`;
  const headers = {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token.trim()}`,
    'X-GitHub-Api-Version': '2022-11-28',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `GitHub API error (${response.status}): ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) {
        errorMsg = errorJson.message;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Verify token and fetch user details
 */
export async function verifyToken(token: string): Promise<GitHubUser> {
  const data = await githubFetch('/user', token);
  return {
    login: data.login,
    name: data.name || data.login,
    avatarUrl: data.avatar_url,
    bio: data.bio,
    publicRepos: data.public_repos || 0,
    totalPrivateRepos: data.total_private_repos || 0,
    isDemo: false,
  };
}

/**
 * List all repositories belonging to the authenticated user.
 */
export async function listRepositories(token: string): Promise<Notebook[]> {
  const repos = await githubFetch(
    '/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator',
    token
  );

  return repos.map((repo: any) => ({
    id: repo.full_name,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.full_name,
    defaultBranch: repo.default_branch || 'main',
    description: repo.description || 'Git repository notebook',
    isPrivate: repo.private,
    notesCount: 0, // will be counted when loaded
    updatedAt: repo.updated_at,
    htmlUrl: repo.html_url,
  }));
}

/** List the branches a user can target when importing notes. */
export async function listBranches(
  token: string,
  owner: string,
  repo: string
): Promise<string[]> {
  const branches = await githubFetch(
    `/repos/${owner}/${repo}/branches?per_page=100`,
    token
  );
  return branches.map((branch: any) => branch.name as string);
}

/**
 * Create a new repository on GitHub to act as a notebook
 */
export async function createRepository(
  token: string,
  name: string,
  description: string,
  isPrivate: boolean
): Promise<Notebook> {
  const data = await githubFetch('/user/repos', token, {
    method: 'POST',
    body: JSON.stringify({
      name,
      description: description || 'Notes repository managed by GitNotes (gitnotes.dev)',
      private: isPrivate,
      auto_init: true, // creates initial commit and main branch
    }),
  });

  return {
    id: data.full_name,
    name: data.name,
    owner: data.owner.login,
    fullName: data.full_name,
    defaultBranch: data.default_branch || 'main',
    description: data.description || '',
    isPrivate: data.private,
    notesCount: 0,
    updatedAt: data.updated_at,
    htmlUrl: data.html_url,
  };
}

/**
 * List all Markdown files in a repository via GitHub Git Trees API
 */
export async function listMarkdownNotes(
  token: string,
  owner: string,
  repo: string,
  branch: string
): Promise<Note[]> {
  try {
    // 1. Get branch commit SHA
    const branchData = await githubFetch(
      `/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
      token
    );
    const commitSha = branchData.commit.sha;

    // 2. Get recursive tree for commit
    const treeData = await githubFetch(
      `/repos/${owner}/${repo}/git/trees/${commitSha}?recursive=1`,
      token
    );

    if (!treeData.tree || !Array.isArray(treeData.tree)) {
      return [];
    }

    // 3. Filter for markdown files
    const mdItems = treeData.tree.filter(
      (item: any) =>
        item.type === 'blob' &&
        (item.path.endsWith('.md') || item.path.endsWith('.markdown')) &&
        !item.path.startsWith('.github/')
    );

    // Map into initial Note objects (content can be lazily loaded or loaded in batch)
    return mdItems.map((item: any) => {
      const filename = item.path.split('/').pop() || item.path;
      const cleanTitle = filename.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
      return {
        id: item.path,
        notebookId: `${owner}/${repo}`,
        path: item.path,
        title: cleanTitle,
        content: '', // content fetched on demand
        sha: item.sha,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        syncStatus: 'synced',
        lastCommitSha: item.sha.slice(0, 7),
      };
    });
  } catch (err: any) {
    console.error(`Failed to list markdown files for ${owner}/${repo}:`, err);
    // If empty repo without commits, return empty
    return [];
  }
}

/**
 * Fetch raw content of a specific note file
 */
export async function getNoteContent(
  token: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<{ content: string; sha: string }> {
  const data = await githubFetch(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
    token
  );

  const rawBase64 = data.content || '';
  const content = decodeBase64Utf8(rawBase64);
  return {
    content,
    sha: data.sha,
  };
}

/**
 * Commit a note (create or update) to GitHub
 */
export async function saveNote(
  token: string,
  owner: string,
  repo: string,
  path: string,
  content: string,
  sha?: string,
  customMessage?: string,
  branch: string = 'main'
): Promise<{ sha: string; commitSha: string; title: string }> {
  const title = extractTitle(content, path);
  const message =
    customMessage ||
    (sha ? `Update note: ${title}` : `Create note: ${title}`);

  const body: any = {
    message,
    content: encodeBase64Utf8(content),
    branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const result = await githubFetch(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    token,
    {
      method: 'PUT',
      body: JSON.stringify(body),
    }
  );

  return {
    sha: result.content.sha,
    commitSha: result.commit.sha,
    title,
  };
}

/**
 * Delete a note file from GitHub repository
 */
export async function deleteNote(
  token: string,
  owner: string,
  repo: string,
  path: string,
  sha: string,
  branch: string = 'main'
): Promise<void> {
  await githubFetch(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    token,
    {
      method: 'DELETE',
      body: JSON.stringify({
        message: `Delete note: ${path}`,
        sha,
        branch,
      }),
    }
  );
}

/**
 * Get recent Git commit history for a file
 */
export async function getCommitHistory(
  token: string,
  owner: string,
  repo: string,
  path: string
): Promise<GitCommit[]> {
  try {
    const commits = await githubFetch(
      `/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=15`,
      token
    );

    return commits.map((item: any) => ({
      sha: item.sha,
      message: item.commit.message,
      author: item.commit.author.name || item.author?.login || 'Git User',
      date: item.commit.author.date,
      avatarUrl: item.author?.avatar_url,
      htmlUrl: item.html_url,
    }));
  } catch (err) {
    console.warn('Failed to load commits for', path, err);
    return [];
  }
}
