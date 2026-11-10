// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/utils/filters.ts
// Pure filter/aggregate utility functions — extracted from App.tsx
// so they can be unit-tested independently with no React needed.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import type { Expense, Category, FilterType } from '../types'

/**
 * Returns the sum of all expenses in the given category.
 * Returns 0 if no matching expenses found.
 */
export function getTotalByCategory(
  expenses: Expense[],
  category: Category
): number {
  return expenses
    .filter((e: Expense) => e.category === category)
    .reduce((sum: number, e: Expense) => sum + e.amount, 0)
}

/**
 * Filters an Expense array by category and/or time period.
 * category === 'all' means no category filter is applied.
 * period === 'all' means no time filter is applied.
 */
export function filterExpenses(
  expenses: Expense[],
  category: Category | 'all',
  period: FilterType
): Expense[] {
  const now = new Date()

  return expenses.filter((e: Expense) => {
    // Category filter
    if (category !== 'all' && e.category !== category) return false

    // Time filter
    if (period !== 'all') {
      const expenseDate = new Date(e.date)

      if (period === 'week') {
        const weekAgo = new Date(now)
        weekAgo.setDate(weekAgo.getDate() - 7)
        if (expenseDate < weekAgo) return false
      }

      if (period === 'month') {
        if (
          expenseDate.getMonth() !== now.getMonth() ||
          expenseDate.getFullYear() !== now.getFullYear()
        ) {
          return false
        }
      }
    }

    return true
  })
}
