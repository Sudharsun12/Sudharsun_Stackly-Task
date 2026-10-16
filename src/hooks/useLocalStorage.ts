// ─────────────────────────────────────────────────────────────
// src/hooks/useLocalStorage.ts
// Generic hook — <T> means it works for any type.
// TypeScript infers the correct type everywhere it's used.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T): void => {
    setStored(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [stored, setValue]
}

export default useLocalStorage
