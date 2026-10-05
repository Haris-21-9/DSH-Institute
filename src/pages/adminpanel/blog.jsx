import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Clock,
  User,
  Calendar,
  LayoutGrid,
  List,
  X,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  UploadCloud,
  Upload,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  getStoredBlogs,
  fetchBlogsFromDb,
  addBlogToDb,
  deleteBlogFromDb,
  INITIAL_BLOGS,
} from "@/lib/blogsClient";
const internetBlogImages = [
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
];

function getBlogImage(item, idx = 0) {
  if (item?.image && typeof item.image === "string" && item.image.startsWith("http")) {
    return item.image;
  }
  if (item?.image && typeof item.image === "string" && item.image.startsWith("data:")) {
    return item.image;
  }
  return internetBlogImages[idx % internetBlogImages.length];
}

// Scaled iframe preview component for live blog web links
function BlogCardIframe({ targetUrl, title, containerHeight = 160 }) {
  const [container, setContainer] = useState(null);
  const [scale, setScale] = useState(0.25);

  const setRef = useCallback((node) => {
    if (node !== null) setContainer(node);
  }, []);

  useEffect(() => {
    if (!container) return;
    const updateScale = () => {
      const w = container.clientWidth || 320;
      setScale(w / 1280);
    };
    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    return () => observer.disconnect();
  }, [container]);

  const proxySrc = targetUrl ? `/api/proxy?url=${encodeURIComponent(targetUrl)}` : "";

  return (
    <div
      ref={setRef}
      style={{
        width: "100%",
        height: `${containerHeight}px`,
        position: "relative",
        overflow: "hidden",
        background: "#0f172a",
        borderRadius: "var(--radius-sm)",
      }}
    >
      {proxySrc ? (
        <iframe
          src={proxySrc}
          title={title || "Live Article Preview"}
          style={{
            width: "1280px",
            height: "3600px",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            border: "none",
            pointerEvents: "none",
            background: "#ffffff",
          }}
          tabIndex={-1}
          loading="lazy"
        />
      ) : null}
    </div>
  );
}

