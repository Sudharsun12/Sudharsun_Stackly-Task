interface Props {
  page: number
  pages: number
  total: number
  isFetching?: boolean
  onChange: (page: number) => void
}

export function Pagination({ page, pages, total, isFetching, onChange }: Props) {
  return (
    <div className="pagination">
      <span>{total} task{total === 1 ? '' : 's'}{isFetching ? ' · updating…' : ''}</span>
      <div>
        <button className="btn btn-ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
        <span className="page-indicator">Page {page} of {pages}</span>
        <button className="btn btn-ghost" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
      </div>
    </div>
  )
}
