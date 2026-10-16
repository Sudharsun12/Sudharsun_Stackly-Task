// ─────────────────────────────────────────────────────────────
// src/components/SummaryStats.tsx
// Pure computation from Expense[].
// getTotalByCategory return type is explicitly typed as number.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Expense, Category } from '../types'

interface SummaryStatsProps {
  expenses: Expense[]
}

// Typed utility function — parameters and return type declared
function getTotalByCategory(
  expenses: Expense[],
  category: Category
): number {
  return expenses
    .filter((e: Expense) => e.category === category)
    .reduce((sum: number, e: Expense) => sum + e.amount, 0)
}

function getMostUsedCategory(expenses: Expense[]): string {
  if (expenses.length === 0) return '—'

  const counts: Record<string, number> = {}
  expenses.forEach((e: Expense) => {
    counts[e.category] = (counts[e.category] || 0) + 1
  })

  // Object.entries returns [string, number][] — typed automatically
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
    <div className="summary-stats">
      <div className="stat-card">
        <span className="stat-icon">💰</span>
        <div>
          <p className="stat-label">Total Spent</p>
          <p className="stat-value">₹{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon">📈</span>
        <div>
          <p className="stat-label">Highest Expense</p>
          <p className="stat-value">
            {highest
              ? `₹${highest.amount.toLocaleString()} (${highest.title})`
              : '—'}
          </p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon">🏆</span>
        <div>
          <p className="stat-label">Top Category</p>
          <p className="stat-value">{topCategory}</p>
        </div>
      </div>

      <div className="stat-card">
        <span className="stat-icon">🧾</span>
        <div>
          <p className="stat-label">Total Entries</p>
          <p className="stat-value">{expenses.length}</p>
        </div>
      </div>
    </div>
  )
}

export default SummaryStats
