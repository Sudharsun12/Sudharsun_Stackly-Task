import React, { useState } from "react";
import { Bell, Sparkles } from "lucide-react";
import { useSocket } from "../context/SocketContext";

export default function NotificationBell() {
  const { activities, unreadCount, resetUnreadCount } = useSocket();
  const [open, setOpen] = useState(false);

  const toggle = () => {
    if (!open) {
      resetUnreadCount();
    }
    setOpen((prev) => !prev);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={toggle}
        className="btn-secondary"
        style={{
          padding: "8px",
          borderRadius: "50%",
          position: "relative",
          width: "40px",
          height: "40px"
        }}
        title="Live WebSocket Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              background: "var(--danger)",
              color: "#fff",
              borderRadius: "50%",
              fontSize: "0.7rem",
              fontWeight: 700,
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)"
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="glass-card"
          style={{
            position: "absolute",
            right: 0,
            top: "48px",
            width: "320px",
            maxHeight: "380px",
            overflowY: "auto",
            zIndex: 100,
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            boxShadow: "0 15px 30px rgba(0,0,0,0.3)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "8px" }}>
            <span style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={14} color="var(--brand-primary)" /> Live Notifications
            </span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>WebSocket Active</span>
          </div>

          {activities.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textAlign: "center", margin: "16px 0" }}>
              No recent notifications yet.
            </p>
          ) : (
            activities.slice(0, 8).map((act, idx) => (
              <div
                key={act.id || idx}
                style={{
                  padding: "8px 10px",
                  borderRadius: "8px",
                  background: "var(--bg-input)",
                  fontSize: "0.8rem",
                  lineHeight: 1.4
                }}
              >
                <div style={{ color: "var(--text-primary)", fontWeight: 500 }}>{act.action}</div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                  {act.created_at ? new Date(act.created_at).toLocaleTimeString() : "Just now"}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
