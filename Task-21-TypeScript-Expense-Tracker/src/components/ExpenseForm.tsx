// ─────────────────────────────────────────────────────────────
// src/components/ExpenseForm.tsx
// Demonstrates typed events:
//   React.ChangeEvent<HTMLInputElement>
//   React.ChangeEvent<HTMLSelectElement>
//   React.ChangeEvent<HTMLTextAreaElement>
//   React.FormEvent<HTMLFormElement>
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Expense, Category, ExpenseFormState } from '../types'
import useForm from '../hooks/useForm'

interface ExpenseFormProps {
  onAdd: (expense: Expense) => void
  editTarget: Expense | null       // Expense | null — not undefined
  onUpdate: (expense: Expense) => void
  onCancelEdit: () => void
}

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Health', 'Education', 'Other',
]

function ExpenseForm({
  onAdd,
  editTarget,
  onUpdate,
  onCancelEdit,
}: ExpenseFormProps): JSX.Element {
  const { form, setField, resetForm, loadForm } = useForm()

  // Pre-fill form when edit target changes
  React.useEffect(() => {
    if (editTarget) {
      loadForm({
        title: editTarget.title,
        amount: String(editTarget.amount),
        category: editTarget.category,
        date: editTarget.date,
        note: editTarget.note ?? '',
      })
    } else {
      resetForm()
    }
  }, [editTarget])

  // Typed input change event
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement>
  ): void {
    setField(e.target.name as keyof ExpenseFormState, e.target.value)
  }

  // Typed select change event
  function handleSelectChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ): void {
    setField('category', e.target.value)
  }

  // Typed textarea change event
  function handleTextareaChange(
    e: React.ChangeEvent<HTMLTextAreaElement>
  ): void {
    setField('note', e.target.value)
  }

  // Typed form submit event
  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()

    if (!form.title.trim() || !form.amount || !form.date) {
      alert('Please fill in all required fields.')
      return
    }

    const amountNum: number = parseFloat(form.amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.')
      return
    }

    if (editTarget) {
      const updated: Expense = {
        id: editTarget.id,
        title: form.title.trim(),
        amount: amountNum,
        category: form.category,
        date: form.date,
        note: form.note.trim() || undefined,
      }
      onUpdate(updated)
    } else {
      const newExpense: Expense = {
        id: Date.now(),
        title: form.title.trim(),
        amount: amountNum,
        category: form.category,
        date: form.date,
        note: form.note.trim() || undefined,
      }
      onAdd(newExpense)
    }

    resetForm()
  }

  return (
    <div className="form-card">
      <h2 className="form-title">
        {editTarget ? '✏️ Edit Expense' : '➕ Add Expense'}
      </h2>

      <form onSubmit={handleSubmit} className="expense-form" noValidate>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              className="form-input"
              placeholder="e.g. Lunch, Bus ticket"
              value={form.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (₹) *</label>
            <input
              id="amount"
              name="amount"
              type="number"
              className="form-input"
              placeholder="e.g. 150"
              value={form.amount}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              className="form-select"
              value={form.category}
              onChange={handleSelectChange}
            >
              {CATEGORIES.map((cat: Category) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">Date *</label>
            <input
              id="date"
              name="date"
              type="date"
              className="form-input"
              value={form.date}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="note">Note (optional)</label>
          <textarea
            id="note"
            className="form-textarea"
            placeholder="Any additional details..."
            value={form.note}
            onChange={handleTextareaChange}
            rows={2}
          />
        </div>

        <div className="form-actions">
          {editTarget && (
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancelEdit}
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-submit">
            {editTarget ? 'Update Expense' : 'Add Expense'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ExpenseForm
