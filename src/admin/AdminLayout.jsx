import { useState, useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Globe,
  Users,
  FileText,
  ExternalLink,
  Menu,
  Moon,
  Sun,
  ArrowUpRight,
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";
import Logo from "@/components/Logo/Logo";
import { useAuth } from "./AuthContext";
import LoginView from "./LoginView";
import ProfileView from "./ProfileView";
import "./admin.css";

export default function AdminLayout({
  children,
  pageTitle = "Dashboard",
  pageEyebrow = "OVERVIEW",
  pageSubtitle = "Colabify & Digital Skills House Control Center",
  actions = null,
  activeNav = "dashboard",
  onSearch = () => {},
}) {
  const { currentUser, logout, toastAlert } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const dropdownRef = useRef(null);

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin_theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowAccountMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("admin_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const handleConfirmLogout = () => {
    logout();
    setShowLogoutModal(false);
    setShowAccountMenu(false);
    setShowLoginModal(true);
  };

  const adminUser = currentUser || {
    name: "Admin",
    role: "Administrator",
    email: "admin@digitalskillshouse.pk",
    initials: "AD",
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, to: "/admin" },
    { id: "projects", label: "Projects", icon: Globe, to: "/admin/projects" },
    { id: "team", label: "Team Members", icon: Users, to: "/admin/team" },
    { id: "blog", label: "Blog Articles", icon: FileText, to: "/admin/blog" },
  ];

  const isCurrentActive = (item) => {
    if (activeNav) {
      return activeNav === item.id;
    }
    if (item.id === "dashboard") {
      return (
        pathname === "/admin" ||
        pathname === "/admin/" ||
        pathname === "/adminpanel" ||
        pathname === "/adminpanel/"
      );
    }
    return pathname === item.to || pathname.startsWith(`${item.to}/`);
  };

  return (
    <div className="admin-shell">
      {/* ─── Top-Right Fixed Alert Toast ─── */}
      {toastAlert && (
        <div className={`top-right-alert ${toastAlert.type}`}>
          <span>{toastAlert.message}</span>
        </div>
      )}

      {/* ─── Login System Modal (If user clicks Login or unauthenticated) ─── */}
      {(!currentUser || showLoginModal) && (
        <LoginView onClose={() => setShowLoginModal(false)} />
      )}

      {/* ─── Profile Edit Modal ─── */}
      {showProfileModal && (
        <ProfileView onClose={() => setShowProfileModal(false)} />
      )}

      {/* Mobile Backdrop */}
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Admin Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link to="/admin" className="brand-mark">
            <Logo size={36} variant="light" />
            <div className="brand-copy">
              <span className="brand-title">Digital Skill House</span>
              <span className="brand-subtitle">Administration</span>
            </div>
          </Link>
        </div>

        <div className="sidebar-nav-section-title">Core Management</div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={`nav-link ${isCurrentActive(item) ? "active" : ""}`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="nav-icon">
                  <Icon size={18} />
                </span>
                <span className="nav-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-nav-section-title">External Links</div>

        <nav className="sidebar-nav">
          <Link to="/" className="nav-link" target="_blank">
            <span className="nav-icon">
              <ExternalLink size={18} />
            </span>
            <span className="nav-text">Public Website</span>
          </Link>
        </nav>

        {/* Sidebar User Footer (Admin with name & Administrator role) */}
        <div className="sidebar-user" onClick={() => setShowProfileModal(true)} style={{ cursor: "pointer" }} title="Click to view/edit profile">
          <div className="sidebar-user-avatar">
            {adminUser.avatar ? (
              <img
                src={adminUser.avatar}
                alt={adminUser.name}
                style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <span>{adminUser.initials || "AD"}</span>
            )}
            <span className="status-dot" title="Administrator Online" />
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{adminUser.name || "Admin"}</span>
            <span className="sidebar-user-role">{adminUser.role || "Administrator"}</span>
          </div>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle navigation"
            >
              <Menu size={18} />
            </button>

            {/* Topbar Welcome Text (Welcome back, Admin Name) */}
            <div className="topbar-welcome">
              <div className="welcome-main">
                <span className="welcome-text">
                  Welcome back, <strong className="welcome-name">{adminUser.name || "Admin"}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="topbar-icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Google-Style Circular Account ID Avatar Button */}
            <div className="topbar-account-container" ref={dropdownRef}>
              <button
                type="button"
                className={`account-avatar-btn ${showAccountMenu ? "active" : ""}`}
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                title={`Account: ${adminUser.name}`}
                aria-label="Account Settings & Logout"
              >
                {adminUser.avatar ? (
                  <img
                    src={adminUser.avatar}
                    alt={adminUser.name}
                    style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <span>{adminUser.initials || "AD"}</span>
                )}
                <span className="status-dot" />
              </button>

              {/* Account Dropdown Menu */}
              {showAccountMenu && (
                <div className="account-dropdown-menu">
                  <div className="dropdown-user-header" onClick={() => { setShowAccountMenu(false); setShowProfileModal(true); }} style={{ cursor: "pointer" }}>
                    <div className="dropdown-user-avatar">
                      {adminUser.avatar ? (
                        <img
                          src={adminUser.avatar}
                          alt={adminUser.name}
                          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{adminUser.initials || "AD"}</span>
                      )}
                    </div>
                    <div className="dropdown-user-info">
                      <span className="dropdown-user-name">{adminUser.name || "Admin"}</span>
                      <span className="dropdown-user-role">{adminUser.role || "Administrator"}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => {
                      setShowAccountMenu(false);
                      setShowProfileModal(true);
                    }}
                  >
                    <User size={16} color="var(--brand-orange)" />
                    <span>Edit Profile</span>
                  </button>

                  <button
                    type="button"
                    className="dropdown-item danger"
                    onClick={() => {
                      setShowAccountMenu(false);
                      setShowLogoutModal(true);
                    }}
                  >
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="admin-content">
          <div className="page-heading">
            <div className="page-heading-left">
              <span className="eyebrow">{pageEyebrow}</span>
              <h1 className="page-title">{pageTitle}</h1>
              <p className="page-subtitle">{pageSubtitle}</p>
            </div>
            {actions && <div className="heading-actions">{actions}</div>}
          </div>

          {children}
        </main>
      </div>

      {/* Logout Confirmation Popup Modal */}
      {showLogoutModal && (
        <div className="admin-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-dialog-icon">
              <LogOut size={26} color="var(--brand-orange)" />
            </div>
            <div>
              <h3 className="confirm-dialog-title">Log Out of Admin Panel?</h3>
              <p className="confirm-dialog-text">
                Are you sure you want to log out of <strong>{adminUser.name}</strong>'s Digital Skill House administration session?
              </p>
            </div>
            <div className="confirm-dialog-actions">
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admin btn-admin-primary"
                style={{ background: "var(--brand-orange)", borderColor: "var(--brand-orange)" }}
                onClick={handleConfirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
