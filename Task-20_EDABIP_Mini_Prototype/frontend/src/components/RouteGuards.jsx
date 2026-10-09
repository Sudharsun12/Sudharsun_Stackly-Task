import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function RoleRoute({ allowedRoles = [], children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "70vh",
        textAlign: "center",
        padding: "20px"
      }}>
        <div style={{
          fontSize: "5rem",
          fontWeight: "800",
          color: "var(--danger)",
          lineHeight: 1
        }}>403</div>
        <h2 style={{ fontSize: "1.75rem", margin: "16px 0 8px" }}>Access Forbidden</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: "450px", marginBottom: "24px" }}>
          Your current role (<span style={{ textTransform: "uppercase", fontWeight: 700 }}>{user.role}</span>) does not have authorization to view or manage data on this page.
        </p>
        <button
          className="btn-primary"
          onClick={() => window.location.href = "/dashboard"}
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return children;
}
