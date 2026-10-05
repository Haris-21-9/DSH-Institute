export const SEED_PROJECTS = [];

export const PROJECTS_API_URL = "https://official.digitalskillshouse.pk/api/projects.php";
export const PROJECTS_API_FALLBACK = "https://digitalskillshouse.pk/api/projects.php";
const STORAGE_KEY = "colabify_projects_list";

/**
 * Format and sanitize a raw project object dynamically without hardcoded overrides
 */
export function formatProjectItem(p, index = 0) {
  if (!p) return null;

  const rawUrl = (p.project_link || p.url || p.liveUrl || p.website || "").trim();
  const url = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`) : "";
  let domain = "";
  try {
    if (url) {
      const u = new URL(url);
      domain = u.hostname.replace(/^www\./, "");
    }
  } catch {}

  const title = (p.title || "").trim() || (domain ? domain.split(".")[0].toUpperCase() : `Project ${index + 1}`);

  const slug =
    p.slug ||
    title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
    `project-${p.id || index + 1}`;

  const category = p.category || "Web Development";
  const categoryBadge = p.categoryBadge || category;
  const client = p.client_name || p.client || (domain ? domain : "Client Project");
  const description = p.description || p.overview || p.tagline || "High-performance live digital web platform engineered for real-world client operations.";

  return {
    ...p,
    id: p.id ? String(p.id) : `proj-${index + 1}-${Date.now()}`,
    slug,
    title,
    domain,
    websiteName: domain,
    category,
    categoryBadge,
    tagline: p.tagline || (description ? description.slice(0, 110) : "High-Converting Live Web Solution & Modern Digital Platform"),
    client,
    client_name: client,
    location: p.location || "Global / Online",
    duration: p.duration || "Delivered",
    team: p.team || "Digital Skills House Team",
    overview: p.overview || description,
    challenge:
      p.challenge ||
      "Delivering a modern, responsive, high-speed user experience with continuous uptime, clean UI layout, and optimized user conversion.",
    solution:
      p.solution ||
      "Engineered and deployed an optimized web application with responsive UI components, cross-browser compatibility, and fast cloud hosting.",
    deliverables:
      Array.isArray(p.deliverables) && p.deliverables.length > 0
        ? p.deliverables
        : [
            "Custom Responsive Web Application Architecture",
            "Mobile-First Responsive Interface Optimization",
            "Sub-Second Fast Page Load Performance",
            "Interactive Conversion & Contact Flow",
            "Continuous Cloud Deployment & Monitoring",
          ],
    technologies:
      Array.isArray(p.technologies) && p.technologies.length > 0
        ? p.technologies
        : ["React", "JavaScript", "HTML5", "CSS3", "REST APIs", "Cloudflare"],
    results: p.results || "100% Live Deployment, Sub-Second Page Speeds, Enhanced User Conversion",
    url,
    liveUrl: url,
    project_link: url,
    image: (p.image && typeof p.image === "string" && p.image.trim().length > 5)
      ? p.image.trim()
      : (url ? `https://image.thum.io/get/width/1200/crop/800/${url}` : undefined),
    useIframe: true,
    isFirstCard: index === 0,
    status: p.status || "completed",
    created_at: p.created_at || new Date().toISOString(),
  };
}

/**
 * Get initial projects from storage
 */
export function getStoredProjects() {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => formatProjectItem(item, idx));
      }
    }
  } catch (e) {
    // storage read notice
  }
  return [];
}

/**
 * Save projects to localStorage
 */
export function saveStoredProjects(projects) {
  if (typeof window === "undefined") return;
  try {
    const seen = new Set();
    const sanitized = [];
    (projects || []).forEach((p, idx) => {
      if (p) {
        const formatted = formatProjectItem(p, idx);
        const key = String(formatted.id || formatted.slug || idx);
        if (!seen.has(key)) {
          seen.add(key);
          sanitized.push(formatted);
        }
      }
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("colabify_projects_updated", { detail: sanitized }));
  } catch (e) {
    // storage write notice
  }
}

/**
 * Fetch projects directly from Atlas / DB endpoint safely
 */
export async function fetchProjectsFromApi() {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/atlas/projects");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.projects)) {
        return json.projects.map((p, idx) => formatProjectItem(p, idx));
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Fetch projects from MongoDB Atlas / database and synchronize with local storage
 */
export async function fetchProjectsFromDb() {
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/atlas/projects", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.projects)) {
          const atlasProjects = json.projects.map((p, idx) => formatProjectItem(p, idx));
          saveStoredProjects(atlasProjects);
          return atlasProjects;
        }
      }
    } catch {
      // Atlas proxy fallback
    }
  }

  return getStoredProjects();
}

/**
 * Add a new project link to portfolio and directly sync with local storage & Atlas
 */
export async function addProjectToDb(newProject) {
  const formatted = formatProjectItem(newProject, 0);
  const current = getStoredProjects();
  const updated = [formatted, ...current.filter((p) => String(p.id) !== String(formatted.id))];
  saveStoredProjects(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formatted),
      });
    } catch (err) {
      console.warn("MongoDB Atlas save notice:", err);
    }
  }

  return updated;
}

/**
 * Delete a project from portfolio
 */
export async function deleteProjectFromDb(projectId) {
  const current = getStoredProjects();
  const updated = current.filter((p) => String(p.id) !== String(projectId));
  saveStoredProjects(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId }),
      });
    } catch (err) {
      console.warn("MongoDB Atlas delete notice:", err);
    }
  }

  return updated;
}

/**
 * Reset stored projects to default seed data
 */
export function resetProjectsToDefault() {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Projects reset error:", e);
  }
  return [];
}




