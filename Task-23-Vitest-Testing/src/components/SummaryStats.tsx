// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/components/SummaryStats.tsx
// Pure computation from Expense[].
// All math is done inline — no external dependencies.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React from 'react'
import type { Expense } from '../types'
import { formatCurrency } from '../utils/formatters'

interface SummaryStatsProps {
  expenses: Expense[]
}

function getMostUsedCategory(expenses: Expense[]): string {
  if (expenses.length === 0) return '—'
  const counts: Record<string, number> = {}
  expenses.forEach((e: Expense) => {
    counts[e.category] = (counts[e.category] || 0) + 1
  })
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0]
}

function SummaryStats({ expenses }: SummaryStatsProps): JSX.Element {
  const total: number = expenses.reduce(
    (sum: number, e: Expense) => sum + e.amount,
    0
  )

  const highest: Expense | undefined = expenses.reduce<Expense | undefined>(
    (max, e) => (max === undefined || e.amount > max.amount ? e : max),
    undefined
  )

  const topCategory: string = getMostUsedCategory(expenses)

  return (
    <div className="summary-stats" data-testid="summary-stats">
      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">💰</span>
        <div>
          <p className="stat-label">Total Spent</p>
          <p className="stat-value" data-testid="total-amount">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">📈</span>
        <div>
          <p className="stat-label">Highest Expense</p>
          <p className="stat-value" data-testid="highest-expense">
            {highest
              ? `${formatCurrency(highest.amount)} (${highest.title})`
              : '—'}
          </p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">🏷️</span>
        <div>
          <p className="stat-label">Top Category</p>
          <p className="stat-value" data-testid="top-category">{topCategory}</p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon" aria-hidden="true">📋</span>
        <div>
          <p className="stat-label">Total Entries</p>
          <p className="stat-value" data-testid="total-entries">
            {expenses.length}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SummaryStats
