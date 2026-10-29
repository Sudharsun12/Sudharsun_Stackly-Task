interface Props {
  page: number
  pages: number
  total: number
  isFetching?: boolean
  onChange: (page: number) => void
}

export function Pagination({ page, pages, total, isFetching, onChange }: Props) {
  return (
    <div className="pagination pagination-right">
      <span className="pagination-info">
        {total} task{total === 1 ? '' : 's'}{isFetching ? ' · updating…' : ''}
      </span>
      <div className="pagination-actions">
        <button
          className="btn btn-ghost btn-sm"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <span className="page-indicator">
          Page <strong>{page}</strong> of <strong>{pages || 1}</strong>
        </span>
        <button
          className="btn btn-ghost btn-sm"
          disabled={page >= pages}
          onClick={() => onChange(page + 1)}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
