// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/components/__tests__/SummaryStats.test.tsx
// Tests that SummaryStats computes and renders values correctly.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import SummaryStats from '../SummaryStats'
import type { Expense } from '../../types'

const sampleExpenses: Expense[] = [
  { id: 1, title: 'Lunch',      amount: 200,  category: 'Food',      date: '2025-11-01' },
  { id: 2, title: 'Bus Pass',   amount: 500,  category: 'Transport', date: '2025-11-02' },
  { id: 3, title: 'Textbook',   amount: 1200, category: 'Education', date: '2025-11-03' },
  { id: 4, title: 'Dinner',     amount: 350,  category: 'Food',      date: '2025-11-04' },
]

describe('SummaryStats — with expenses', () => {
  it('renders total entries count correctly', () => {
    render(<SummaryStats expenses={sampleExpenses} />)
    expect(screen.getByTestId('total-entries')).toHaveTextContent('4')
  })

  it('renders the total amount containing the sum', () => {
    render(<SummaryStats expenses={sampleExpenses} />)
    // 200 + 500 + 1200 + 350 = 2250
    const totalEl = screen.getByTestId('total-amount')
    expect(totalEl.textContent).toContain('2,250')
  })

  it('renders the highest expense title and amount', () => {
    render(<SummaryStats expenses={sampleExpenses} />)
    // Highest is Textbook at 1200
    const highestEl = screen.getByTestId('highest-expense')
    expect(highestEl.textContent).toContain('Textbook')
    expect(highestEl.textContent).toContain('1,200')
  })

  it('renders the top category by frequency', () => {
    render(<SummaryStats expenses={sampleExpenses} />)
    // Food appears twice — most frequent
    expect(screen.getByTestId('top-category')).toHaveTextContent('Food')
  })
})

describe('SummaryStats — empty expenses array', () => {
  it('shows ₹0.00 for total when list is empty', () => {
    render(<SummaryStats expenses={[]} />)
    expect(screen.getByTestId('total-amount')).toHaveTextContent('₹0.00')
  })

  it('shows 0 total entries when list is empty', () => {
    render(<SummaryStats expenses={[]} />)
    expect(screen.getByTestId('total-entries')).toHaveTextContent('0')
  })

  it('shows dash for highest expense when list is empty', () => {
    render(<SummaryStats expenses={[]} />)
    expect(screen.getByTestId('highest-expense')).toHaveTextContent('—')
  })

  it('shows dash for top category when list is empty', () => {
    render(<SummaryStats expenses={[]} />)
    expect(screen.getByTestId('top-category')).toHaveTextContent('—')
  })
})
