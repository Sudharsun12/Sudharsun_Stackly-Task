import { useState, useCallback } from "react";

let globalToastHandler = null;

export function useToast() {
  const showToast = useCallback((message, type = "success") => {
    if (globalToastHandler) {
      globalToastHandler(message, type);
    }
  }, []);

  return {
    toast: showToast,
    success: (msg) => showToast(msg, "success"),
    error: (msg) => showToast(msg, "error"),
    info: (msg) => showToast(msg, "info"),
  };
}

export function registerToastHandler(handler) {
  globalToastHandler = handler;
}
