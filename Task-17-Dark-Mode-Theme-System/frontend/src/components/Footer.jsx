import { useTheme } from '../context/ThemeContext'

export default function Footer() {
  const { theme } = useTheme()

  const themeEmoji = theme === 'dark' ? '🌙' : theme === 'sepia' ? '📜' : '☀️'

  return (
    <footer className="footer">
      <p className="footer-text">
        © 2026 ShopSphere E-Commerce. All rights reserved.
      </p>
      <p className="footer-dev">
        Developed by <span className="footer-name">Sudharsun A</span>
      </p>
      <p className="footer-text" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
        {themeEmoji} Currently in <span className="theme-badge">{theme} mode</span>
      </p>
    </footer>
  )
}
