import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

/**
 * ThemeProvider — wraps the entire app and provides:
 *   theme        : 'light' | 'dark' | 'sepia'
 *   toggleTheme  : cycles through light → dark → sepia → light
 *
 * Priority order on first load:
 *   1. localStorage  (user's explicit past choice)
 *   2. OS/system preference  (prefers-color-scheme)
 *   3. Default: 'light'
 */
export function ThemeProvider({ children }) {

  const getInitialTheme = () => {
    // 1. Check localStorage first — respects user's previous explicit choice
    const saved = localStorage.getItem('theme')
    if (saved === 'light' || saved === 'dark' || saved === 'sepia') return saved

    // 2. Check the OS/system-level preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }

  const [theme, setTheme] = useState(getInitialTheme)

  // Apply data-theme attribute + save to localStorage whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // BONUS: Listen for real-time OS theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => {
      // Only follow OS preference if user hasn't explicitly set a theme
      const saved = localStorage.getItem('theme')
      if (!saved) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () =>
    setTheme(t => {
      if (t === 'light') return 'dark'
      if (t === 'dark')  return 'sepia'
      return 'light'
    })

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
