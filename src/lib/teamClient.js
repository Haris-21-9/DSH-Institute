export const INITIAL_TEAM_MEMBERS = [];

export const TEAM_API_URL = "https://official.digitalskillshouse.pk/api/team.php";
export const TEAM_API_FALLBACK = "https://digitalskillshouse.pk/api/team.php";
const STORAGE_KEY = "colabify_team_members_list";

/**
 * Format and sanitize a team member object
 */
export function formatTeamMember(m, index = 0) {
  if (!m) return null;
  return {
    id: m.id || `team-${index + 1}-${Date.now()}`,
    name: m.name || "Digital Skills Mentor",
    role: m.role || "Senior Specialist",
    bio: m.bio || m.about || `${m.name || "Mentor"} is an expert industry professional at Digital Skills House.`,
    skills: Array.isArray(m.skills) ? m.skills : (typeof m.skills === "string" ? m.skills.split(",").map(s => s.trim()) : ["Full-Stack", "Web Development"]),
    years: m.years || m.experience || "5+ years",
    education: m.education || "Software Engineering",
    image: m.image || m.avatar || "",
  };
}

/**
 * Get stored team members from storage
 */
export function getStoredTeam() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((m, idx) => formatTeamMember(m, idx));
      }
    }
  } catch (e) {
    console.error("Team storage read error:", e);
  }
  return [];
}

/**
 * Save team members to localStorage and notify listeners
 */
export function saveStoredTeam(members) {
  if (typeof window === "undefined") return;
  try {
    const formatted = (members || []).map((m, idx) => formatTeamMember(m, idx));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formatted));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("colabify_team_updated", { detail: formatted }));
  } catch (e) {
    console.error("Team storage write error:", e);
  }
}

/**
 * Fetch team members from Atlas / DB endpoint safely
 */
export async function fetchTeamFromApi() {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/atlas/team");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.team)) {
        return json.team.map((m, idx) => formatTeamMember(m, idx));
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Fetch team members with MongoDB Atlas & storage synchronization
 */
export async function fetchTeamFromDb() {
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/atlas/team", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.team)) {
          const atlasTeam = json.team.map((m, idx) => formatTeamMember(m, idx));
          saveStoredTeam(atlasTeam);
          return atlasTeam;
        }
      }
    } catch {
      // Atlas proxy fallback
    }
  }

  return getStoredTeam();
}

/**
 * Add a new team member and save to MongoDB Atlas & local storage
 */
export async function addMemberToDb(newMember) {
  const current = getStoredTeam();
  const updated = [newMember, ...current.filter((m) => String(m.id) !== String(newMember.id))];
  saveStoredTeam(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember),
      });
    } catch (err) {
      console.warn("MongoDB Atlas team save notice:", err);
    }
  }

  return updated;
}

/**
 * Delete a team member and remove from MongoDB Atlas & local storage
 */
export async function deleteMemberFromDb(memberId) {
  const current = getStoredTeam();
  const updated = current.filter((m) => String(m.id) !== String(memberId));
  saveStoredTeam(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: memberId }),
      });
    } catch (err) {
      console.warn("MongoDB Atlas team delete notice:", err);
    }
  }

  return updated;
}

export const addTeamMemberToDb = addMemberToDb;
export const deleteTeamMemberFromDb = deleteMemberFromDb;


/**
 * Reset team members to default factory seed
 */
export function resetTeamToDefault() {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Team reset error:", e);
  }
  return [];
}
