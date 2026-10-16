// ─────────────────────────────────────────────────────────────
// src/components/ExpenseList.tsx
// Receives a typed Expense[] and renders ExpenseCards.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Expense } from '../types'
import ExpenseCard from './ExpenseCard'

interface ExpenseListProps {
  expenses: Expense[]
  onDelete: (id: number) => void
  onEdit: (expense: Expense) => void
}

function ExpenseList({ expenses, onDelete, onEdit }: ExpenseListProps): JSX.Element {
  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">💸</span>
        <p>No expenses found.</p>
        <p className="empty-sub">Add one using the form above!</p>
      </div>
    )
  }

  return (
    <div className="expense-list">
      {expenses.map((expense: Expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default ExpenseList
