import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  Globe,
  Users,
  FileText,
  Database,
  Plus,
  Eye,
  Edit3,
  Trash2,
  ExternalLink,
  ArrowRight,
  X,
  CheckCircle2,
  Sparkles,
  UploadCloud,
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
import {
  getStoredTeam,
  fetchTeamFromDb,
  addMemberToDb,
  INITIAL_TEAM_MEMBERS,
} from "@/lib/teamClient";
import {
  getStoredBlogs,
  fetchBlogsFromDb,
  addBlogToDb,
  INITIAL_BLOGS,
} from "@/lib/blogsClient";
import blog1 from "@/assets/blog-1.jpg";
import { createProjectFromInternet } from "@/lib/webScraper";
import "./admin.css";

export default function Admin() {
  const [projects, setProjects] = useState(() => SEED_PROJECTS.map((p, idx) => formatProjectItem(p, idx)));
  const [team, setTeam] = useState(INITIAL_TEAM_MEMBERS);
  const [blogs, setBlogs] = useState(INITIAL_BLOGS);
  const [isLoading, setIsLoading] = useState(true);
  const blogFileInputRef = useRef(null);
  const teamFileInputRef = useRef(null);

  const handleTeamFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setTeamForm((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Modals
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [showAddBlogModal, setShowAddBlogModal] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  // Forms
  const [projectForm, setProjectForm] = useState({
    title: "",
    url: "",
    category: "Web Development",
    client: "",
    description: "",
    image: "",
  });

  const [teamForm, setTeamForm] = useState({
    name: "",
    role: "",
    skills: "React, Node.js, Next.js, MongoDB",
    bio: "",
    years: "5+ years",
    education: "BS Computer Science",
    image: "",
  });

  const [blogForm, setBlogForm] = useState({
    title: "",
    url: "",
    category: "Web Development",
    excerpt: "",
    readTime: "5 min read",
    author: "Admin",
    image: "",
  });

  const handleBlogFileUpload = (e) => {
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

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pData, tData, bData] = await Promise.all([
        fetchProjectsFromDb(),
        fetchTeamFromDb(),
        fetchBlogsFromDb(),
      ]);
      if (pData) setProjects(pData);
      if (tData) setTeam(tData);
      if (bData) setBlogs(bData);
    } catch (err) {
      console.error("Admin dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setProjects(getStoredProjects());
    setTeam(getStoredTeam());
    setBlogs(getStoredBlogs());
    loadAllData();

    const handleStorageChange = () => {
      setProjects(getStoredProjects());
      setTeam(getStoredTeam());
      setBlogs(getStoredBlogs());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadAllData]);

  // ─── ADD OR UPDATE PROJECT WITH INSTANT MODAL CLOSE ───
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projectForm.url) return;

    let targetUrl = projectForm.url.trim();
    if (!targetUrl.startsWith("http")) targetUrl = `https://${targetUrl}`;

    const isEdit = !!editingProject;
    const currentEdit = editingProject;

    // 1. Instantly close modal and return to page
    setShowAddProjectModal(false);
    setEditingProject(null);

    let autoTitle = projectForm.title.trim();
    let autoClient = projectForm.client.trim();
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

    const autoImage = projectForm.image?.trim() || `https://image.thum.io/get/width/1200/crop/800/${targetUrl}`;

    const instantProj = {
      id: isEdit ? currentEdit.id : Date.now(),
      title: autoTitle,
      url: targetUrl,
      project_link: targetUrl,
      liveUrl: targetUrl,
      category: projectForm.category || "Web Development",
      client: autoClient || "Client",
      description: projectForm.description.trim() || "High-performance digital web solution.",
      badge: "LIVE SITE",
      image: autoImage,
    };

    // 2. Immediately update state view
    setProjects((prev) => {
      const exists = prev.some((p) => String(p.id) === String(instantProj.id));
      if (exists) {
        return prev.map((p) => (String(p.id) === String(instantProj.id) ? { ...p, ...instantProj } : p));
      }
      return [instantProj, ...prev];
    });

    setProjectForm({
      title: "",
      url: "",
      category: "Web Development",
      client: "",
      description: "",
      image: "",
    });

    // 3. Background internet analysis and DB save
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
          ...instantProj,
          title: projectForm.title.trim() || analyzedData.title || autoTitle,
          description: projectForm.description.trim() || analyzedData.overview || instantProj.description,
          image: projectForm.image?.trim() || analyzedData.image || autoImage,
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

  const handleEditProject = (proj) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title || "",
      url: proj.url || proj.project_link || "",
      category: proj.category || "Web Development",
      client: proj.client || "",
      description: proj.description || "",
      image: proj.image || "",
    });
    setShowAddProjectModal(true);
  };

  const [deletingProject, setDeletingProject] = useState(null);

  const confirmDeleteProject = async () => {
    if (!deletingProject) return;
    const target = deletingProject;
    setDeletingProject(null); // Instantly close view!

    setProjects((prev) => prev.filter((p) => String(p.id) !== String(target.id)));

    try {
      await deleteProjectFromDb(target.id);
    } catch (err) {
      console.error("Delete project error:", err);
    }
  };

  // ─── ADD TEAM MEMBER WITH INSTANT MODAL CLOSE ───
  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!teamForm.name || !teamForm.role) return;

    // 1. Instantly close modal
    setShowAddTeamModal(false);

    const skillsArray = teamForm.skills
      ? teamForm.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Engineering", "Development"];

    const newMember = {
      id: Date.now(),
      name: teamForm.name.trim(),
      role: teamForm.role.trim(),
      bio: teamForm.bio.trim() || `${teamForm.name} is an expert ${teamForm.role} driving innovation and development.`,
      years: teamForm.years || "5+ years",
      education: teamForm.education || "Software Engineering",
      skills: skillsArray,
      image: teamForm.image?.trim() || "",
    };

    // 2. Immediately update state
    setTeam((prev) => [newMember, ...prev]);

    setTeamForm({
      name: "",
      role: "",
      skills: "React, Node.js, Next.js, MongoDB",
      bio: "",
      years: "5+ years",
      education: "BS Computer Science",
      image: "",
    });

    // 3. Save in background
    try {
      const updated = await addMemberToDb(newMember);
      if (updated && Array.isArray(updated)) {
        setTeam(updated);
      }
    } catch (err) {
      console.error("Background team save error:", err);
    }
  };

  // ─── ADD BLOG ARTICLE WITH INSTANT MODAL CLOSE ───
  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title || !blogForm.excerpt) return;

    // 1. Instantly close modal
    setShowAddBlogModal(false);

    const words = blogForm.excerpt.trim().split(/\s+/).filter(Boolean).length;
    const autoReadTime = `${Math.max(1, Math.ceil(words / 35))} min read`;

    const autoDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Karachi",
    });

    const rawUrl = blogForm.url ? blogForm.url.trim() : "";
    const formattedUrl = rawUrl ? (rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`) : "";
    const autoCover = blogForm.image?.trim() || (formattedUrl ? `https://image.thum.io/get/width/1200/crop/800/${formattedUrl}` : blog1);

    const newBlog = {
      id: Date.now(),
      title: blogForm.title.trim(),
      url: formattedUrl,
      blog_link: formattedUrl,
      category: blogForm.category || "Web Development",
      excerpt: blogForm.excerpt.trim(),
      readTime: autoReadTime,
      author: blogForm.author.trim() || "Admin",
      date: autoDate,
      image: autoCover,
    };

    // 2. Immediately update state
    setBlogs((prev) => [newBlog, ...prev]);

    setBlogForm({
      title: "",
      url: "",
      category: "Web Development",
      excerpt: "",
      author: "Admin",
      image: "",
    });

    // 3. Save in background
    try {
      const updated = await addBlogToDb(newBlog);
      if (updated && Array.isArray(updated)) {
        setBlogs(updated);
      }
    } catch (err) {
      console.error("Background blog save error:", err);
    }
  };

  return (
    <AdminLayout
      pageTitle="Control Dashboard"
      pageEyebrow="PORTAL OVERVIEW"
      pageSubtitle="Manage portfolio projects, team engineers, and published blog articles."
      activeNav="dashboard"
    >
      {/* ─── Metric Cards Grid ─── */}
      <div className="metrics-grid">
        <Link to="/admin/projects" className="metric-card metric-primary metric-card-link" title="Open Projects Manager">
          <div className="metric-top">
            <span className="metric-label">Live Projects</span>
            <div className="metric-icon">
              <Globe size={20} />
            </div>
          </div>
          <div className="metric-value">{projects.length}</div>
          <div className="metric-meta">
            <span className="meta-trend-up">{projects.length} Active</span>
            <span>in production</span>
            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
          </div>
        </Link>

        <Link to="/admin/team" className="metric-card metric-success metric-card-link" title="Open Team Manager">
          <div className="metric-top">
            <span className="metric-label">Team Members</span>
            <div className="metric-icon">
              <Users size={20} />
            </div>
          </div>
          <div className="metric-value">{team.length}</div>
          <div className="metric-meta">
            <span className="meta-trend-up">{team.length} Verified</span>
            <span>engineers</span>
            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
          </div>
        </Link>

        <Link to="/admin/blog" className="metric-card metric-warning metric-card-link" title="Open Blog Manager">
          <div className="metric-top">
            <span className="metric-label">Blog Articles</span>
            <div className="metric-icon">
              <FileText size={20} />
            </div>
          </div>
          <div className="metric-value">{blogs.length}</div>
          <div className="metric-meta">
            <span className="meta-trend-up">{blogs.length} Published</span>
            <span>articles</span>
            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
          </div>
        </Link>

        <Link to="/admin/projects" className="metric-card metric-purple metric-card-link" title="Database Sync Manager">
          <div className="metric-top">
            <span className="metric-label">Database Status</span>
            <div className="metric-icon">
              <Database size={20} />
            </div>
          </div>
          <div className="metric-value">Active</div>
          <div className="metric-meta">
            <span className="meta-trend-up">MongoDB Atlas</span>
            <span>synchronized</span>
            <ArrowRight size={14} style={{ marginLeft: "auto" }} />
          </div>
        </Link>
      </div>

      {/* ─── Projects Table Section (Directly displayed without extra chart cards) ─── */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">Active Portfolio Projects ({projects.length})</h2>
            <p className="panel-subtitle">Overview of all active projects deployed and synchronized</p>
          </div>
          <Link to="/admin/projects" className="btn-admin btn-admin-secondary btn-admin-sm">
            <span>Manage All Projects</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project Title & Domain</th>
                <th>Category</th>
                <th>Official Website Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((proj, idx) => {
                let domain = "";
                try {
                  domain = new URL(proj.url || proj.project_link).hostname.replace(/^www\./, "");
                } catch {
                  domain = proj.url || proj.project_link;
                }

                return (
                  <tr key={`dash-proj-row-${proj.id || 'p'}-${idx}`}>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong style={{ color: "var(--admin-text-strong)", fontWeight: 700 }}>{proj.title}</strong>
                        <small style={{ color: "var(--admin-muted)" }}>{proj.client || domain}</small>
                      </div>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-orange">
                        {proj.category || "Web Development"}
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
                          onClick={() => handleEditProject(proj)}
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

      {/* ─── Add / Edit Project Modal ─── */}
      {showAddProjectModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddProjectModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingProject ? "Edit Project" : "Add New Live Project"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddProjectModal(false);
                  setEditingProject(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddProject} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Official Website URL *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="https://example.com or dealex.pk"
                  value={projectForm.url}
                  onChange={(e) => setProjectForm({ ...projectForm, url: e.target.value })}
                  required
                />
              </div>

              {/* Live Detected Website Screenshot Preview */}
              {(projectForm.image || projectForm.url) && (
                <div style={{ background: "var(--admin-surface-soft)", padding: "0.85rem", borderRadius: "var(--radius)", border: "1px solid var(--admin-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Sparkles size={14} />
                      <span>Website Preview Screenshot</span>
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "130px", borderRadius: "var(--radius-sm)", overflow: "hidden", background: "#0f172a" }}>
                    <img
                      src={projectForm.image?.trim() || `https://image.thum.io/get/width/1024/crop/768/noanimate/${encodeURIComponent(projectForm.url.startsWith("http") ? projectForm.url : `https://${projectForm.url}`)}`}
                      alt="Website Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Project / Brand Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DEALEX Platform"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                >
                  <option value="Web Development">Web Development</option>
                  <option value="E-Commerce Platforms">E-Commerce Platforms</option>
                  <option value="Custom Software">Custom Software</option>
                  <option value="Digital Skills Platform">Digital Skills Platform</option>
                  <option value="Mobile App Development">Mobile App Development</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Digital Skills House International"
                  value={projectForm.client}
                  onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Custom Image URL (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Leave blank to use auto-detected screenshot"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Brief summary of features, tech stack, and impact..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => {
                    setShowAddProjectModal(false);
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

      {/* ─── Add Team Member Modal ─── */}
      {showAddTeamModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddTeamModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Team Member</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddTeamModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddTeam} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Position *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Member Profile Photo</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--admin-muted)" }}>Device Upload or URL</span>
                </label>
                <input
                  ref={teamFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleTeamFileUpload}
                />

                {!teamForm.image ? (
                  <div
                    onClick={() => teamFileInputRef.current?.click()}
                    style={{
                      border: "2px dashed var(--admin-border)",
                      borderRadius: "var(--radius)",
                      padding: "1.5rem 1rem",
                      textAlign: "center",
                      cursor: "pointer",
                      background: "var(--admin-surface-soft)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "var(--brand-orange-tint)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--brand-orange)",
                      }}
                    >
                      <UploadCloud size={24} />
                    </div>
                    <div>
                      <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--admin-text-strong)" }}>
                        Click to upload photo from device
                      </strong>
                      <span style={{ fontSize: "0.76rem", color: "var(--admin-muted)" }}>
                        Supports JPG, PNG, WEBP, or SVG
                      </span>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: "var(--admin-surface-soft)", padding: "0.85rem", borderRadius: "var(--radius)", border: "1px solid var(--admin-border)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Sparkles size={14} />
                        <span>Selected Photo Preview</span>
                      </span>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => teamFileInputRef.current?.click()}
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.74rem" }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => setTeamForm({ ...teamForm, image: "" })}
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.74rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "#0f172a", flexShrink: 0, border: "2px solid var(--brand-orange)" }}>
                        <img
                          src={teamForm.image}
                          alt="Uploaded Member Avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          className="form-input"
                          style={{ fontSize: "0.8rem", padding: "0.4rem 0.6rem" }}
                          placeholder="Image URL or Base64 data"
                          value={teamForm.image}
                          onChange={(e) => setTeamForm({ ...teamForm, image: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!teamForm.image && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: "0.6rem", fontSize: "0.82rem" }}
                    placeholder="Or paste external photo URL (https://...)"
                    value={teamForm.image}
                    onChange={(e) => setTeamForm({ ...teamForm, image: e.target.value })}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, TypeScript, Node.js, GraphQL, AWS"
                  value={teamForm.skills}
                  onChange={(e) => setTeamForm({ ...teamForm, skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5+ years"
                  value={teamForm.years}
                  onChange={(e) => setTeamForm({ ...teamForm, years: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Brief biography and technical specializations..."
                  value={teamForm.bio}
                  onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setShowAddTeamModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Add Blog Modal ─── */}
      {showAddBlogModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddBlogModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Publish Blog Article</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddBlogModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddBlog} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Article Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Modern Full-Stack Architecture"
                  value={blogForm.title || ""}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  required
                />
              </div>

              {/* Blog Link / Article URL */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Blog Link / Article URL</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)", fontWeight: 700 }}>
                    Auto Live Card Preview
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. https://digitalskillshouse.pk/web-development-institute-multan"
                  value={blogForm.url || ""}
                  onChange={(e) => setBlogForm({ ...blogForm, url: e.target.value })}
                />
              </div>

              {/* ─── Auto Live Article Preview Card (Card Format) ─── */}
              {(blogForm.url.trim() || blogForm.image) && (
                <div style={{ background: "var(--admin-surface-soft)", padding: "1rem", borderRadius: "var(--radius)", border: "1px solid var(--brand-orange-border)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.65rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--brand-orange)", display: "flex", alignItems: "center", gap: "6px" }}>
                      <Sparkles size={15} />
                      <span>{blogForm.image ? "Custom Cover Image Preview" : "Live Article Website Preview Card"}</span>
                    </span>
                    {blogForm.image && (
                      <button
                        type="button"
                        className="btn-admin btn-admin-danger btn-admin-sm"
                        onClick={() => setBlogForm({ ...blogForm, image: "" })}
                        style={{ padding: "0.2rem 0.5rem", fontSize: "0.72rem" }}
                      >
                        Remove Custom Image
                      </button>
                    )}
                  </div>

                  <div style={{ background: "var(--admin-card-bg)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--admin-border)", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                    <div style={{ height: "150px", width: "100%", position: "relative", overflow: "hidden", background: "#0f172a" }}>
                      {blogForm.image ? (
                        <img src={blogForm.image} alt="Cover Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <iframe
                          src={`/api/proxy?url=${encodeURIComponent(blogForm.url.startsWith("http") ? blogForm.url.trim() : "https://" + blogForm.url.trim())}`}
                          title="Live Blog Preview"
                          style={{
                            width: "1280px",
                            height: "3200px",
                            transform: "scale(0.25)",
                            transformOrigin: "top left",
                            border: "none",
                            pointerEvents: "none",
                            background: "#ffffff",
                          }}
                        />
                      )}
                    </div>
                    <div style={{ padding: "0.85rem 1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <span style={{ fontSize: "0.68rem", fontWeight: 800, padding: "0.15rem 0.5rem", borderRadius: "4px", background: "var(--brand-orange-tint)", color: "var(--brand-orange)", textTransform: "uppercase" }}>
                          {blogForm.category || "Web Development"}
                        </span>
                      </div>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--admin-text-strong)", margin: "0 0 0.35rem 0", lineHeight: 1.3 }}>
                        {blogForm.title.trim() || "Article Title Preview"}
                      </h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--admin-muted)", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {blogForm.excerpt.trim() || "Article summary and technical breakdown will automatically appear in this card format."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Optional Custom Device Image Upload */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Custom Cover Photo (Optional)</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--admin-muted)" }}>Override default live preview image</span>
                </label>
                <input
                  ref={blogFileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleBlogFileUpload}
                />
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => blogFileInputRef.current?.click()}
                  style={{ width: "100%", justifyContent: "center", gap: "0.5rem", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
                >
                  <UploadCloud size={16} />
                  <span>{blogForm.image ? "Change Custom Image File" : "Upload Custom Image from Device (Optional)"}</span>
                </button>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={blogForm.category}
                  onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
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
                  value={blogForm.author}
                  onChange={(e) => setBlogForm({ ...blogForm, author: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Summary / Excerpt *</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  placeholder="Summary of the article..."
                  value={blogForm.excerpt}
                  onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => setShowAddBlogModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Live Website Preview Modal ─── */}
      {previewProject && (
        <div className="admin-modal-overlay" onClick={() => setPreviewProject(null)}>
          <div
            className="admin-modal-card"
            style={{ maxWidth: "900px", padding: "1.5rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{previewProject.title}</h3>
                <a
                  href={previewProject.url || previewProject.project_link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "var(--brand-orange)", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  <span>{previewProject.url || previewProject.project_link}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewProject(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div
              style={{
                width: "100%",
                height: "480px",
                borderRadius: "var(--radius)",
                overflow: "hidden",
                border: "1px solid var(--admin-border)",
                background: "#101010",
              }}
            >
              <iframe
                src={`/api/proxy?url=${encodeURIComponent(previewProject.url || previewProject.project_link)}`}
                title={previewProject.title}
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setPreviewProject(null)}
              >
                Close Preview
              </button>
              <a
                href={previewProject.url || previewProject.project_link}
                target="_blank"
                rel="noreferrer"
                className="btn-admin btn-admin-primary"
              >
                <span>Open Live Site</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Project Modal ─── */}
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
                onClick={confirmDeleteProject}
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
