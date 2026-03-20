export const AUTH_STORAGE_KEY = "inventory_auth_session";
export const AUTH_USERNAME = "andibayu";
export const AUTH_PASSWORD = "admin123!";

export function getAuthSession() {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed?.isLoggedIn) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setAuthSession(username) {
  if (typeof window === "undefined") return;

  const payload = {
    isLoggedIn: true,
    username,
    loggedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}
