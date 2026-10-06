import React, { useState, useEffect } from "react";
import { Mail, Lock, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import Logo from "@/components/Logo/Logo";
import { useAuth } from "./AuthContext";
import "./LoginView.css";

export default function LoginView({ onClose = () => {} }) {
  const { signIn, toastAlert } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    const res = await signIn(email, password);
    if (res.success) {
      setTimeout(() => {
        onClose();
      }, 700);
    }
  };

  return (
    <>
      {/* ─── Top-Right Fixed Alert Notification Banner ─── */}
      {toastAlert && (
        <div className={`top-right-alert ${toastAlert.type}`} suppressHydrationWarning>
          {toastAlert.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{toastAlert.message}</span>
        </div>
      )}

      {/* ─── Blurred Glassmorphism Backdrop ─── */}
      <div className="login-view-backdrop" suppressHydrationWarning>
        {/* Brand Logo */}
        <div className="login-brand-logo" suppressHydrationWarning>
          <Logo size={46} variant="light" />
        </div>

        {/* Login Card */}
        <div className="login-view-card" suppressHydrationWarning>
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome Back</h2>
            <p className="login-card-subtitle">
              Enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSignInSubmit} className="auth-form">
            <div className="auth-input-wrapper">
              <Mail size={18} className="auth-input-icon" />
              <input
                type="email"
                className="auth-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-wrapper">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                className="auth-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="auth-submit-btn">
              <span>Sign In</span>
            </button>
          </form>

          {/* Hint Under Sign In Button */}
          <div className="auth-hint-box">
            <span style={{ display: "flex", alignItems: "center", gap: "5px", width: "100%", justifyContent: "center" }}>
              <Sparkles size={14} />
              <span>Hint: <strong>admin@digitalskillshouse.pk</strong> | Pass: <strong>admin</strong></span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
