import React from 'react'
import './ToastContainer.css'

/**
 * ToastContainer — renders the live list of toast notifications.
 *
 * Why is toast better UX than alert()?
 * - Does NOT block the page or freeze user interaction.
 * - Disappears automatically — user never has to click OK.
 * - Fully styled with colour, icon, and animation.
 * - Multiple toasts can stack and dismiss independently.
 * - Consistent across all browsers; alert() looks different everywhere.
 */
export default function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-wrapper" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="alert"
        >
          <span className="toast__icon" aria-hidden="true">
            {toast.type === 'success' ? '✓' : '✕'}
          </span>
          <span className="toast__message">{toast.message}</span>
          <button
            className="toast__close"
            onClick={() => onDismiss(toast.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
