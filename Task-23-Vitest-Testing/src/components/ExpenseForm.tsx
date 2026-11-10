// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/components/ExpenseForm.tsx
// REFACTORED for testability: validation uses inline DOM error
// messages (not alert()) so Testing Library can query them.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React, { useState } from 'react'
import type { Expense, Category, ExpenseFormState, FormErrors } from '../types'
import useForm from '../hooks/useForm'

interface ExpenseFormProps {
  onAdd: (expense: Expense) => void
  editTarget: Expense | null
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
  const [errors, setErrors] = useState<FormErrors>({})

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
    setErrors({})
  }, [editTarget])

  function validate(): boolean {
    const newErrors: FormErrors = {}

    if (!form.title.trim()) {
      newErrors.title = 'Title is required'
    }

    const amountNum = parseFloat(form.amount)
    if (!form.amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than zero'
    }

    if (!form.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    setField(e.target.name as keyof ExpenseFormState, e.target.value)
    // Clear error for the field being edited
    if (errors[e.target.name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    }
  }

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>): void {
    setField('category', e.target.value)
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>): void {
    setField('note', e.target.value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault()
    if (!validate()) return

    const amountNum: number = parseFloat(form.amount)

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
    setErrors({})
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
              className={`form-input ${errors.title ? 'input-error' : ''}`}
              placeholder="e.g. Lunch, Bus ticket"
              value={form.title}
              onChange={handleInputChange}
            />
            {errors.title && (
              <p className="error-msg" role="alert">{errors.title}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount (₹) *</label>
            <input
              id="amount"
              name="amount"
              type="number"
              className={`form-input ${errors.amount ? 'input-error' : ''}`}
              placeholder="e.g. 150"
              value={form.amount}
              onChange={handleInputChange}
              min="0.01"
              step="0.01"
            />
            {errors.amount && (
              <p className="error-msg" role="alert">{errors.amount}</p>
            )}
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
              className={`form-input ${errors.date ? 'input-error' : ''}`}
              value={form.date}
              onChange={handleInputChange}
            />
            {errors.date && (
              <p className="error-msg" role="alert">{errors.date}</p>
            )}
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
