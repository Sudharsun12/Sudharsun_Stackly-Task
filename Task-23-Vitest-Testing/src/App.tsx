// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/App.tsx
// Root component — wires everything together.
// Header & Footer carry Sudharsun A's signature touch.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React, { useState, useMemo } from 'react'
import type { Expense, FilterType } from './types'
import type { CategoryFilter } from './components/FilterBar'
import { useTheme } from './context/ThemeContext'
import useLocalStorage from './hooks/useLocalStorage'
import useToast from './hooks/useToast'
import { filterExpenses } from './utils/filters'

import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import FilterBar from './components/FilterBar'
import SummaryStats from './components/SummaryStats'
import ToastContainer from './components/ToastContainer'

function App(): JSX.Element {
  const { isDark, toggleTheme } = useTheme()

  const [expenses, setExpenses] = useLocalStorage<Expense[]>('t23_expenses', [])
  const [editTarget, setEditTarget] = useState<Expense | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [timeFilter, setTimeFilter] = useState<FilterType>('all')

  const { toasts, addToast, removeToast } = useToast()

  // ── CRUD ────────────────────────────────────────────────────

  function handleAdd(expense: Expense): void {
    setExpenses([expense, ...expenses])
    addToast(`✅ "${expense.title}" added!`, 'success')
  }

  function handleDelete(id: number): void {
    const target = expenses.find((e) => e.id === id)
    setExpenses(expenses.filter((e: Expense) => e.id !== id))
    if (target) addToast(`🗑️ "${target.title}" deleted.`, 'info')
  }

  function handleEdit(expense: Expense): void {
    setEditTarget(expense)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleUpdate(updated: Expense): void {
    setExpenses(expenses.map((e: Expense) => (e.id === updated.id ? updated : e)))
    setEditTarget(null)
    addToast(`✏️ "${updated.title}" updated!`, 'success')
  }

  function handleCancelEdit(): void {
    setEditTarget(null)
  }

  // ── Filter ───────────────────────────────────────────────────

  const filteredExpenses: Expense[] = useMemo(
    () => filterExpenses(expenses, categoryFilter, timeFilter),
    [expenses, categoryFilter, timeFilter]
  )

  return (
    <div className={`app-container ${isDark ? 'dark' : 'light'}`} data-testid="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-center">
          <span className="header-icon" aria-hidden="true">💸</span>
          <h1 className="header-heading">Expense Tracker</h1>
          <p className="header-sub">Task 23 · Testing Edition</p>
          <p className="header-quote">
            "Quality is not an act, it is a habit." — Aristotle
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

      {/* ── Main ── */}
      <main className="main-content">
        <SummaryStats expenses={expenses} />

        <ExpenseForm
          onAdd={handleAdd}
          editTarget={editTarget}
          onUpdate={handleUpdate}
          onCancelEdit={handleCancelEdit}
        />

        <FilterBar
          categoryFilter={categoryFilter}
          timeFilter={timeFilter}
          onCategoryChange={setCategoryFilter}
          onTimeChange={setTimeFilter}
        />

        <p className="result-count">
          Showing <strong>{filteredExpenses.length}</strong> of{' '}
          <strong>{expenses.length}</strong> expenses
        </p>

        <ExpenseList
          expenses={filteredExpenses}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      </main>

      {/* ── Footer ── */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p className="footer-text">
            💸 Developed by <strong>Sudharsun A</strong>
          </p>
          <p className="footer-badges">
            <span className="badge">React 18</span>
            <span className="badge">TypeScript</span>
            <span className="badge">Vitest</span>
            <span className="badge">RTL</span>
          </p>
          <p className="footer-copy">
            © {new Date().getFullYear()} Sudharsun A. All rights reserved. · Task 23
          </p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}

export default App
