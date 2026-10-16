// ─────────────────────────────────────────────────────────────
// src/components/ToastContainer.tsx
// Renders Toast[] — typed array from useToast hook.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Toast } from '../types'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: number) => void
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps): JSX.Element {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast: Toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => onRemove(toast.id)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
