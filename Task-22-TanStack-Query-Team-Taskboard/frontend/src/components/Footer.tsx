export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer footer-minimal">
      <div className="footer-simple-inner">
        <p className="footer-simple-text">
          Developed by <strong>Sudharsun A</strong> · Software Engineer
        </p>
        <span className="footer-simple-divider" aria-hidden="true">•</span>
        <p className="footer-simple-copy">
          © {year} All Rights Reserved
        </p>
      </div>
    </footer>
  )
}
