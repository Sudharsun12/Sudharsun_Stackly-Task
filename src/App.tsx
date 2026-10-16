// ─────────────────────────────────────────────────────────────
// src/App.tsx
// Root component — wires everything together.
// useLocalStorage<Expense[]> — generic T inferred as Expense[]
// useState<Expense | null> — union type for edit target
// ─────────────────────────────────────────────────────────────

import React, { useState, useMemo } from 'react'
import type { Expense, FilterType } from './types'
import type { CategoryFilter } from './components/FilterBar'
import { useTheme } from './context/ThemeContext'
import useLocalStorage from './hooks/useLocalStorage'
import useToast from './hooks/useToast'

import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import FilterBar from './components/FilterBar'
import SummaryStats from './components/SummaryStats'
import ToastContainer from './components/ToastContainer'

function App(): JSX.Element {
  const { isDark, toggleTheme } = useTheme()

  // Generic hook — T is Expense[], TypeScript knows expenses: Expense[]
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', [])

  // Union type — Expense | null — exactly what we need for edit state
  const [editTarget, setEditTarget] = useState<Expense | null>(null)

  // Typed filter state
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [timeFilter, setTimeFilter] = useState<FilterType>('all')

  const { toasts, addToast, removeToast } = useToast()

  // ── CRUD handlers ──────────────────────────────────────────

  function handleAdd(expense: Expense): void {
    setExpenses([expense, ...expenses])
    addToast(`✅ "${expense.title}" added!`, 'success')
  }

  function handleDelete(id: number): void {
    const target: Expense | undefined = expenses.find((e) => e.id === id)
    setExpenses(expenses.filter((e: Expense) => e.id !== id))
    if (target) addToast(`🗑️ "${target.title}" deleted.`, 'info')
  }

  function handleEdit(expense: Expense): void {
    setEditTarget(expense)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleUpdate(updated: Expense): void {
    setExpenses(
      expenses.map((e: Expense) => (e.id === updated.id ? updated : e))
    )
    setEditTarget(null)
    addToast(`✏️ "${updated.title}" updated!`, 'success')
  }

  function handleCancelEdit(): void {
    setEditTarget(null)
  }

  // ── Filter logic ────────────────────────────────────────────

  const filteredExpenses: Expense[] = useMemo(() => {
    const now: Date = new Date()

    return expenses.filter((e: Expense) => {
      // Category filter
      if (categoryFilter !== 'all' && e.category !== categoryFilter) {
        return false
      }

      // Time filter
      if (timeFilter !== 'all') {
        const expenseDate: Date = new Date(e.date)

        if (timeFilter === 'week') {
          const weekAgo: Date = new Date(now)
          weekAgo.setDate(weekAgo.getDate() - 7)
          if (expenseDate < weekAgo) return false
        }

        if (timeFilter === 'month') {
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
  }, [expenses, categoryFilter, timeFilter])

  return (
    <div className={`app-container ${isDark ? 'dark' : 'light'}`}>
      {/* Header */}
      <header className="app-header">
        <div className="header-center">
          <span className="header-icon">💼</span>
          <h1 className="header-heading">Expense Tracker</h1>
          <p className="header-sub">TypeScript Edition</p>
          <p className="header-quote">
            "A budget is telling your money where to go instead of wondering where it went."
          </p>
        </div>
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </header>

      <main className="main-content">
        {/* Summary */}
        <SummaryStats expenses={expenses} />

        {/* Form */}
        <ExpenseForm
          onAdd={handleAdd}
          editTarget={editTarget}
          onUpdate={handleUpdate}
          onCancelEdit={handleCancelEdit}
        />

        {/* Filters */}
        <FilterBar
          categoryFilter={categoryFilter}
          timeFilter={timeFilter}
          onCategoryChange={setCategoryFilter}
          onTimeChange={setTimeFilter}
        />

        {/* Results count */}
        <p className="result-count">
          Showing <strong>{filteredExpenses.length}</strong> of{' '}
          <strong>{expenses.length}</strong> expenses
        </p>

        {/* List */}
        <ExpenseList
          expenses={filteredExpenses}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p className="footer-text">
          💻 Developed by <strong>Sudharsun A</strong>
        </p>
        <p className="footer-copy">
          © {new Date().getFullYear()} Sudharsun A. All rights reserved.
        </p>
      </footer>

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default App
