// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/utils/__tests__/formatters.test.ts
// Unit tests for formatCurrency and formatDate.
// Pure functions — no DOM, no React, no mocking needed.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '../formatters'

// ── formatCurrency ─────────────────────────────────────────────
describe('formatCurrency', () => {
  it('formats a positive number with rupee symbol', () => {
    const result = formatCurrency(1500)
    expect(result).toContain('₹')
    expect(result).toContain('1,500')
  })

  it('formats zero as ₹0.00', () => {
    const result = formatCurrency(0)
    expect(result).toBe('₹0.00')
  })

  it('handles a large number with correct comma separation', () => {
    const result = formatCurrency(100000)
    expect(result).toContain('₹')
    expect(result).toContain('1,00,000')
  })

  it('handles negative amounts with minus prefix', () => {
    const result = formatCurrency(-500)
    expect(result).toContain('-₹')
    expect(result).toContain('500')
  })

  it('includes two decimal places for fractional amounts', () => {
    const result = formatCurrency(99.9)
    expect(result).toContain('99.90')
  })
})

// ── formatDate ─────────────────────────────────────────────────
describe('formatDate', () => {
  it('formats a valid ISO date string to human-readable form', () => {
    const result = formatDate('2025-08-06')
    // Should contain the year at minimum
    expect(result).toContain('2025')
    expect(result).not.toBe('Invalid Date')
  })

  it('returns "Invalid Date" for a non-date string', () => {
    expect(formatDate('not-a-date')).toBe('Invalid Date')
  })

  it('returns "Invalid Date" for an empty string', () => {
    expect(formatDate('')).toBe('Invalid Date')
  })
})
