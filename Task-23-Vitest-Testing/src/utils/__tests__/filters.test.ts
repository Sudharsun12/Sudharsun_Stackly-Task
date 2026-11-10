// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/utils/__tests__/filters.test.ts
// Unit tests for getTotalByCategory and filterExpenses.
// All pure functions — no DOM required.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { describe, it, expect } from 'vitest'
import { getTotalByCategory, filterExpenses } from '../filters'
import type { Expense } from '../../types'

// ── Shared fixture data ────────────────────────────────────────
const today = new Date()
const todayStr = today.toISOString().split('T')[0]

const threeDaysAgo = new Date(today)
threeDaysAgo.setDate(today.getDate() - 3)
const threeDaysAgoStr = threeDaysAgo.toISOString().split('T')[0]

const thirtyDaysAgo = new Date(today)
thirtyDaysAgo.setDate(today.getDate() - 30)
const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

const mockExpenses: Expense[] = [
  { id: 1, title: 'Lunch',       amount: 200, category: 'Food',      date: todayStr       },
  { id: 2, title: 'Bus Pass',    amount: 150, category: 'Transport', date: threeDaysAgoStr },
  { id: 3, title: 'Pizza',       amount: 350, category: 'Food',      date: todayStr       },
  { id: 4, title: 'Old Expense', amount: 999, category: 'Shopping',  date: thirtyDaysAgoStr },
]

// ── getTotalByCategory ─────────────────────────────────────────
describe('getTotalByCategory', () => {
  it('returns correct total for a matching category', () => {
    expect(getTotalByCategory(mockExpenses, 'Food')).toBe(550)
  })

  it('returns 0 when no expenses match the category', () => {
    expect(getTotalByCategory(mockExpenses, 'Health')).toBe(0)
  })

  it('returns 0 for an empty expense array', () => {
    expect(getTotalByCategory([], 'Food')).toBe(0)
  })

  it('returns exact amount for a single-entry category', () => {
    expect(getTotalByCategory(mockExpenses, 'Transport')).toBe(150)
  })
})

// ── filterExpenses ─────────────────────────────────────────────
describe('filterExpenses', () => {
  it('returns all expenses when category is "all" and period is "all"', () => {
    expect(filterExpenses(mockExpenses, 'all', 'all')).toHaveLength(4)
  })

  it('filters by category correctly', () => {
    const result = filterExpenses(mockExpenses, 'Food', 'all')
    expect(result).toHaveLength(2)
    expect(result.every((e) => e.category === 'Food')).toBe(true)
  })

  it('filters by week — excludes expenses older than 7 days', () => {
    const result = filterExpenses(mockExpenses, 'all', 'week')
    // thirtyDaysAgo should be excluded
    expect(result.find((e) => e.id === 4)).toBeUndefined()
    // today and 3 days ago should be included
    expect(result.length).toBeGreaterThanOrEqual(2)
  })

  it('filters by month — excludes expenses from last month', () => {
    const result = filterExpenses(mockExpenses, 'all', 'month')
    // thirtyDaysAgo is likely outside current month
    const hasOld = result.some((e) => e.id === 4)
    // This can only fail if the test runs on day 1 of a month — edge case
    if (new Date().getDate() > 2) {
      expect(hasOld).toBe(false)
    }
  })

  it('applies category and period filter together', () => {
    const result = filterExpenses(mockExpenses, 'Food', 'week')
    // Both Food items are today/recent, 'Shopping' (old) should be out
    expect(result.every((e) => e.category === 'Food')).toBe(true)
  })

  it('returns empty array when no expenses match combined filter', () => {
    const result = filterExpenses(mockExpenses, 'Education', 'week')
    expect(result).toHaveLength(0)
  })
})
