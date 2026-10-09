import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "./NotificationBell";
import {
  LayoutDashboard,
  Database,
  User,
  LogOut,
  Sun,
  Moon,
  BarChart3,
  ShieldAlert
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        height: "var(--header-height)",
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border-color)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
            color: "var(--text-primary)",
            fontWeight: 800,
            fontSize: "1.2rem",
            letterSpacing: "-0.5px"
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 10px rgba(79, 70, 229, 0.4)"
            }}
          >
            <BarChart3 size={20} />
          </div>
          <span>EDABIP <span style={{ color: "var(--brand-primary)", fontWeight: 600, fontSize: "0.9rem" }}>MINI</span></span>
        </Link>

        {/* Navigation links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Link
            to="/dashboard"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: isActive("/dashboard") ? "var(--brand-primary)" : "var(--text-secondary)",
              background: isActive("/dashboard") ? "var(--brand-light)" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          <Link
            to="/data"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: isActive("/data") ? "var(--brand-primary)" : "var(--text-secondary)",
              background: isActive("/data") ? "var(--brand-light)" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <Database size={16} />
            Data Management
            {user?.role === "viewer" && (
              <span style={{ fontSize: "0.65rem", opacity: 0.6, marginLeft: "2px" }}>(Locked)</span>
            )}
          </Link>

          <Link
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: isActive("/profile") ? "var(--brand-primary)" : "var(--text-secondary)",
              background: isActive("/profile") ? "var(--brand-light)" : "transparent",
              transition: "all 0.2s"
            }}
          >
            <User size={16} />
            Profile
          </Link>
        </nav>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="btn-secondary"
          style={{ width: "40px", height: "40px", padding: 0, borderRadius: "50%" }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* WebSocket notification bell */}
        <NotificationBell />

        {/* User profile capsule */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "4px 12px 4px 6px",
              background: "var(--bg-input)",
              borderRadius: "30px",
              border: "1px solid var(--border-color)"
            }}
          >
            {user.avatar_url ? (
              <img
                src={`http://127.0.0.1:5000${user.avatar_url}`}
                alt="avatar"
                style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "var(--brand-primary)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.85rem",
                  fontWeight: 700
                }}
              >
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>{user.name}</span>
              <span className={`badge badge-${user.role}`} style={{ marginTop: "2px", width: "fit-content", padding: "1px 6px", fontSize: "0.65rem" }}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="btn-secondary"
          style={{ padding: "8px 12px", gap: "6px", fontSize: "0.85rem" }}
          title="Sign out"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
}
