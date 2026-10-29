import { NavLink } from 'react-router-dom'

export function BodyNav() {
  return (
    <nav className="body-nav-tabs" aria-label="Page navigation">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `body-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="body-nav-icon" aria-hidden="true">▦</span>
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/tasks"
        className={({ isActive }) => `body-nav-tab ${isActive ? 'active' : ''}`}
      >
        <span className="body-nav-icon" aria-hidden="true">✓</span>
        <span>Tasks</span>
      </NavLink>
    </nav>
  )
}
