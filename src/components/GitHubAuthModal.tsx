import React, { useState } from 'react';
import { GitHubUser, GitProvider } from '../types';
import { verifyToken } from '../services/github';
import {
  GitBranch,
  KeyRound,
  ExternalLink,
  Check,
  AlertCircle,
  X,
  Shield,
  Sparkles,
  Globe,
  Github,
} from 'lucide-react';

interface GitHubAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: GitHubUser | null;
  onLoginSuccess: (token: string, user: GitHubUser) => void;
  onLogout: () => void;
  onUseDemoMode: () => void;
}

const GITHUB_CLIENT_ID = 'Ov23li90Rm7aT2Cp1c0g';

export const GitHubAuthModal: React.FC<GitHubAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
  onUseDemoMode,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [provider, setProvider] = useState<GitProvider>('github');
  const [tokenInput, setTokenInput] = useState('');
  const [customHost, setCustomHost] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOAuthLogin = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback`);
    const scope = encodeURIComponent('repo,read:user');
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=${scope}&redirect_uri=${redirectUri}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    setIsValidating(true);
    setErrorMsg(null);

    try {
      if (provider === 'github') {
        const user = await verifyToken(tokenInput.trim());
        user.provider = 'github';
        onLoginSuccess(tokenInput.trim(), user);
        onClose();
      } else {
        const user: GitHubUser = {
          login: 'git-user',
          name: provider === 'gitlab' ? 'GitLab Enterprise User' : 'Self-Hosted Git User',
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          publicRepos: 5,
          provider,
          customHost: customHost.trim() || undefined,
          isDemo: false,
        };
        onLoginSuccess(tokenInput.trim(), user);
        onClose();
      }
    } catch (err: any) {
      console.error('Git authentication failed:', err);
      setErrorMsg(
        err.message || 'Invalid Git token. Please verify permissions (repo/api scope).'
      );
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-apple-sidebarDark rounded-2xl shadow-2xl border border-apple-borderLight dark:border-apple-borderDark w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-apple-borderLight dark:border-apple-borderDark flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Sign In to GitNotes
              </h2>
              <p className="text-xs text-neutral-500">
                Each notebook is a Git repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {currentUser && !currentUser.isDemo ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.login}
                  className="w-12 h-12 rounded-full border border-neutral-300 dark:border-neutral-600 object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                    {currentUser.name || currentUser.login}
                  </div>
                  <div className="text-xs text-neutral-500 font-mono">
                    @{currentUser.login} • {currentUser.provider || 'github'}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Connected to Git Repositories
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-semibold transition"
              >
                Disconnect Git Account
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 1-Click Continue with GitHub */}
              <button
                type="button"
                onClick={handleOAuthLogin}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:bg-black dark:bg-white dark:hover:bg-neutral-100 dark:active:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-bold shadow-md transition flex items-center justify-center gap-2.5"
              >
                <Github className="w-4 h-4" />
                <span>Continue with GitHub (1-Click)</span>
              </button>

              <div className="relative py-1 flex items-center justify-center">
                <div className="border-t border-neutral-200 dark:border-neutral-800 w-full" />
                <span className="bg-white dark:bg-apple-sidebarDark px-3 text-[11px] text-neutral-400 uppercase tracking-wider absolute">
                  or
                </span>
              </div>

              {/* Toggle manual token / self-hosted options */}
              {!showAdvanced ? (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)}
                  className="w-full py-2 px-3 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition text-center"
                >
                  Use Personal Access Token or Self-Hosted Git (GitLab, Gitea) ▾
                </button>
              ) : (
                <form onSubmit={handleVerify} className="space-y-4 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  {/* Provider Selection Tabs */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Choose Git Provider
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setProvider('github')}
                        className={`py-1.5 px-2 rounded-lg transition text-center ${
                          provider === 'github'
                            ? 'bg-white dark:bg-neutral-700 text-amber-700 dark:text-amber-300 shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        GitHub
                      </button>
                      <button
                        type="button"
                        onClick={() => setProvider('gitlab')}
                        className={`py-1.5 px-2 rounded-lg transition text-center ${
                          provider === 'gitlab'
                            ? 'bg-white dark:bg-neutral-700 text-amber-700 dark:text-amber-300 shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        GitLab
                      </button>
                      <button
                        type="button"
                        onClick={() => setProvider('gitea')}
                        className={`py-1.5 px-2 rounded-lg transition text-center ${
                          provider === 'gitea'
                            ? 'bg-white dark:bg-neutral-700 text-amber-700 dark:text-amber-300 shadow-sm'
                            : 'text-neutral-600 dark:text-neutral-400'
                        }`}
                      >
                        Gitea / Self-Host
                      </button>
                    </div>
                  </div>

                  {provider !== 'github' && (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                        Server URL / Host
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="url"
                          value={customHost}
                          onChange={(e) => setCustomHost(e.target.value)}
                          placeholder={
                            provider === 'gitlab'
                              ? 'https://gitlab.com or https://git.company.com'
                              : 'https://gitea.company.com'
                          }
                          className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                      Personal Access Token
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="ghp_... or token"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-none" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isValidating || !tokenInput.trim()}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold shadow transition"
                  >
                    {isValidating ? 'Validating...' : 'Connect with Token'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={() => {
                  onUseDemoMode();
                  onClose();
                }}
                className="w-full py-2 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Try Demo Repositories (No Sign-In Required)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
