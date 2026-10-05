export const DEFAULT_HERO_TRUST = {
  key: "hero_trust",
  ratingScore: "4.9/5",
  starsCount: 5,
  starsText: "★★★★★",
  trustText: "Trusted by 5,000+ Students & Clients",
  showTeamAvatars: true,
};

const STORAGE_KEY = "colabify_hero_trust_settings";

/**
 * Get stored hero trust settings from localStorage
 */
export function getStoredHeroSettings() {
  if (typeof window === "undefined") return DEFAULT_HERO_TRUST;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_HERO_TRUST, ...parsed };
    }
  } catch (e) {
    console.error("Hero trust storage read error:", e);
  }
  return DEFAULT_HERO_TRUST;
}

/**
 * Save hero trust settings to localStorage and notify listeners
 */
export function saveStoredHeroSettings(settings) {
  if (typeof window === "undefined") return;
  try {
    const merged = { ...DEFAULT_HERO_TRUST, ...settings };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("colabify_hero_trust_updated", { detail: merged }));
  } catch (e) {
    console.error("Hero trust storage write error:", e);
  }
}

/**
 * Fetch hero trust settings from Atlas / DB endpoint
 */
export async function fetchHeroSettingsFromDb() {
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const res = await fetch("/api/atlas/settings?key=hero_trust", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.settings) {
          const remoteSettings = { ...DEFAULT_HERO_TRUST, ...json.settings };
          saveStoredHeroSettings(remoteSettings);
          return remoteSettings;
        }
      }
    } catch {
      // Atlas proxy fallback
    }
  }

  return getStoredHeroSettings();
}

/**
 * Update hero trust settings in MongoDB Atlas & local storage
 */
export async function updateHeroSettingsInDb(newSettings) {
  const merged = { ...DEFAULT_HERO_TRUST, ...newSettings, key: "hero_trust" };
  saveStoredHeroSettings(merged);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
    } catch (err) {
      console.warn("MongoDB Atlas settings save notice:", err);
    }
  }

  return merged;
}
