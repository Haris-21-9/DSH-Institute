// Admin Authentication Helper & State Management
const STORAGE_KEY = "admin_auth_user";
const TOKEN_KEY = "admin_auth_token";

export const DEFAULT_ADMIN_USER = {
  name: "Admin",
  role: "Administrator",
  email: "admin@digitalskillshouse.pk",
  initials: "AD",
};

export function getAdminUser() {
  if (typeof window === "undefined") return DEFAULT_ADMIN_USER;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.name) {
        if (parsed.name === "Haris Javed") {
          parsed.name = "Admin";
          parsed.initials = "AD";
        }
        return {
          ...DEFAULT_ADMIN_USER,
          ...parsed,
          initials: getInitials(parsed.name),
        };
      }
    }
  } catch {}
  return DEFAULT_ADMIN_USER;
}

export function setAdminUser(user) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {}
}

export function getAdminToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setAdminToken(token) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getInitials(name = "Admin") {
  if (!name) return "AD";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
