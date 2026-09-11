import { useState } from 'react'

/**
 * Pagination — reusable page-navigation component.
 *
 * Props:
 *   currentPage  {number}   – the active page (1-indexed)
 *   totalPages   {number}   – total number of pages
 *   onPageChange {function} – called with new page number when user clicks
 *
 * Features:
 *   • Previous / Next buttons disabled at boundaries
 *   • Smart windowing — shows at most 5 numbered buttons centred on
 *     the current page, with ellipsis when pages are skipped
 *   • Highlights the current page button (accent gradient)
 *   • "Page X of Y" label
 *   • Renders nothing when totalPages ≤ 1 (no controls needed)
 *   • Works in both light & dark mode via CSS variables
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  // Nothing to show if there's only one page
  if (!totalPages || totalPages <= 1) return null

  /* ── Build the window of page numbers ───────────────────────────────────
     Show at most 5 pages centred on currentPage.
     e.g. totalPages=12, currentPage=7  →  [5, 6, 7, 8, 9]
  ──────────────────────────────────────────────────────────────────────── */
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage   = startPage + maxVisible - 1

  if (endPage > totalPages) {
    endPage   = totalPages
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

  const pages = []
  for (let i = startPage; i <= endPage; i++) pages.push(i)

  return (
    <nav className="pagination" aria-label="Page navigation">

      {/* ← Previous */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {/* First page + ellipsis when window doesn't start at 1 */}
      {startPage > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span className="pagination-ellipsis">…</span>}
        </>
      )}

      {/* Numbered buttons */}
      {pages.map(p => (
        <button
          key={p}
          className={`pagination-btn${p === currentPage ? ' active' : ''}`}
          onClick={() => onPageChange(p)}
          aria-current={p === currentPage ? 'page' : undefined}
          aria-label={`Page ${p}`}
        >
          {p}
        </button>
      ))}

      {/* Ellipsis + last page when window doesn't reach the end */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-ellipsis">…</span>}
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}

      {/* Next → */}
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        →
      </button>

      {/* Page X of Y */}
      <span className="pagination-label">
        Page {currentPage} of {totalPages}
      </span>

    </nav>
  )
}
