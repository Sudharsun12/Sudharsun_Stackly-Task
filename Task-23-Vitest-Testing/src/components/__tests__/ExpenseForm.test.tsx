// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/components/__tests__/ExpenseForm.test.tsx
// Tests form rendering, inline validation, and onAdd callbacks.
// Uses vi.fn() to mock onAdd so we can track calls without
// needing a real parent component.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseForm from '../ExpenseForm'
import type { Expense } from '../../types'

function renderForm(editTarget: Expense | null = null) {
  const onAdd = vi.fn()
  const onUpdate = vi.fn()
  const onCancelEdit = vi.fn()
  render(
    <ExpenseForm
      onAdd={onAdd}
      editTarget={editTarget}
      onUpdate={onUpdate}
      onCancelEdit={onCancelEdit}
    />
  )
  return { onAdd, onUpdate, onCancelEdit }
}

// ── Rendering ──────────────────────────────────────────────────
describe('ExpenseForm — rendering', () => {
  it('renders the title input field', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/lunch, bus ticket/i)).toBeInTheDocument()
  })

  it('renders the amount input field', () => {
    renderForm()
    expect(screen.getByPlaceholderText(/150/i)).toBeInTheDocument()
  })

  it('renders the category select', () => {
    renderForm()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders the date input', () => {
    renderForm()
    expect(screen.getByLabelText(/date/i)).toBeInTheDocument()
  })

  it('renders "Add Expense" button in add mode', () => {
    renderForm()
    expect(
      screen.getByRole('button', { name: /add expense/i })
    ).toBeInTheDocument()
  })

  it('renders "Update Expense" button in edit mode', () => {
    const editTarget: Expense = {
      id: 1, title: 'Pizza', amount: 300,
      category: 'Food', date: '2025-11-01',
    }
    renderForm(editTarget)
    expect(
      screen.getByRole('button', { name: /update expense/i })
    ).toBeInTheDocument()
  })
})

// ── Validation ─────────────────────────────────────────────────
describe('ExpenseForm — validation', () => {
  it('shows "Title is required" error on empty submit', async () => {
    renderForm()
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText(/title is required/i)).toBeInTheDocument()
  })

  it('does NOT call onAdd when title is empty', async () => {
    const { onAdd } = renderForm()
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('shows amount error when amount is zero or negative', async () => {
    renderForm()
    await userEvent.type(screen.getByPlaceholderText(/lunch, bus ticket/i), 'Coffee')
    await userEvent.clear(screen.getByPlaceholderText(/150/i))
    await userEvent.type(screen.getByPlaceholderText(/150/i), '-5')
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))
    expect(screen.getByText(/amount must be greater than zero/i)).toBeInTheDocument()
  })

  it('does NOT call onAdd when amount is invalid', async () => {
    const { onAdd } = renderForm()
    await userEvent.type(screen.getByPlaceholderText(/lunch, bus ticket/i), 'Coffee')
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))
    expect(onAdd).not.toHaveBeenCalled()
  })
})

// ── Successful submission ──────────────────────────────────────
describe('ExpenseForm — successful submission', () => {
  it('calls onAdd with correct title and amount on valid submit', async () => {
    const { onAdd } = renderForm()

    await userEvent.type(screen.getByPlaceholderText(/lunch, bus ticket/i), 'Coffee')
    await userEvent.clear(screen.getByPlaceholderText(/150/i))
    await userEvent.type(screen.getByPlaceholderText(/150/i), '80')

    // date is auto-filled by the hook to today, so just submit
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(onAdd).toHaveBeenCalledOnce()
    expect(onAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Coffee',
        amount: 80,
      })
    )
  })

  it('resets the title field after a successful submission', async () => {
    renderForm()
    const titleInput = screen.getByPlaceholderText(/lunch, bus ticket/i)
    const amountInput = screen.getByPlaceholderText(/150/i)

    await userEvent.type(titleInput, 'Tea')
    await userEvent.clear(amountInput)
    await userEvent.type(amountInput, '20')
    await userEvent.click(screen.getByRole('button', { name: /add expense/i }))

    expect(titleInput).toHaveValue('')
  })
})
