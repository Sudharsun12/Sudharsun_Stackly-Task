// ─────────────────────────────────────────────────────────────
// src/hooks/useToast.ts
// Typed toast notification manager.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import type { Toast } from '../types'

interface UseToastReturn {
  toasts: Toast[]
  addToast: (message: string, type: Toast['type']) => void
  removeToast: (id: number) => void
}

function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((message: string, type: Toast['type']): void => {
    const id: number = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: number): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}

export default useToast