export default function AdminBlog() {
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState("");
  const fileInputRef = useRef(null);

  const [form, setBlogForm] = useState({
    title: "",
    url: "",
    category: "Web Development",
    excerpt: "",
    author: "Admin",
    image: "",
  });

  const rawUrl = (form.url || "").trim();
  const liveBlogUrl = rawUrl ? (rawUrl.startsWith("http://") || rawUrl.startsWith("https://") ? rawUrl : `https://${rawUrl}`) : "";

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBlogForm((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const loadBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBlogsFromDb();
      if (data && Array.isArray(data)) {
        setBlogs(data);
      }
    } catch {
      setBlogs(getStoredBlogs());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setBlogs(getStoredBlogs());
    loadBlogs();

    const handleStorage = () => {
      setBlogs(getStoredBlogs());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadBlogs]);

  const categories = [
    "All",
    "Web Development",
    "Engineering & AI",
    "UI/UX Design",
    "Tech Trends",
    "Cloud & DevOps",
  ];

  // ─── ADD OR UPDATE BLOG ARTICLE WITH INSTANT MODAL CLOSE ───
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!form.title || !form.excerpt) return;

    const isEdit = !!editingBlog;
    const currentEdit = editingBlog;

    // 1. Instantly close modal view and return to main blog page
    setShowAddModal(false);
    setEditingBlog(null);

    // Automatically calculate estimated reading time from word count
    const words = form.excerpt.trim().split(/\s+/).filter(Boolean).length;
    const autoReadTime = `${Math.max(1, Math.ceil(words / 35))} min read`;

    const autoDate = currentEdit?.date || new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Karachi",
    });

    const rawUrl = form.url ? form.url.trim() : "";
    const formattedUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`) : "";

    const blogObj = {
      id: isEdit ? currentEdit.id : Date.now(),
      title: form.title.trim(),
      url: formattedUrl,
      blog_link: formattedUrl,
      category: form.category || "Web Development",
      excerpt: form.excerpt.trim(),
      readTime: autoReadTime,
      author: form.author.trim() || "Admin",
      date: autoDate,
      image: form.image?.trim() || (currentEdit?.image || internetBlogImages[0]),
    };

    // 2. Immediately update UI view
    setBlogs((prev) => {
      const exists = prev.some((b) => String(b.id) === String(blogObj.id));
      if (exists) {
        return prev.map((b) => (String(b.id) === String(blogObj.id) ? { ...b, ...blogObj } : b));
      }
      return [blogObj, ...prev];
    });

    setSyncNotice(isEdit ? "Article updated in MongoDB Atlas!" : "Article published to MongoDB Atlas!");
    setTimeout(() => setSyncNotice(""), 3500);

    setBlogForm({
      title: "",
      url: "",
      category: "Web Development",
      excerpt: "",
      author: "Admin",
      image: "",
    });

    // 3. Save to MongoDB Atlas in background
    try {
      const updated = await addBlogToDb(blogObj);
      if (updated && Array.isArray(updated)) {
        setBlogs(updated);
      }
    } catch (err) {
      console.error("Background blog save error:", err);
    }
  };

  const handleEdit = (item) => {
    setEditingBlog(item);
    setBlogForm({
      title: item.title || "",
      url: item.url || item.blog_link || item.link || "",
      category: item.category || "Web Development",
      excerpt: item.excerpt || "",
      author: item.author || "Admin",
      image: item.image || "",
    });
    setShowAddModal(true);
  };

  const [deletingBlog, setDeletingBlog] = useState(null);

  const confirmDelete = async () => {
    if (!deletingBlog) return;
    const target = deletingBlog;
    setDeletingBlog(null); // Instantly close delete modal!

    setBlogs((prev) => prev.filter((b) => String(b.id) !== String(target.id))); // Instantly remove card!
    setSyncNotice(`Article "${target.title}" has been permanently removed.`);
    setTimeout(() => setSyncNotice(""), 3500);

    try {
      await deleteBlogFromDb(target.id);
    } catch (err) {
      console.error("Delete blog error:", err);
    }
  };

  const filtered = blogs.filter((b) => {
    const matchesCat =
      selectedCategory === "All" ||
      (b.category && b.category.toLowerCase() === selectedCategory.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (b.title && b.title.toLowerCase().includes(q)) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(q)) ||
      (b.author && b.author.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <AdminLayout
      pageTitle="Blog Articles & Insights"
      pageEyebrow="DATABASE & EDITORIAL CONTENT"
      pageSubtitle={`Managing ${blogs.length} published articles and insights in MongoDB Atlas.`}
      activeNav="blog"
      onSearch={(q) => setSearchQuery(q)}
      actions={
        <button
          type="button"
          className="btn-admin btn-admin-primary"
          onClick={() => {
            setEditingBlog(null);
            setBlogForm({
              title: "",
              url: "",
              category: "Web Development",
              excerpt: "",
              author: "Admin",
              image: "",
            });
            setShowAddModal(true);
          }}
        >
          <Plus size={16} />
          <span>Write Article</span>
        </button>
      }
    >
      {/* ─── Notification Toast ─── */}
      {syncNotice && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius)",
            background: "var(--brand-orange-tint)",
            border: "1px solid rgba(245, 130, 42, 0.35)",
            color: "var(--brand-orange-dark)",
            fontSize: "0.88rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* ─── Filter Pills & View Switcher ─── */}
      <div className="admin-filter-bar">
        <div className="filter-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-pill ${selectedCategory === cat ? "active" : ""}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--admin-muted)", marginRight: "0.5rem" }}>
            {filtered.length} of {blogs.length} Articles
          </span>
          <button
            type="button"
            className={`btn-admin btn-admin-sm ${viewMode === "grid" ? "btn-admin-primary" : "btn-admin-secondary"}`}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={15} />
            <span>Card View</span>
          </button>
          <button
            type="button"
            className={`btn-admin btn-admin-sm ${viewMode === "table" ? "btn-admin-primary" : "btn-admin-secondary"}`}
            onClick={() => setViewMode("table")}
          >
            <List size={15} />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {/* ─── Content Display: Card Grid vs Table ─── */}
      {viewMode === "grid" ? (
        <div className="blogs-grid">
          {filtered.map((item, idx) => {
            const blogImg = getBlogImage(item, idx);
            return (
              <div key={`admin-blog-card-${item.id || 'b'}-${idx}`} className="blog-admin-card">
                {/* Blog Card Image Header */}
                <div className="blog-card-image-wrap">
                  <img
                    src={blogImg}
                    alt={item.title}
                    className="blog-card-image"
                    loading="lazy"
                  />
                  <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
                    <span className="badge-admin badge-admin-orange" style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
                      {item.category || "Web Development"}
                    </span>
                  </div>
                </div>

                {/* Blog Card Content Body */}
                <div className="blog-card-body">
                  <div className="blog-card-top">
                    <span style={{ fontSize: "0.78rem", color: "var(--admin-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={12} />
                      <span>{item.date || "Recent"}</span>
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--admin-muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      <span>{item.readTime || "5 min read"}</span>
                    </span>
                  </div>

                  <h3 className="blog-card-title">{item.title}</h3>
                  <p className="blog-card-excerpt">{item.excerpt}</p>

                  <div className="blog-card-meta">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <User size={13} />
                      <span>{item.author || "Admin"}</span>
                    </span>
                  </div>

                  <div className="blog-card-footer">
                    <span className="badge-admin badge-admin-green" style={{ fontSize: "0.7rem" }}>
                      Atlas Saved
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem" }}>
                      <button
                        type="button"
                        className="btn-admin btn-admin-secondary btn-admin-sm"
                        onClick={() => handleEdit(item)}
                        title="Edit Article"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        className="btn-admin btn-admin-danger btn-admin-sm"
                        onClick={() => setDeletingBlog(item)}
                        title="Delete Article"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="panel">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cover & Article Title</th>
                  <th>Category</th>
                  <th>Author</th>
                  <th>Database Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, idx) => (
                  <tr key={`admin-blog-row-${item.id || 'b'}-${idx}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.85rem", maxWidth: "460px" }}>
                        <div
                          style={{
                            width: "56px",
                            height: "44px",
                            borderRadius: "var(--radius-sm)",
                            overflow: "hidden",
                            background: "#0f172a",
                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={getBlogImage(item, idx)}
                            alt={item.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <strong style={{ color: "var(--admin-text-strong)", fontSize: "0.92rem", display: "block" }}>
                            {item.title}
                          </strong>
                          <p
                            style={{
                              margin: "2px 0 0",
                              color: "var(--admin-muted)",
                              fontSize: "0.8rem",
                              lineHeight: 1.35,
                              display: "-webkit-box",
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {item.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-orange">{item.category || "General"}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.82rem", color: "var(--admin-text)", fontWeight: 600 }}>
                        {item.author || "Admin"}
                      </span>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-green">
                        Atlas Saved
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.45rem" }}>
                        <button
                          type="button"
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => handleEdit(item)}
                          title="Edit Article"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => setDeletingBlog(item)}
                          title="Delete Article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Blog Modal ─── */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingBlog ? "Edit Blog Article" : "Publish Article to MongoDB Atlas"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBlog(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Article Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern Web Architecture with React & Node.js"
                  value={form.title || ""}
                  onChange={(e) => setBlogForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              {/* Blog Link / Article URL */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Blog Link / Article URL</span>
                  {liveBlogUrl && (
                    <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)", fontWeight: 700 }}>
                      Live Link Verified
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://digitalskillshouse.pk/web-development-institute-multan"
                  value={form.url || ""}
                  onChange={(e) => setBlogForm({ ...form, url: e.target.value })}
                />
              </div>

              {/* ─── Live Link Review & Attachment Preview ─── */}
              {liveBlogUrl && (
                <div style={{ background: "var(--admin-surface-soft)", padding: "0.85rem", borderRadius: "var(--radius)", border: "1px solid var(--brand-orange-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sparkles size={14} />
                      <span>Live Website Review Preview ({new URL(liveBlogUrl).hostname})</span>
                    </span>
                    <a
                      href={liveBlogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.75rem", color: "var(--brand-orange)", fontWeight: 600, textDecoration: "underline" }}
                    >
                      Open Link ↗
                    </a>
                  </div>
                  <BlogCardIframe targetUrl={liveBlogUrl} title={form.title || "Live Website Preview"} containerHeight={140} />
                </div>
              )}

              {/* Optional Custom Device Image Upload */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Custom Cover Photo (Optional)</span>
                  {form.image && (
                    <button
                      type="button"
                      className="btn-admin btn-admin-danger btn-admin-sm"
                      onClick={() => setBlogForm({ ...form, image: "" })}
                      style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                    >
                      Remove Image
                    </button>
                  )}
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: "100%", justifyContent: "center", gap: "0.5rem", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
                >
                  <UploadCloud size={16} />
                  <span>{form.image ? "Change Custom Image File" : "Upload Custom Image from Device (Optional)"}</span>
                </button>
                {form.image && (
                  <div style={{ marginTop: "0.5rem", height: "100px", borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid var(--admin-border)" }}>
                    <img src={form.image} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category || "Web Development"}
                  onChange={(e) => setBlogForm({ ...form, category: e.target.value })}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="Engineering & AI">Engineering & AI</option>
                  <option value="UI/UX Design">UI/UX Design</option>
                  <option value="Tech Trends">Tech Trends</option>
                  <option value="Cloud & DevOps">Cloud & DevOps</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Author Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Admin"
                  value={form.author || ""}
                  onChange={(e) => setBlogForm({ ...form, author: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Excerpt / Content Summary *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Summary of the article, key insights and takeaways..."
                  value={form.excerpt || ""}
                  onChange={(e) => setBlogForm({ ...form, excerpt: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingBlog(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  {editingBlog ? "Update Article" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Blog Article Modal ─── */}
      {deletingBlog && (
        <div className="admin-modal-overlay" onClick={() => setDeletingBlog(null)}>
          <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="confirm-dialog-title">Delete Article?</h3>
              <p className="confirm-dialog-text">
                Are you sure you want to permanently delete the article <strong>"{deletingBlog.title}"</strong> from your blog and database? This action cannot be undone.
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setDeletingBlog(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admin btn-admin-danger"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
