const API_URL = import.meta.env.VITE_API_URL;

// The session (token + user) lives in localStorage so a page refresh doesn't log
// the user out. This is a real deployed app's own storage, not a Claude artifact —
// localStorage is the standard, correct tool here.
const STORAGE_KEY = "flashmem_session";

export function getSession() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function saveSession(session) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

async function handle(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export async function signup(email, password) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

export async function login(email, password) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handle(res);
}

/** Fetch wrapper that attaches the current session's Bearer token automatically. */
export async function authFetch(path, options = {}) {
  const session = getSession();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.token}`,
  };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  return handle(res);
}
