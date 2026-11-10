// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/components/__tests__/ExpenseCard.test.tsx
// Tests that ExpenseCard renders correctly and fires callbacks.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ExpenseCard from '../ExpenseCard'
import type { Expense } from '../../types'

const mockExpense: Expense = {
  id: 42,
  title: 'Lunch',
  amount: 250,
  category: 'Food',
  date: '2025-08-06',
  note: 'Office lunch',
}

function renderCard(
  overrides?: Partial<Expense>,
  onDelete = vi.fn(),
  onEdit = vi.fn()
) {
  const expense = { ...mockExpense, ...overrides }
  render(<ExpenseCard expense={expense} onDelete={onDelete} onEdit={onEdit} />)
  return { onDelete, onEdit, expense }
}

// ── Rendering ──────────────────────────────────────────────────
describe('ExpenseCard — rendering', () => {
  it('renders the expense title', () => {
    renderCard()
    expect(screen.getByText('Lunch')).toBeInTheDocument()
  })

  it('renders the formatted amount containing the number', () => {
    renderCard()
    expect(screen.getByText(/250/)).toBeInTheDocument()
  })

  it('renders the category badge', () => {
    renderCard()
    expect(screen.getByText('Food')).toBeInTheDocument()
  })

  it('renders the note when provided', () => {
    renderCard()
    expect(screen.getByText(/Office lunch/)).toBeInTheDocument()
  })

  it('does not render note section when note is absent', () => {
    renderCard({ note: undefined })
    expect(screen.queryByText(/Office lunch/)).not.toBeInTheDocument()
  })
})

// ── Buttons ────────────────────────────────────────────────────
describe('ExpenseCard — action buttons', () => {
  it('renders a delete button for the expense', () => {
    renderCard()
    expect(
      screen.getByRole('button', { name: /delete lunch/i })
    ).toBeInTheDocument()
  })

  it('renders an edit button for the expense', () => {
    renderCard()
    expect(
      screen.getByRole('button', { name: /edit lunch/i })
    ).toBeInTheDocument()
  })
})

// ── Interactions ───────────────────────────────────────────────
describe('ExpenseCard — interactions', () => {
  it('calls onDelete with the correct expense id when delete is clicked', async () => {
    const onDelete = vi.fn()
    renderCard({}, onDelete)
    await userEvent.click(screen.getByRole('button', { name: /delete lunch/i }))
    expect(onDelete).toHaveBeenCalledOnce()
    expect(onDelete).toHaveBeenCalledWith(42)
  })

  it('calls onEdit with the full expense object when edit is clicked', async () => {
    const onEdit = vi.fn()
    renderCard({}, vi.fn(), onEdit)
    await userEvent.click(screen.getByRole('button', { name: /edit lunch/i }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: 42, title: 'Lunch' }))
  })
})

// ── Snapshot ───────────────────────────────────────────────────
describe('ExpenseCard — snapshot', () => {
  it('matches the snapshot', () => {
    const { container } = render(
      <ExpenseCard
        expense={mockExpense}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
