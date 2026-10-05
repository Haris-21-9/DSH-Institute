import { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Briefcase,
  LayoutGrid,
  List,
  X,
  CheckCircle2,
  UploadCloud,
  Sparkles,
  Star,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  getStoredTeam,
  fetchTeamFromDb,
  addMemberToDb,
  deleteMemberFromDb,
  INITIAL_TEAM_MEMBERS,
} from "@/lib/teamClient";
import {
  getStoredHeroSettings,
  fetchHeroSettingsFromDb,
  updateHeroSettingsInDb,
  DEFAULT_HERO_TRUST,
} from "@/lib/heroTrustClient";
import "./admin.css";

export default function AdminTeam() {
  const [team, setTeam] = useState(INITIAL_TEAM_MEMBERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncNotice, setSyncNotice] = useState("");
  const fileInputRef = useRef(null);

  // Hero Trust & Rating Settings State
  const [heroSettings, setHeroSettings] = useState(DEFAULT_HERO_TRUST);
  const [heroForm, setHeroForm] = useState(DEFAULT_HERO_TRUST);
  const [isSavingHero, setIsSavingHero] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    skills: "React, Node.js, Next.js, MongoDB",
    bio: "",
    years: "5+ years",
    education: "BS Computer Science",
    image: "",
  });

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, image: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const loadTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamData, heroData] = await Promise.all([
        fetchTeamFromDb(),
        fetchHeroSettingsFromDb(),
      ]);
      if (teamData && Array.isArray(teamData)) {
        setTeam(teamData);
      }
      if (heroData) {
        setHeroSettings(heroData);
        setHeroForm(heroData);
      }
    } catch {
      setTeam(getStoredTeam());
      setHeroSettings(getStoredHeroSettings());
      setHeroForm(getStoredHeroSettings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setTeam(getStoredTeam());
    const initialHero = getStoredHeroSettings();
    setHeroSettings(initialHero);
    setHeroForm(initialHero);

    loadTeam();

    const handleStorage = () => {
      setTeam(getStoredTeam());
      const h = getStoredHeroSettings();
      setHeroSettings(h);
      setHeroForm(h);
    };
    const handleCustomEvent = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setTeam(e.detail);
      } else {
        setTeam(getStoredTeam());
      }
    };
    const handleHeroTrustEvent = (e) => {
      if (e.detail) {
        setHeroSettings(e.detail);
        setHeroForm(e.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("colabify_team_updated", handleCustomEvent);
    window.addEventListener("colabify_hero_trust_updated", handleHeroTrustEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("colabify_team_updated", handleCustomEvent);
      window.removeEventListener("colabify_hero_trust_updated", handleHeroTrustEvent);
    };
  }, [loadTeam]);

  // ─── SAVE HERO TRUST & STARS SETTINGS ───
  const handleSaveHeroTrust = async (e) => {
    e.preventDefault();
    setIsSavingHero(true);

    try {
      const updated = await updateHeroSettingsInDb(heroForm);
      setHeroSettings(updated);
      setSyncNotice("Hero Stars & Trust Rating updated in MongoDB Atlas!");
      setTimeout(() => setSyncNotice(""), 3500);
    } catch (err) {
      console.error("Save hero trust error:", err);
    } finally {
      setIsSavingHero(false);
    }
  };

  // ─── QUICK MEMBER PHOTO UPLOAD DIRECTLY FROM CARD ───
  const handleQuickPhotoUpload = (member, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const photoData = event.target.result;
        const updatedMember = { ...member, image: photoData };

        setTeam((prev) =>
          prev.map((m) => (String(m.id) === String(member.id) ? updatedMember : m))
        );
        setSyncNotice(`Profile photo updated for ${member.name}!`);
        setTimeout(() => setSyncNotice(""), 3500);

        try {
          await addMemberToDb(updatedMember);
        } catch (err) {
          console.error("Quick photo save error:", err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── ADD OR UPDATE TEAM MEMBER WITH INSTANT MODAL CLOSE ───
  const handleSaveMember = async (e) => {
    e.preventDefault();
    if (!form.name || !form.role) return;

    const isEdit = !!editingMember;
    const currentEdit = editingMember;

    // 1. Instantly close modal and return to main team page
    setShowAddModal(false);
    setEditingMember(null);

    const skillsArray = form.skills
      ? form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : ["Engineering", "Development"];

    const memberObj = {
      id: isEdit ? currentEdit.id : Date.now(),
      name: form.name.trim(),
      role: form.role.trim(),
      bio: form.bio.trim() || `${form.name} is an expert ${form.role} driving innovation and development.`,
      years: form.years || "5+ years",
      education: form.education || "Software Engineering",
      skills: skillsArray,
      image: form.image ? form.image.trim() : (currentEdit?.image || ""),
    };

    // 2. Immediately update UI view
    setTeam((prev) => {
      const exists = prev.some((m) => String(m.id) === String(memberObj.id));
      if (exists) {
        return prev.map((m) => (String(m.id) === String(memberObj.id) ? { ...m, ...memberObj } : m));
      }
      return [memberObj, ...prev];
    });

    setSyncNotice(isEdit ? "Team member updated in MongoDB Atlas!" : "Team member saved to MongoDB Atlas!");
    setTimeout(() => setSyncNotice(""), 3500);

    setForm({
      name: "",
      role: "",
      skills: "React, Node.js, Next.js, MongoDB",
      bio: "",
      years: "5+ years",
      education: "BS Computer Science",
      image: "",
    });

    // 3. Save to MongoDB Atlas in background
    try {
      const updated = await addMemberToDb(memberObj);
      if (updated && Array.isArray(updated)) {
        setTeam(updated);
      }
    } catch (err) {
      console.error("Background team save error:", err);
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setForm({
      name: member.name || "",
      role: member.role || "",
      skills: Array.isArray(member.skills) ? member.skills.join(", ") : member.skills || "",
      bio: member.bio || "",
      years: member.years || "5+ years",
      education: member.education || "",
      image: member.image || "",
    });
    setShowAddModal(true);
  };

  const [deletingMember, setDeletingMember] = useState(null);

  const confirmDelete = async () => {
    if (!deletingMember) return;
    const target = deletingMember;
    setDeletingMember(null); // Instantly close delete modal!

    setTeam((prev) => prev.filter((m) => String(m.id) !== String(target.id))); // Instantly remove card!
    setSyncNotice(`Team member "${target.name}" has been permanently removed.`);
    setTimeout(() => setSyncNotice(""), 3500);

    try {
      await deleteMemberFromDb(target.id);
    } catch (err) {
      console.error("Delete team member error:", err);
    }
  };

  const filtered = team.filter((m) => {
    const q = searchQuery.toLowerCase();
    const skillsMatch = Array.isArray(m.skills) && m.skills.some((s) => s.toLowerCase().includes(q));
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.role && m.role.toLowerCase().includes(q)) ||
      skillsMatch
    );
  });

  return (
    <AdminLayout
      pageTitle="Team Directory & Hero Profiles"
      pageEyebrow="DATABASE & HUMAN CAPITAL"
      pageSubtitle={`Managing ${team.length} verified engineering leads & mentors linked directly to the Home Hero section.`}
      activeNav="team"
      onSearch={(q) => setSearchQuery(q)}
      actions={
        <button
          type="button"
          className="btn-admin btn-admin-primary"
          onClick={() => {
            setEditingMember(null);
            setForm({
              name: "",
              role: "",
              skills: "React, Node.js, Next.js, MongoDB",
              bio: "",
              years: "5+ years",
              education: "BS Computer Science",
              image: "",
            });
            setShowAddModal(true);
          }}
        >
          <Plus size={16} />
          <span>Add Team Member</span>
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

      {/* ─── HERO SECTION STARS & PROFILES MANAGER ─── */}
      <div
        className="panel"
        style={{
          background: "linear-gradient(180deg, var(--admin-card-bg) 0%, var(--admin-surface-soft) 100%)",
          border: "1px solid var(--brand-orange-border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", marginBottom: "1rem", borderBottom: "1px solid var(--admin-border-light)", paddingBottom: "0.85rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "var(--brand-orange-tint)", color: "var(--brand-orange)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Star size={16} fill="currentColor" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--admin-text-strong)" }}>
                Hero Section Stars, Rating &amp; Team Profiles
              </h3>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--admin-muted)" }}>
              Customise the stars rating, score, and subtitle that appear under the main Home Hero heading. Team profiles automatically sync from below.
            </p>
          </div>

          {/* Live Hero Badge Preview */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#0b1120",
              padding: "8px 16px",
              borderRadius: "9999px",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {team.slice(0, 4).map((m, idx) => (
                <div
                  key={`hero-preview-avatar-${idx}`}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    marginLeft: idx === 0 ? "0" : "-10px",
                    border: "2px solid #ffffff",
                    overflow: "hidden",
                    background: "linear-gradient(135deg, #fa7126, #ea580c)",
                    color: "#111827",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "12px",
                  }}
                  title={`${m.name} (${m.role})`}
                >
                  {m.image ? (
                    <img src={m.image} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    m.name ? m.name.charAt(0) : "M"
                  )}
                </div>
              ))}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", lineHeight: 1 }}>
                <span style={{ color: "#f59e0b", fontSize: "12px", letterSpacing: "1px" }}>
                  {heroForm.starsText || "★★★★★"}
                </span>
                <span style={{ color: "#0f172a", background: "rgba(255, 255, 255, 0.8)", padding: "1px 5px", borderRadius: "4px", fontSize: "11px", fontWeight: 800 }}>
                  {heroForm.ratingScore || "4.9/5"}
                </span>
              </div>
              <span style={{ color: "#e2e8f0", fontSize: "11px", fontWeight: 600, display: "block", marginTop: "2px" }}>
                {heroForm.trustText || "Trusted by 5,000+ Students & Clients"}
              </span>
            </div>
          </div>
        </div>

        {/* Hero Settings Edit Form */}
        <form onSubmit={handleSaveHeroTrust} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) auto", gap: "1rem", alignItems: "flex-end" }}>
          <div>
            <label className="form-label" style={{ fontSize: "0.8rem" }}>Stars Visual</label>
            <select
              className="form-input"
              style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
              value={heroForm.starsText}
              onChange={(e) => setHeroForm({ ...heroForm, starsText: e.target.value })}
            >
              <option value="★★★★★">★★★★★ (5.0 Full Stars)</option>
              <option value="★★★★½">★★★★½ (4.9 / 4.8 Stars)</option>
              <option value="★★★★☆">★★★★☆ (4.0 Stars)</option>
            </select>
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "0.8rem" }}>Rating Score</label>
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="e.g. 4.9/5 or 5.0/5"
              value={heroForm.ratingScore}
              onChange={(e) => setHeroForm({ ...heroForm, ratingScore: e.target.value })}
            />
          </div>

          <div>
            <label className="form-label" style={{ fontSize: "0.8rem" }}>Hero Trust Subtitle</label>
            <input
              type="text"
              className="form-input"
              style={{ padding: "0.55rem 0.75rem", fontSize: "0.85rem" }}
              placeholder="e.g. Trusted by 5,000+ Students & Clients"
              value={heroForm.trustText}
              onChange={(e) => setHeroForm({ ...heroForm, trustText: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-admin btn-admin-primary"
            disabled={isSavingHero}
            style={{ padding: "0.6rem 1.25rem", whiteSpace: "nowrap" }}
          >
            <Sparkles size={15} />
            <span>{isSavingHero ? "Saving..." : "Save Hero Stars & Rating"}</span>
          </button>
        </form>
      </div>

      {/* ─── View Switcher & Counter ─── */}
      <div className="admin-filter-bar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--admin-muted)" }}>
            Showing {filtered.length} of {team.length} Members in Database (First 4 appear in Home Hero)
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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

      {/* ─── Grid View ─── */}
      {viewMode === "grid" ? (
        <div className="team-admin-grid">
          {filtered.map((member, idx) => {
            const initial = member.name ? member.name.charAt(0).toUpperCase() : "M";
            return (
              <div key={`admin-team-card-${member.id || 'm'}-${idx}`} className="team-admin-card" style={{ position: "relative" }}>
                {/* Hero Featured Badge */}
                {idx < 4 && (
                  <span
                    style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "var(--brand-orange-tint)",
                      color: "var(--brand-orange-dark)",
                      border: "1px solid var(--brand-orange-border)",
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <Star size={11} fill="currentColor" />
                    <span>Hero Featured</span>
                  </span>
                )}

                {/* Avatar with Quick Upload Trigger */}
                <div
                  className="team-admin-avatar"
                  style={{ position: "relative", cursor: "pointer", margin: "0 auto 0.75rem" }}
                  title="Click to upload/change photo"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = "image/*";
                    input.onchange = (e) => {
                      const f = e.target.files?.[0];
                      if (f) handleQuickPhotoUpload(member, f);
                    };
                    input.click();
                  }}
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    initial
                  )}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "var(--brand-orange)",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                    }}
                    title="Upload profile photo"
                  >
                    <Camera size={13} />
                  </div>
                </div>

                <h3 className="team-admin-name">{member.name}</h3>
                <span className="team-admin-role">{member.role}</span>

                <p className="team-admin-bio">{member.bio || `${member.name} contributes key engineering leadership.`}</p>

                <div className="team-skills-tags">
                  {Array.isArray(member.skills) &&
                    member.skills.slice(0, 4).map((skill, sIdx) => (
                      <span key={`skill-${sIdx}`} className="team-skill-tag">
                        {skill}
                      </span>
                    ))}
                </div>

                <div style={{ marginTop: "auto", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.85rem", borderTop: "1px solid var(--admin-border-light)" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--admin-muted)", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Briefcase size={13} />
                    <span>{member.years || "5+ yrs exp"}</span>
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem" }}>
                    <button
                      type="button"
                      className="btn-admin btn-admin-secondary btn-admin-sm"
                      onClick={() => handleEdit(member)}
                    >
                      <Edit3 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      className="btn-admin btn-admin-danger btn-admin-sm"
                      onClick={() => setDeletingMember(member)}
                    >
                      <Trash2 size={14} />
                    </button>
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
                  <th>Member Name &amp; Photo</th>
                  <th>Role</th>
                  <th>Hero Status</th>
                  <th>Skills / Stack</th>
                  <th>Experience</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((member, idx) => (
                  <tr key={`admin-team-row-${member.id || 'm'}-${idx}`}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div
                          style={{ position: "relative", cursor: "pointer" }}
                          title="Click to change photo"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const f = e.target.files?.[0];
                              if (f) handleQuickPhotoUpload(member, f);
                            };
                            input.click();
                          }}
                        >
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "2px solid var(--brand-orange)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "38px",
                                height: "38px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, var(--brand-orange), var(--brand-orange-dark))",
                                color: "var(--ink)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: "0.85rem",
                              }}
                            >
                              {member.name ? member.name.charAt(0) : "M"}
                            </div>
                          )}
                          <div
                            style={{
                              position: "absolute",
                              bottom: "-2px",
                              right: "-2px",
                              width: "16px",
                              height: "16px",
                              borderRadius: "50%",
                              background: "var(--brand-orange)",
                              color: "#111827",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Camera size={9} />
                          </div>
                        </div>
                        <div>
                          <strong style={{ color: "var(--admin-text-strong)" }}>{member.name}</strong>
                          <div style={{ fontSize: "0.78rem", color: "var(--admin-muted)" }}>
                            {member.education || "Verified Mentor"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-admin badge-admin-orange">{member.role}</span>
                    </td>
                    <td>
                      {idx < 4 ? (
                        <span className="badge-admin badge-admin-orange" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Star size={11} fill="currentColor" />
                          <span>Hero Avatar #{idx + 1}</span>
                        </span>
                      ) : (
                        <span className="badge-admin badge-admin-green">
                          Atlas Saved
                        </span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "260px" }}>
                        {Array.isArray(member.skills) &&
                          member.skills.slice(0, 3).map((s, sIdx) => (
                            <span key={`t-skill-${sIdx}`} className="team-skill-tag" style={{ fontSize: "0.7rem" }}>
                              {s}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>{member.years || "5+ years"}</td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }}>
                        <button
                          type="button"
                          className="btn-admin btn-admin-secondary btn-admin-sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => setDeletingMember(member)}
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

      {/* ─── Add / Edit Team Member Modal ─── */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingMember ? "Edit Team Member" : "Add Member to MongoDB Atlas"}</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMember(null);
                }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Role / Position *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                />
              </div>

              {/* ─── Profile Photo Upload Field (Device + URL) ─── */}
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>Member Profile Photo</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--brand-orange)", fontWeight: 700 }}>Featured in Hero &amp; Team</span>
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />

                {!form.image ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
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
                          onClick={() => fileInputRef.current?.click()}
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.74rem" }}
                        >
                          Change
                        </button>
                        <button
                          type="button"
                          className="btn-admin btn-admin-danger btn-admin-sm"
                          onClick={() => setForm({ ...form, image: "" })}
                          style={{ padding: "0.25rem 0.65rem", fontSize: "0.74rem" }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "60px", height: "60px", borderRadius: "50%", overflow: "hidden", background: "#0f172a", flexShrink: 0, border: "2px solid var(--brand-orange)" }}>
                        <img
                          src={form.image}
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
                          value={form.image}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {!form.image && (
                  <input
                    type="text"
                    className="form-input"
                    style={{ marginTop: "0.6rem", fontSize: "0.82rem" }}
                    placeholder="Or paste external photo URL (https://...)"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                  />
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="React, TypeScript, Node.js, GraphQL, AWS"
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Experience</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 6+ years"
                  value={form.years}
                  onChange={(e) => setForm({ ...form, years: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Education / Qualification</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. BS Computer Science"
                  value={form.education}
                  onChange={(e) => setForm({ ...form, education: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biography / Background</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Short introduction, achievements, and key specializations..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-admin btn-admin-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingMember(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin btn-admin-primary">
                  {editingMember ? "Update Member" : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Team Member Modal ─── */}
      {deletingMember && (
        <div className="admin-modal-overlay" onClick={() => setDeletingMember(null)}>
          <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon">
              <Trash2 size={26} />
            </div>
            <div>
              <h3 className="confirm-dialog-title">Remove Team Member?</h3>
              <p className="confirm-dialog-text">
                Are you sure you want to permanently remove <strong>"{deletingMember.name}"</strong> ({deletingMember.role}) from the database? This action cannot be undone.
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setDeletingMember(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admin btn-admin-danger"
                onClick={confirmDelete}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
