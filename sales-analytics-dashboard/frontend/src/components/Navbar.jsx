export default function Navbar({ theme, onToggleTheme }) {
  return (
    <nav className="navbar">
      {/* Left — empty spacer to balance the layout */}
      <div className="navbar-spacer" />

      {/* Center — Title + Quote */}
      <div className="navbar-center">
        <div className="navbar-brand-center">
          <div className="brand-icon">📊</div>
          <div>
            <h1>SalesIQ Analytics Dashboard</h1>
            <p className="navbar-quote">
              "Turning raw data into real decisions."
            </p>
          </div>
        </div>
      </div>

      {/* Right — Dark mode toggle */}
      <div className="navbar-right">
        <button
          id="dark-mode-toggle"
          className="dark-toggle"
          onClick={onToggleTheme}
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </nav>
  );
}
