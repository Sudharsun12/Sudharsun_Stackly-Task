export function Skeleton({ height = 16, width = '100%' }: { height?: number; width?: number | string }) {
  return <div className="skeleton" style={{ height, width }} aria-hidden="true" />
}

export function TaskListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="task-list" aria-busy="true" aria-label="Loading tasks">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="task-row">
          <div className="task-main">
            <Skeleton height={16} width="45%" />
            <Skeleton height={12} width="70%" />
          </div>
          <Skeleton height={24} width={90} />
        </div>
      ))}
    </div>
  )
}
