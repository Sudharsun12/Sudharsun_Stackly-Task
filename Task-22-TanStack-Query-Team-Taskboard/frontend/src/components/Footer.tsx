export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      {/* Quote strip — centred at top of footer */}
      <div className="footer-quote-strip">
        <span className="footer-quote">
          ❝ The secret of getting ahead is getting started. ❞
        </span>
      </div>

      {/* Main footer content */}
      <div className="footer-inner">
        {/* Left — project identity */}
        <div className="footer-brand">
          <span className="footer-icon" aria-hidden="true">⬡</span>
          <div>
            <p className="footer-title">TeamTaskboard</p>
            <p className="footer-sub">Task 22 · TanStack Query · React + TypeScript</p>
          </div>
        </div>

        {/* Centre — tech stack badges */}
        <div className="footer-center-block">
          <div className="footer-stack" aria-label="Tech stack">
            {['React 18', 'TypeScript', 'TanStack Query v5', 'Flask', 'MySQL'].map((t) => (
              <span key={t} className="stack-badge">{t}</span>
            ))}
          </div>
          <p className="footer-task-label">EDABIP Internship · Task 22</p>
        </div>

        {/* Right — credits */}
        <div className="footer-credits">
          <p className="footer-author">Built by <strong>Sudharsun</strong></p>
          <p className="footer-copy">© {year} EDABIP Internship</p>
          <p className="footer-mentor">
            Guided by <em>Muddigari Induu Reddy</em>
          </p>
        </div>
      </div>

      {/* Bottom line */}
      <div className="footer-bottom">
        <span>Made with ♥ during EDABIP · Task 22 of 30</span>
      </div>
    </footer>
  )
}
