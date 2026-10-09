import React, { useState, useEffect } from "react";
import { registerToastHandler } from "../hooks/useToast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    registerToastHandler((message, type) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    });
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-box">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          {t.type === "success" && <CheckCircle2 size={18} />}
          {t.type === "error" && <AlertCircle size={18} />}
          {t.type === "info" && <Info size={18} />}
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
