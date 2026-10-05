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

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
          {/* Avatar Picker with Device Upload & Fallback Google-Style Avatar */}
          <div className="profile-avatar-section">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Profile Avatar"
                className="profile-avatar-circle"
              />
            ) : (
              <div className="profile-avatar-circle" title="Google-style Initials Fallback">
                <span>{fallbackInitials}</span>
              </div>
            )}

            <div className="profile-avatar-actions">
              <button
                type="button"
                className="btn-admin btn-admin-secondary btn-admin-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>Upload Photo</span>
              </button>

              {form.avatar && (
                <button
                  type="button"
                  className="btn-admin btn-admin-danger btn-admin-sm"
                  onClick={handleRemoveImage}
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--admin-muted)", marginTop: "0.4rem" }}>
              Upload custom photo or use Google-style initials fallback ({fallbackInitials})
            </span>
          </div>

          <div className="profile-form-grid">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className="form-input"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className="form-input"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Role / Title *</label>
            <input
              type="text"
              className="form-input"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biography / Notes</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-admin btn-admin-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-admin btn-admin-primary">
              <Save size={16} />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
