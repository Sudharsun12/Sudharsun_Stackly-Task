// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/utils/formatters.ts
// Pure formatting utility functions — no side-effects, no DOM.
// These are the easiest to test: input → output, nothing else.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Formats a number as Indian Rupee currency string.
 * Uses Intl.NumberFormat for locale-correct formatting.
 * @example formatCurrency(1500) → '₹1,500.00'
 */
export function formatCurrency(amount: number): string {
  if (amount < 0) {
    return '-₹' + Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }
  return '₹' + amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Formats an ISO date string (YYYY-MM-DD) into human-readable form.
 * @example formatDate('2025-08-06') → '6 Aug 2025'
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Invalid Date'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
