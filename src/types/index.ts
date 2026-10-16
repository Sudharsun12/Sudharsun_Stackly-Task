// ─────────────────────────────────────────────────────────────
// src/types/index.ts
// All interfaces and union types live here.
// Import from this file wherever types are needed — never repeat.
// ─────────────────────────────────────────────────────────────

// Union type — only valid category strings allowed
export type Category =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Education'
  | 'Other'

// Union type — filter by time period
export type FilterType = 'all' | 'week' | 'month'

// Core data model — every expense must have this exact shape
export interface Expense {
  id: number
  title: string
  amount: number
  category: Category
  date: string
  note?: string // ? means optional — may or may not be present
}

// Shape of a single toast notification
export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

// Shape of the ThemeContext value
export interface ThemeContextType {
  isDark: boolean
  toggleTheme: () => void
}

// Generic API response wrapper — T becomes whatever type you pass
// e.g. ApiResponse<Expense[]> makes data: Expense[]
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}

// Shape of the form state used in useForm hook
export interface ExpenseFormState {
  title: string
  amount: string
  category: Category
  date: string
  note: string
}
