import { useState, useCallback } from 'react'

/**
 * useToast — manages a live list of auto-dismissing toast notifications.
 *
 * Each toast is identified by a unique id (Date.now()) so multiple toasts
 * can coexist and dismiss independently without interfering with each other.
 */
export function useToast() {
  const [toasts, setToasts] = useState([])

  /**
   * showToast — adds a toast and schedules its auto-removal after 3 s.
   *
   * HOW AUTO-DISMISS WORKS (exact code responsible):
   *   1. A unique `id` is captured via Date.now() at call time.
   *   2. The new toast { id, message, type } is appended to state.
   *   3. setTimeout schedules removal after 3000 ms.
   *   4. The callback uses the FUNCTIONAL updater form
   *        prev => prev.filter(t => t.id !== id)
   *      so it always operates on the LATEST state — never on a stale
   *      snapshot — even when many toasts are shown in quick succession.
   */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now()

    // add the toast to the visible list
    setToasts(prev => [...prev, { id, message, type }])

    // ← THIS is what makes the toast disappear automatically after 3 s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  /**
   * dismissToast — lets the user manually close a toast before auto-dismiss.
   */
  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
