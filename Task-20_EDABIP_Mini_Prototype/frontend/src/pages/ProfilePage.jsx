import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import api from "../api";
import { User, Lock, Upload, Save, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar_url ? `http://127.0.0.1:5000${user.avatar_url}` : null
  );
  const [saving, setSaving] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Update name and/or password
      const payload = { name };
      if (password) payload.password = password;
      await api.put("/api/me", payload);
      updateUser({ name });

      // 2. Upload avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const res = await api.post("/api/me/avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        updateUser({ avatar_url: res.data.avatar_url });
      }

      success("Profile updated successfully!");
      setPassword("");
    } catch (err) {
      error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "40px auto", padding: "0 20px" }}>
      <div className="glass-card" style={{ padding: "36px" }}>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
          <User size={24} color="var(--brand-primary)" />
          User Profile & Settings
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "32px" }}>
          Manage your account credentials, avatar, and system privileges
        </p>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Avatar Section */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-color)" }}>
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--brand-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                fontWeight: 700,
                overflow: "hidden",
                border: "2px solid var(--border-color)"
              }}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                user?.name ? user.name[0].toUpperCase() : "U"
              )}
            </div>

            <div>
              <label className="btn-secondary" style={{ cursor: "pointer", display: "inline-flex", gap: "8px", fontSize: "0.85rem" }}>
                <Upload size={16} /> Choose New Avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: "none" }} />
              </label>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                JPG, PNG, or GIF. Max 5MB.
              </p>
            </div>
          </div>

          {/* Role badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-secondary)" }}>Assigned Role:</span>
            <span className={`badge badge-${user?.role}`} style={{ fontSize: "0.85rem", padding: "4px 12px" }}>
              <Shield size={14} style={{ marginRight: "4px" }} /> {user?.role}
            </span>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
              Email Address (Permanent)
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              style={{ width: "100%", opacity: 0.7, cursor: "not-allowed" }}
            />
          </div>

          {/* Full Name */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          {/* Password Change */}
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px", color: "var(--text-secondary)" }}>
              New Password (Leave blank to keep current)
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={saving} className="btn-primary" style={{ padding: "12px 24px" }}>
              <Save size={18} />
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
