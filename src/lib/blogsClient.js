export const INITIAL_BLOGS = [];

export const BLOGS_API_URL = "https://official.digitalskillshouse.pk/api/blogs.php";
export const BLOGS_API_FALLBACK = "https://digitalskillshouse.pk/api/blogs.php";
const STORAGE_KEY = "colabify_blogs_list";

/**
 * Format and sanitize a blog article object
 */
export function formatBlogItem(item, idx = 0) {
  if (!item) return null;
  
  let rawImg = item.image || item.cover || "";
  let hasValidImage = false;
  if (typeof rawImg === "string") {
    const isLocalAssetPath = rawImg.startsWith("/assets/") || rawImg.startsWith("./assets/") || rawImg.includes("service-") || rawImg.includes("blog-1.jpg") || rawImg.includes("blog-2.jpg");
    if (!isLocalAssetPath && (rawImg.startsWith("http://") || rawImg.startsWith("https://") || rawImg.startsWith("data:image/"))) {
      hasValidImage = true;
    }
  }

  const rawLink = (item.url || item.blog_link || item.link || "").trim();
  const blogUrl = rawLink ? (rawLink.startsWith("http") ? rawLink : `https://${rawLink}`) : "";

  return {
    ...item,
    id: item.id || `blog-${idx + 1}-${Date.now()}`,
    title: item.title || "Web Development & IT Guide",
    url: blogUrl,
    blog_link: blogUrl,
    tagline: item.tagline || (item.excerpt ? item.excerpt.slice(0, 100) : "Expert guides and tutorials by industry engineers."),
    excerpt: item.excerpt || item.description || "In-depth case study and technical breakdown by Digital Skills House instructors.",
    category: item.category || "Web Development",
    createdAt: item.createdAt || item.timestamp || item.date || new Date().toISOString(),
    image: hasValidImage ? rawImg : (item.image || ""),
  };
}

/**
 * Get stored blogs from storage
 */
export function getStoredBlogs() {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => formatBlogItem(item, idx));
      }
    }
  } catch (e) {
    // Storage read fallback
  }
  return [];
}

/**
 * Save blogs to localStorage
 */
export function saveStoredBlogs(blogs) {
  if (typeof window === "undefined") return;
  try {
    const sanitized = (blogs || []).map((item, idx) => formatBlogItem(item, idx));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new CustomEvent("colabify_blogs_updated", { detail: sanitized }));
  } catch (e) {
    // Storage write fallback
  }
}

/**
 * Fetch blogs from Atlas / DB endpoint safely
 */
export async function fetchBlogsFromApi() {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/atlas/blogs");
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.blogs)) {
        return json.blogs.map((b, idx) => formatBlogItem(b, idx));
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * Fetch blogs with MongoDB Atlas & storage synchronization
 */
export async function fetchBlogsFromDb() {
  if (typeof window !== "undefined") {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch("/api/atlas/blogs", { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.blogs)) {
          const atlasBlogs = json.blogs.map((b, idx) => formatBlogItem(b, idx));
          saveStoredBlogs(atlasBlogs);
          return atlasBlogs;
        }
      }
    } catch {
      // Atlas proxy fallback
    }
  }

  return getStoredBlogs();
}

/**
 * Add a new blog article and save to MongoDB Atlas & local storage
 */
export async function addBlogToDb(newBlog) {
  const current = getStoredBlogs();
  const updated = [newBlog, ...current.filter((b) => String(b.id) !== String(newBlog.id))];
  saveStoredBlogs(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBlog),
      });
    } catch (err) {
      console.warn("MongoDB Atlas blog save notice:", err);
    }
  }

  return updated;
}

/**
 * Delete a blog article and remove from MongoDB Atlas & local storage
 */
export async function deleteBlogFromDb(blogId) {
  const current = getStoredBlogs();
  const updated = current.filter((b) => String(b.id) !== String(blogId));
  saveStoredBlogs(updated);

  if (typeof window !== "undefined") {
    try {
      await fetch("/api/atlas/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: blogId }),
      });
    } catch (err) {
      console.warn("MongoDB Atlas blog delete notice:", err);
    }
  }

  return updated;
}


/**
 * Reset blogs to default seed data
 */
export function resetBlogsToDefault() {
  if (typeof window === "undefined") return [];
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Blogs reset error:", e);
  }
  return [];
}

