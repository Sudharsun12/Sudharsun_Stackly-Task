import { useState, useCallback } from 'react'

/**
 * useToast — manages a live list of auto-dismissing toast notifications.
 *
 * Adapted from Task 13 pattern for Task 18 Profile & Settings page.
 *
 * Each toast is identified by a unique id (Date.now()) so multiple toasts
 * can coexist and dismiss independently without interfering with each other.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  // showToast — adds a toast and schedules auto-removal after 3 seconds
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()

    // Add the toast to the visible list
    setToasts(prev => [...prev, { id, message, type }])

    // Auto-dismiss after 3000ms using functional updater to avoid stale state
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  // dismissToast — manually close a toast before auto-dismiss
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
