// ─────────────────────────────────────────────────────────────
// src/components/ExpenseCard.tsx
// Typed props using ExpenseCardProps interface.
// onDelete is typed as (id: number) => void — not just any function.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Expense, Category } from '../types'

interface ExpenseCardProps {
  expense: Expense
  onDelete: (id: number) => void
  onEdit: (expense: Expense) => void
}

// Maps each Category to a colour — TypeScript ensures exhaustive coverage
const categoryColors: Record<Category, string> = {
  Food: '#ef4444',
  Transport: '#3b82f6',
  Shopping: '#8b5cf6',
  Health: '#10b981',
  Education: '#f59e0b',
  Other: '#6b7280',
}

const categoryIcons: Record<Category, string> = {
  Food: '🍔',
  Transport: '🚗',
  Shopping: '🛍️',
  Health: '💊',
  Education: '📚',
  Other: '📦',
}

function ExpenseCard({ expense, onDelete, onEdit }: ExpenseCardProps): JSX.Element {
  const color: string = categoryColors[expense.category]
  const icon: string = categoryIcons[expense.category]

  return (
    <div className="expense-card" style={{ borderLeftColor: color }}>
      <div className="card-header">
        <div className="card-title-row">
          <span className="category-icon">{icon}</span>
          <div>
            <h3 className="expense-title">{expense.title}</h3>
            <span className="category-badge" style={{ backgroundColor: color }}>
              {expense.category}
            </span>
          </div>
        </div>
        <div className="amount-block">
          <span className="expense-amount">₹{expense.amount.toLocaleString()}</span>
        </div>
      </div>

      <div className="card-footer">
        <span className="expense-date">📅 {expense.date}</span>
        {expense.note && (
          <span className="expense-note">📝 {expense.note}</span>
        )}
        <div className="card-actions">
          <button
            className="btn-edit"
            onClick={() => onEdit(expense)}
            aria-label={`Edit ${expense.title}`}
          >
            ✏️ Edit
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(expense.id)}
            aria-label={`Delete ${expense.title}`}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExpenseCard
