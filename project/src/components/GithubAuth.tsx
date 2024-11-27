import React from 'react';
import { Github } from 'lucide-react';
import { initiateGitHubAuth, handleOAuthCallback } from '../utils/auth';
import { useEffect } from 'react';

interface GithubAuthProps {
  onAuth: (token: string) => void;
}

export function GithubAuth({ onAuth }: GithubAuthProps) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code && state) {
      handleOAuthCallback(code, state)
        .then(token => {
          onAuth(token);
          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname);
        })
        .catch(error => {
          console.error('Authentication failed:', error);
        });
    }
  }, [onAuth]);

  const handleLogin = async (e: React.MouseEvent) => {
    e.preventDefault();
    initiateGitHubAuth();
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center justify-center px-4 py-2 space-x-2 text-white bg-gray-900 rounded-md hover:bg-gray-800"
    >
      <Github className="w-5 h-5" />
      <span>Connect with GitHub</span>
    </button>
  );
}