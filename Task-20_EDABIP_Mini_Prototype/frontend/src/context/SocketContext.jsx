import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../api";
import { useAuth } from "./AuthContext";
import api from "../api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activities, setActivities] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initial fetch of activity log
  useEffect(() => {
    if (token) {
      api.get("/api/activity")
        .then((res) => {
          if (Array.isArray(res.data)) {
            setActivities(res.data);
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Connect WebSocket
  useEffect(() => {
    if (!token) {
      if (socket) socket.disconnect();
      return;
    }

    const s = io(API_BASE_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      console.log("WebSocket connected to EDABIP backend");
    });

    s.on("activity_update", (newActivity) => {
      console.log("WebSocket received activity_update:", newActivity);
      setActivities((prev) => [newActivity, ...prev.slice(0, 19)]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [token]);

  const resetUnreadCount = () => setUnreadCount(0);

  return (
    <SocketContext.Provider value={{ socket, activities, unreadCount, resetUnreadCount, setActivities }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
}
