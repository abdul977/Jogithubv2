import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_REDIRECT_URI = import.meta.env.VITE_GITHUB_REDIRECT_URI;
const TOKEN_COOKIE_NAME = 'github_token';

interface GitHubToken {
  access_token: string;
  expires_at: number;
  scope: string;
}

export function initiateGitHubAuth() {
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauth_state', state);
  
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: 'repo',
    state,
  });

  window.location.href = `https://github.com/login/oauth/authorize?${params}`;
}

export async function handleOAuthCallback(code: string, state: string): Promise<string> {
  const savedState = sessionStorage.getItem('oauth_state');
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter');
  }

  const response = await fetch('/api/auth/github', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code, state }),
  });

  if (!response.ok) {
    throw new Error('Failed to exchange code for token');
  }

  const data: GitHubToken = await response.json();
  setToken(data.access_token);
  return data.access_token;
}

export function setToken(token: string) {
  Cookies.set(TOKEN_COOKIE_NAME, token, {
    expires: 1,
    secure: true,
    sameSite: 'strict',
  });
}

export function getToken(): string | null {
  return Cookies.get(TOKEN_COOKIE_NAME) || null;
}

export function removeToken() {
  Cookies.remove(TOKEN_COOKIE_NAME);
}

export function isTokenValid(token: string): boolean {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp > currentTime : false;
  } catch {
    return false;
  }
}