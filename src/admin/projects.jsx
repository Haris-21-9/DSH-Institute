import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  CheckCircle2,
  X,
  Search,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  getStoredProjects,
  fetchProjectsFromDb,
  addProjectToDb,
  deleteProjectFromDb,
  SEED_PROJECTS,
  formatProjectItem,
} from "@/lib/projectsClient";
import usaInsulationPreview from "@/assets/usa-insulation-preview.png";
import digitalSkillsPreview from "@/assets/digitalskillshouse-full.png";
import aecPreview from "@/assets/aec-full.png";
import "./admin.css";

import { createProjectFromInternet } from "@/lib/webScraper";

// Helper to get preview image for a project
function getProjectImage(proj) {
  if (proj && proj.image && typeof proj.image === "string" && proj.image.length > 5 && !proj.image.includes("Project-") && !proj.image.includes("service-") && !proj.image.includes("clock")) {
    return proj.image;
  }
  return null;
}

// Responsive scaled iframe preview that fills 100% width of card container with full-page scroll on hover
function AdminCardIframe({ targetUrl, title, thumbnail, containerHeight = 205 }) {
  const [container, setContainer] = useState(null);
  const [scale, setScale] = useState(0.25);
  const scrollerRef = useRef(null);
  const animRef = useRef(null);
  const isHoveredRef = useRef(false);
  const currentYRef = useRef(0);

  const setRef = useCallback((node) => {
    if (node !== null) {
      setContainer(node);
    }
  }, []);

  useEffect(() => {
    if (!container) return;

    const updateScale = () => {
      const w = container.clientWidth || 320;
      setScale(w / 1280);
    };

    updateScale();
    const observer = new ResizeObserver(container);
    observer.observe(container);

    return () => observer.disconnect();
  }, [container]);

  const IFRAME_HEIGHT = 5200;

  const startScrolling = () => {
    isHoveredRef.current = true;
    if (!container || !scrollerRef.current) return;
    const visualH = IFRAME_HEIGHT * (scale || 0.25);
    const maxScroll = Math.max(120, visualH - containerHeight);
    let lastTime = 0;
    let phase = "down";
    let pauseTime = 0;

    const step = (ts) => {
      if (!isHoveredRef.current) return;
      if (!lastTime) lastTime = ts;
      const dt = Math.min((ts - lastTime) / 1000, 0.08);
      lastTime = ts;

      if (phase === "down") {
        currentYRef.current += 85 * dt;
        if (currentYRef.current >= maxScroll) {
          currentYRef.current = maxScroll;
          phase = "pause";
          pauseTime = ts;
        }
      } else if (phase === "pause") {
        if (ts - pauseTime >= 1200) {
          phase = "up";
          pauseTime = ts;
        }
      } else if (phase === "up") {
        currentYRef.current -= 380 * dt;
        if (currentYRef.current <= 0) {
          currentYRef.current = 0;
          phase = "down";
          lastTime = ts;
        }
      }

      if (scrollerRef.current) {
        scrollerRef.current.style.transform = `translateY(-${currentYRef.current}px)`;
      }
      animRef.current = requestAnimationFrame(step);
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(step);
  };

  const stopScrolling = () => {
    isHoveredRef.current = false;
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (scrollerRef.current) {
      scrollerRef.current.style.transition = "transform 0.4s ease";
      scrollerRef.current.style.transform = "translateY(0px)";
      setTimeout(() => {
        if (scrollerRef.current) scrollerRef.current.style.transition = "";
      }, 400);
    }
    currentYRef.current = 0;
  };

  const proxySrc = targetUrl ? `/api/proxy?url=${encodeURIComponent(targetUrl)}` : "";

  return (
    <div
      ref={setRef}
      onMouseEnter={startScrolling}
      onMouseLeave={stopScrolling}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#0f172a",
        cursor: "pointer",
      }}
    >
      <div ref={scrollerRef} style={{ width: "100%", position: "absolute", top: 0, left: 0 }}>
        {proxySrc ? (
          <iframe
            src={proxySrc}
            title={title || "Live Website Preview"}
            style={{
              width: "1280px",
              height: `${IFRAME_HEIGHT}px`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              border: "none",
              pointerEvents: "none",
              background: "#ffffff",
            }}
            tabIndex={-1}
            loading="lazy"
          />
        ) : thumbnail ? (
          <img src={thumbnail} alt={title} style={{ width: "100%", objectFit: "cover" }} />
        ) : null}
      </div>
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState(() => SEED_PROJECTS.map((p, idx) => formatProjectItem(p, idx)));
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [syncNotice, setSyncNotice] = useState("");
  const [deletingProject, setDeletingProject] = useState(null);

  const [form, setForm] = useState({
    title: "",
    url: "",
    category: "Web Development",
    client: "",
    description: "",
    image: "",
  });

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchProjectsFromDb();
      if (data && Array.isArray(data)) {
        setProjects(data);
      }
    } catch {
      setProjects(getStoredProjects());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setProjects(getStoredProjects());
    loadProjects();

    const handleStorage = () => {
      setProjects(getStoredProjects());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadProjects]);

  const categories = [
    "All",
    "Web Development",
    "General",
    "Mobile App",
    "E-Commerce Platforms",
    "Custom Software",
    "Digital Skills Platform",
  ];

  // ─── ADD OR UPDATE PROJECT WITH INSTANT MODAL CLOSE & OPTIMISTIC SAVE ───
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!form.url) return;

    let targetUrl = form.url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    const isEdit = !!editingProject;
    const currentEdit = editingProject;

    // 1. Immediately close modal view and return to page
    setShowAddModal(false);
    setEditingProject(null);

    // 2. Derive immediate title & client
    let autoTitle = form.title.trim();
    let autoClient = form.client.trim();
    if (!autoTitle) {
      try {
        const u = new URL(targetUrl);
        const domain = u.hostname.replace(/^www\./, "");
        autoTitle = domain.split(".")[0].toUpperCase() + " Platform";
        if (!autoClient) autoClient = domain;
      } catch {
        autoTitle = "Live Portfolio Project";
      }
    }

    const autoImage = form.image.trim() || `https://image.thum.io/get/width/1200/crop/800/${targetUrl}`;

    const instantProject = {
      id: isEdit ? currentEdit.id : Date.now(),
      title: autoTitle,
      url: targetUrl,
      project_link: targetUrl,
      liveUrl: targetUrl,
      category: form.category || "Web Development",
      client: autoClient || "Client",
      description: form.description.trim() || "High-performance digital web solution created by Digital Skills House engineers.",
      image: autoImage,
      badge: "LIVE SITE",
    };

    // 3. Immediately update UI view
    setProjects((prev) => {
      const exists = prev.some((p) => String(p.id) === String(instantProject.id));
      if (exists) {
        return prev.map((p) => (String(p.id) === String(instantProject.id) ? { ...p, ...instantProject } : p));
      }
      return [instantProject, ...prev];
    });

    setSyncNotice(isEdit ? "Project updated in MongoDB Atlas!" : "Project saved to MongoDB Atlas!");
    setTimeout(() => setSyncNotice(""), 3500);

    setForm({
      title: "",
      url: "",
      category: "Web Development",
      client: "",
      description: "",
      image: "",
    });

    // 4. Background internet analysis and DB save
    (async () => {
      try {
        let analyzedData = {};
        if (!isEdit) {
          try {
            analyzedData = await createProjectFromInternet(targetUrl);
          } catch {}
        }
        const fullObj = {
          ...analyzedData,
          ...instantProject,
          title: form.title.trim() || analyzedData.title || autoTitle,
          description: form.description.trim() || analyzedData.overview || instantProject.description,
          image: form.image.trim() || analyzedData.image || autoImage,
        };
        const updated = await addProjectToDb(fullObj);
        if (updated && Array.isArray(updated)) {
          setProjects(updated);
        }
      } catch (err) {
        console.error("Background project save error:", err);
      }
    })();
  };

  const handleEdit = (proj) => {
    setEditingProject(proj);
    setForm({
      title: proj.title || "",
      url: proj.url || proj.project_link || "",
      category: proj.category || "Web Development",
      client: proj.client || "",
      description: proj.description || proj.overview || "",
      image: proj.image || "",
    });
    setShowAddModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingProject) return;
    const target = deletingProject;
    setDeletingProject(null); // Instantly close view!

    setProjects((prev) => prev.filter((p) => String(p.id) !== String(target.id))); // Instantly remove card!
    setSyncNotice(`"${target.title}" has been permanently removed.`);
    setTimeout(() => setSyncNotice(""), 3500);

    try {
      await deleteProjectFromDb(target.id);
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  const filtered = projects.filter((p) => {
    const matchesCat =
      selectedCategory === "All" ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.url && p.url.toLowerCase().includes(q)) ||
      (p.client && p.client.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Calculate live preview thumbnail for the URL being typed in the modal
  const liveInputUrl = form.url.trim() ? (form.url.startsWith("http") ? form.url.trim() : `https://${form.url.trim()}`) : "";

  return (
    <AdminLayout
      pageTitle="Projects"
      pageEyebrow="PORTFOLIO & LIVE PLATFORMS"
      pageSubtitle="Manage all production websites, applications, and client deployments."
      activeNav="projects"
      onSearch={(q) => setSearchQuery(q)}
      actions={
        <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button
            type="button"
            className="btn-admin btn-admin-primary"
            onClick={() => {
              setEditingProject(null);
              setForm({ title: "", url: "", category: "Web Development", client: "", description: "", image: "" });
              setShowAddModal(true);
            }}
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>
      }
    >
      {/* ─── Notification Toast ─── */}
      {syncNotice && (
        <div
          style={{
            padding: "0.75rem 1.25rem",
            borderRadius: "var(--radius)",
            background: "var(--brand-orange-light)",
            border: "1px solid var(--brand-orange-border)",
            color: "var(--brand-orange-dark)",
            fontSize: "0.88rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <CheckCircle2 size={16} />
          <span>{syncNotice}</span>
        </div>
      )}

      {/* ─── Category Filter Pills Bar ─── */}
      <div className="admin-filter-bar" style={{ marginBottom: "1.5rem" }}>
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

        <span style={{ fontSize: "0.82rem", color: "var(--admin-muted)", fontWeight: 700 }}>
          {filtered.length} Projects Total
        </span>
      </div>

      {/* ─── Projects Cards Grid (Matching Reference Screenshot) ─── */}
      <div className="admin-projects-grid">
        {filtered.slice(0, 6).map((proj, idx) => {
          const imgSrc = getProjectImage(proj);
          const rawUrl = proj.url || proj.project_link || proj.liveUrl || "";
          const targetUrl = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
          const categoryTag = (proj.categoryBadge || proj.category || "WEB").replace(/Development|Platforms|Software/i, "").trim().toUpperCase() || "WEB";
          const desc = proj.description || proj.overview || proj.tagline || "High-performance live digital web platform engineered for real-world client operations.";

          return (
            <article key={`admin-proj-card-${proj.id || 'p'}-${idx}`} className="project-preview-card">
              {/* Top Website Preview Image / Live Website Frame */}
              <div className="project-preview-header">
                <AdminCardIframe targetUrl={targetUrl} title={proj.title} thumbnail={imgSrc} containerHeight={205} />
              </div>

              {/* Card Body */}
              <div className="project-preview-body">
                {/* Category Badge Tag */}
                <div className="project-badge-tag">
                  <Globe size={13} color="var(--brand-orange)" />
                  <span>{categoryTag.includes("WEB") ? "WEB" : categoryTag}</span>
                </div>

                {/* Project Title */}
                <h3 className="project-preview-title">
                  {proj.title}
                </h3>

                {/* Project Description */}
                <p className="project-preview-desc" title={desc}>
                  {desc}
                </p>

                {/* Card Footer Actions */}
                <div className="project-preview-footer">
                  <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="project-visit-link"
                    title={`Visit ${proj.title}`}
                  >
                    <span>Visit site</span>
                    <span aria-hidden="true">→</span>
                  </a>

                  <div className="project-card-actions">
                    <button
                      type="button"
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      onClick={() => handleEdit(proj)}
                      title="Edit Project"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-admin btn-admin-danger btn-admin-sm"
                      onClick={() => setDeletingProject(proj)}
                      title="Delete Project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* ─── Active Portfolio Projects Table Section ─── */}
      <div className="panel" style={{ marginTop: "1rem" }}>
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Active Portfolio Projects ({filtered.length})</h2>
            <p className="panel-subtitle">Overview of all active projects deployed and synchronized</p>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>PROJECT TITLE & DOMAIN</th>
                <th>CATEGORY</th>
                <th>OFFICIAL WEBSITE LINK</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((proj, idx) => {
                let domain = "";
                try {
                  domain = new URL(proj.url || proj.project_link).hostname.replace(/^www\./, "");
                } catch {
                  domain = proj.url || proj.project_link;
                }

                return (
                  <tr key={`admin-proj-row-${proj.id || 'p'}-${idx}`}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--admin-text-strong)", fontWeight: 700 }}>{proj.title}</strong>
                        <small style={{ color: "var(--admin-muted)" }}>{proj.client || domain}</small>
                      </div>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-orange">
                        {proj.category || "General"}
                      </span>
                    </td>
                    <td>
                      <a
                        href={proj.url || proj.project_link}
                        target="_blank"
                        rel="noreferrer"
                        className="project-admin-url"
                      >
                        <span>{domain}</span>
                        <ExternalLink size={12} />
                      </a>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-green">
                        Live Production
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "0.45rem" }}>
                        <button
                          type="button"
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => handleEdit(proj)}
                          title="Edit Project"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => setDeletingProject(proj)}
                          title="Delete from Database"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add / Edit Modal With Live Website Screenshot Detection ─── */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProject ? "Edit Project Details" : "Add New Live Project"}
              </h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingProject(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProject} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Official Website URL *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com or dealex.pk"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  required
                />
              </div>

              {/* Live Preview Display */}
              {(form.image.trim() || liveInputUrl) && (
                <div style={{ background: "var(--admin-surface-soft)", padding: "0.85rem", borderRadius: "var(--radius)", border: "1px solid var(--admin-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Sparkles size={14} />
                      <span>{form.image.trim() ? "Custom Image Preview" : "Live Website Screen Preview"}</span>
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "140px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#0f172a", position: "relative" }}>
                    {form.image.trim() ? (
                      <img
                        src={form.image.trim()}
                        alt="Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                      />
                    ) : (
                      <AdminCardIframe targetUrl={liveInputUrl} title="Live Preview" containerHeight={140} />
                    )}
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Project / Brand Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. USA Insulation SE Houston"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="General">General</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="E-Commerce Platforms">E-Commerce Platforms</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="Digital Skills Platform">Digital Skills Platform</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Client / Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Edinburgh, UK or Houston, Texas"
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Comprehensive description of the website services, features, and target audience..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom Image URL (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Leave blank to use auto-detected website screenshot"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingProject(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  {editingProject ? "Update Project" : "Save Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deletingProject && (
        <div className="admin-modal-overlay" onClick={() => setDeletingProject(null)}>
          <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="confirm-dialog-title">Delete Project?</h3>
              <p className="confirm-dialog-text">
                Are you sure you want to permanently delete <strong>"{deletingProject.title}"</strong> from your live portfolio and database? This action cannot be undone.
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setDeletingProject(null)}
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
