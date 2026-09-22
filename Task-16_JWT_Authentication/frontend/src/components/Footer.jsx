import '../styles/footer.css'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-quote">
        <span className="quote-mark">"</span>
        The secret of getting ahead is getting started.
        <span className="quote-mark">"</span>
      </div>
      <div className="footer-divider" />
      <div className="footer-bottom">
        <span className="footer-dev">Developed by <strong>Sudharsun A</strong></span>
        <span className="footer-dot">·</span>
        <span className="footer-copy">© {year} Auth System. All rights reserved.</span>
      </div>
    </footer>
  )
}
