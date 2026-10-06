import React, { useState, useRef } from "react";
import { X, Upload, Trash2, Save, User, Mail, Shield, Sparkles } from "lucide-react";
import { useAuth } from "./AuthContext";
import "./ProfileView.css";

export default function ProfileView({ onClose = () => {} }) {
  const { currentUser, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: currentUser?.firstName || "Admin",
    lastName: currentUser?.lastName || "",
    role: currentUser?.role || "Administrator",
    email: currentUser?.email || "admin@digitalskillshouse.pk",
    bio: currentUser?.bio || "Lead Administrator & Software Engineer.",
    avatar: currentUser?.avatar || null,
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setForm((prev) => ({ ...prev, avatar: event.target.result }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, avatar: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(form);
    onClose();
  };

  // Compute initials for fallback Google-style avatar
  const first = form.firstName.trim();
  const last = form.lastName.trim();
  const fallbackInitials =
    first && last
      ? (first[0] + last[0]).toUpperCase()
      : (first || last || "AD").slice(0, 2).toUpperCase();

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <User size={20} color="var(--brand-orange)" />
            <span>Admin Profile Settings</span>
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          {/* Avatar Upload Section */}
          <div className="profile-avatar-section">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Profile Avatar"
                className="profile-avatar-circle"
              />
            ) : (
              <div className="profile-avatar-circle">
                <span>{fallbackInitials}</span>
              </div>
            )}

            <div className="profile-avatar-actions">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload Photo</span>
              </button>
              {form.avatar && (
                <button
                  type="button"
                  className="admin-btn admin-btn--danger"
                  style={{ fontSize: "0.82rem", padding: "0.4rem 0.8rem" }}
                  onClick={handleRemoveImage}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="profile-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">First Name</label>
              <input
                type="text"
                className="admin-input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Last Name</label>
              <input
                type="text"
                className="admin-input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Role / Title</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="admin-input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Email Address</label>
            <input
              type="email"
              className="admin-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-label">Short Bio</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Brief professional background..."
            />
          </div>

          <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
            <button
              type="button"
              className="admin-btn admin-btn--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="admin-btn admin-btn--primary">
              <Save size={15} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
