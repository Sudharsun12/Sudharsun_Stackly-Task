import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useForm } from "../hooks/useForm";
import { useToast } from "../hooks/useToast";
import { BarChart3, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { error: toastError, success: toastSuccess } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { values, handleChange, setFieldValue } = useForm({
    email: "admin@edabip.com",
    password: "password123"
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      toastSuccess("Welcome back! Authentication successful.");
      navigate("/dashboard");
    } catch (err) {
      toastError(err.response?.data?.error || "Login failed. Check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const setPreset = (email) => {
    setFieldValue("email", email);
    setFieldValue("password", "password123");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%), var(--bg-primary)",
        padding: "20px"
      }}
    >
      <div
        className="glass-card"
        style={{
          width: "100%",
          maxWidth: "460px",
          padding: "40px 32px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)"
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              margin: "0 auto 16px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #4f46e5, #06b6d4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 8px 20px rgba(79, 70, 229, 0.4)"
            }}
          >
            <BarChart3 size={28} />
          </div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
            EDABIP Enterprise
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "6px" }}>
            Sign in to access real-time business intelligence
          </p>
        </div>

        {/* Quick Demo Credentials Switcher */}
        <div style={{ marginBottom: "24px", padding: "14px", background: "var(--bg-input)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color="var(--brand-primary)" /> Quick Role Sign-in:
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              className="badge badge-admin"
              style={{ cursor: "pointer", border: "none", padding: "6px 10px" }}
              onClick={() => setPreset("admin@edabip.com")}
            >
              Admin
            </button>
            <button
              type="button"
              className="badge badge-analyst"
              style={{ cursor: "pointer", border: "none", padding: "6px 10px" }}
              onClick={() => setPreset("analyst@edabip.com")}
            >
              Analyst
            </button>
            <button
              type="button"
              className="badge badge-viewer"
              style={{ cursor: "pointer", border: "none", padding: "6px 10px" }}
              onClick={() => setPreset("viewer@edabip.com")}
            >
              Viewer
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="email"
                name="email"
                required
                value={values.email}
                onChange={handleChange}
                placeholder="name@company.com"
                style={{ width: "100%", paddingLeft: "42px" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="password"
                name="password"
                required
                value={values.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{ width: "100%", paddingLeft: "42px" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: "100%", padding: "12px", marginTop: "8px", fontSize: "1rem" }}
          >
            {submitting ? "Signing in..." : "Enter Platform"}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "0.8rem", color: "var(--text-muted)" }}>
          Protected by Enterprise JWT Authentication
        </div>
      </div>
    </div>
  );
}
