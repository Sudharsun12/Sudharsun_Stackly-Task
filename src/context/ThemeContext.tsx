// ─────────────────────────────────────────────────────────────
// src/context/ThemeContext.tsx
// Typed React context for dark/light mode.
// ThemeContextType defines exactly what the context provides.
// ─────────────────────────────────────────────────────────────

import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { ThemeContextType } from '../types'

// createContext needs a default — we use undefined and guard in hook
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): JSX.Element {
  const [isDark, setIsDark] = useState<boolean>(false)

  const toggleTheme = (): void => {
    setIsDark((prev) => !prev)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={isDark ? 'dark' : 'light'}>{children}</div>
    </ThemeContext.Provider>
  )
}

// Custom hook — throws a typed error if used outside provider
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
