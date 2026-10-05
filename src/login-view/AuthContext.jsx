import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const SAMPLE_JWT_TOKEN =
  import.meta.env.VITE_JWT_TOKEN ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

export const DEFAULT_ADMIN = {
  id: "admin-default-01",
  firstName: "Admin",
  lastName: "",
  name: "Admin",
  email: "admin@digitalskillshouse.pk",
  password: "admin",
  role: "Administrator",
  avatar: null,
  initials: "AD",
  bio: "Lead System Administrator & Software Engineer at Digital Skills House.",
};

const AUTH_STORAGE_KEY = "colabify_auth_current_user";
const USERS_STORAGE_KEY = "colabify_registered_users";
const TOKEN_STORAGE_KEY = "colabify_jwt_token";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(DEFAULT_ADMIN);
  const [token, setToken] = useState(SAMPLE_JWT_TOKEN);
  const [toastAlert, setToastAlert] = useState(null); // { type: 'success'|'danger', message: '' }
  const [isMounted, setIsMounted] = useState(false);

  // Helper to compute initials from first and last name
  const computeInitials = (firstName = "", lastName = "", name = "") => {
    if (firstName && lastName) {
      return (firstName[0] + lastName[0]).toUpperCase();
    }
    const combined = (name || `${firstName} ${lastName}`).trim();
    if (!combined) return "AD";
    const parts = combined.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return combined.slice(0, 2).toUpperCase();
  };

  // Show top-right fixed alert notification
  const triggerToast = (type, message) => {
    setToastAlert({ type, message });
    setTimeout(() => {
      setToastAlert(null);
    }, 4500);
  };

  // Sync state on load after mount (prevents SSR hydration mismatch)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window === "undefined") return;
    try {
      const savedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.name === "Haris Javed" || parsed.firstName === "Haris") {
          parsed.firstName = "Admin";
          parsed.lastName = "";
          parsed.name = "Admin";
          parsed.initials = "AD";
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
        setToken(savedToken || SAMPLE_JWT_TOKEN);
      } else {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN));
        localStorage.setItem(TOKEN_STORAGE_KEY, SAMPLE_JWT_TOKEN);
      }
    } catch {
      setCurrentUser(DEFAULT_ADMIN);
      setToken(SAMPLE_JWT_TOKEN);
    }
  }, []);

  // Sync user to MongoDB Atlas
  const syncUserToDb = async (userObj) => {
    try {
      await fetch("/api/atlas/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userObj),
      });
    } catch (err) {
      console.warn("MongoDB Atlas User sync warning:", err);
    }
  };

  // Get all registered users from local storage & database
  const getRegisteredUsers = useCallback(() => {
    try {
      const local = localStorage.getItem(USERS_STORAGE_KEY);
      const parsed = local ? JSON.parse(local) : [];
      return [DEFAULT_ADMIN, ...parsed.filter((u) => u.email !== DEFAULT_ADMIN.email)];
    } catch {
      return [DEFAULT_ADMIN];
    }
  }, []);

  // ─── SIGN IN ───
  const signIn = async (email, password) => {
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const users = getRegisteredUsers();
    const match = users.find(
      (u) =>
        u.email.toLowerCase() === cleanEmail &&
        (u.password === cleanPassword || (cleanEmail === DEFAULT_ADMIN.email && (cleanPassword === "admin" || cleanPassword === "admin123")))
    );

    if (match) {
      const userWithInitials = {
        ...match,
        initials: computeInitials(match.firstName, match.lastName, match.name),
      };
      setCurrentUser(userWithInitials);
      setToken(SAMPLE_JWT_TOKEN);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userWithInitials));
      localStorage.setItem(TOKEN_STORAGE_KEY, SAMPLE_JWT_TOKEN);

      triggerToast("success", "Login Successful");
      return { success: true, user: userWithInitials };
    } else {
      triggerToast("danger", "Login Failed");
      return { success: false, message: "Invalid Email ID or Password" };
    }
  };

  // ─── SIGN UP ───
  const signUp = async ({ firstName, lastName, role, email, password, confirmPassword }) => {
    const cleanFirst = (firstName || "").trim();
    const cleanLast = (lastName || "").trim();
    const cleanRole = (role || "Administrator").trim();
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();
    const cleanConfirm = (confirmPassword || "").trim();

    if (!cleanFirst || !cleanLast || !cleanEmail || !cleanPass) {
      triggerToast("danger", "Please fill in all required fields");
      return { success: false, message: "All fields are required" };
    }

    if (cleanPass !== cleanConfirm) {
      triggerToast("danger", "Passwords do not match");
      return { success: false, message: "Passwords do not match" };
    }

    const users = getRegisteredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      triggerToast("danger", "Email ID is already registered");
      return { success: false, message: "Email already registered" };
    }

    const fullName = `${cleanFirst} ${cleanLast}`;
    const initials = computeInitials(cleanFirst, cleanLast, fullName);

    const newUser = {
      id: `user-${Date.now()}`,
      firstName: cleanFirst,
      lastName: cleanLast,
      name: fullName,
      email: cleanEmail,
      password: cleanPass,
      role: cleanRole,
      avatar: null,
      initials,
      bio: `${cleanRole} registered at Digital Skills House.`,
      createdAt: new Date().toISOString(),
    };

    // Save locally
    const existingLocal = getRegisteredUsers().filter((u) => u.id !== DEFAULT_ADMIN.id);
    const updatedUsers = [...existingLocal, newUser];
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    // Save as current user
    setCurrentUser(newUser);
    setToken(SAMPLE_JWT_TOKEN);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    localStorage.setItem(TOKEN_STORAGE_KEY, SAMPLE_JWT_TOKEN);

    // Sync to MongoDB Atlas database
    syncUserToDb(newUser);

    triggerToast("success", "Registration & Login Successful");
    return { success: true, user: newUser };
  };

  // ─── UPDATE PROFILE ───
  const updateProfile = async (updatedData) => {
    if (!currentUser) return;

    const fullName =
      updatedData.name ||
      `${updatedData.firstName || currentUser.firstName || ""} ${updatedData.lastName || currentUser.lastName || ""}`.trim();

    const initials = computeInitials(
      updatedData.firstName || currentUser.firstName,
      updatedData.lastName || currentUser.lastName,
      fullName
    );

    const updatedUser = {
      ...currentUser,
      ...updatedData,
      name: fullName,
      initials,
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));

    // Update in user list if registered user
    const users = getRegisteredUsers().filter((u) => u.id !== DEFAULT_ADMIN.id);
    const updatedUsers = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));

    // Sync to MongoDB Atlas database
    syncUserToDb(updatedUser);

    triggerToast("success", "Profile Updated Successfully");
    return updatedUser;
  };

  // ─── LOGOUT ───
  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        toastAlert,
        isMounted,
        signIn,
        signUp,
        updateProfile,
        logout,
        triggerToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
