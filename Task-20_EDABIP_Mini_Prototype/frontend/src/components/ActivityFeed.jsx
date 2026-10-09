import React from "react";
import { useSocket } from "../context/SocketContext";
import { Radio, Clock, UserCheck, Shield, UploadCloud } from "lucide-react";

function timeAgo(dateString) {
  if (!dateString) return "just now";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 30) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function ActivityFeed() {
  const { activities } = useSocket();

  return (
    <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={18} color="var(--success)" className="animate-pulse" />
            Live Platform Activity
          </h3>
          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
            Real-time feed updated via WebSocket
          </p>
        </div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--success)",
            background: "rgba(16, 185, 129, 0.12)",
            padding: "4px 10px",
            borderRadius: "999px"
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--success)" }} />
          LIVE
        </span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
        {activities.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "150px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            No platform activity recorded yet.
          </div>
        ) : (
          activities.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px",
                borderRadius: "10px",
                background: "var(--bg-input)",
                border: "1px solid var(--border-color)",
                transition: "transform 0.15s ease"
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: item.action?.toLowerCase().includes("upload")
                    ? "rgba(6, 182, 212, 0.15)"
                    : item.action?.toLowerCase().includes("delete")
                    ? "rgba(239, 68, 68, 0.15)"
                    : "rgba(99, 102, 241, 0.15)",
                  color: item.action?.toLowerCase().includes("upload")
                    ? "#06b6d4"
                    : item.action?.toLowerCase().includes("delete")
                    ? "#ef4444"
                    : "var(--brand-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                {item.action?.toLowerCase().includes("upload") ? (
                  <UploadCloud size={16} />
                ) : item.action?.toLowerCase().includes("delete") ? (
                  <Shield size={16} />
                ) : (
                  <UserCheck size={16} />
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
                  {item.action}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  <Clock size={12} />
                  <span>{timeAgo(item.created_at)}</span>
                  {item.user_name && <span>• by {item.user_name}</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
