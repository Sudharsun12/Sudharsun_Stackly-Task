// ─────────────────────────────────────────────────────────────
// src/hooks/useForm.ts
// Typed form state manager using ExpenseFormState interface.
// Partial<ExpenseFormState> allows editing with partial data.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { ExpenseFormState, Category } from '../types'

const initialState: ExpenseFormState = {
  title: '',
  amount: '',
  category: 'Food',
  date: new Date().toISOString().split('T')[0],
  note: '',
}

interface UseFormReturn {
  form: ExpenseFormState
  setField: (field: keyof ExpenseFormState, value: string) => void
  resetForm: () => void
  loadForm: (data: Partial<ExpenseFormState>) => void
}

function useForm(): UseFormReturn {
  const [form, setForm] = useState<ExpenseFormState>(initialState)

  // keyof ExpenseFormState ensures only valid field names are passed
  const setField = (field: keyof ExpenseFormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = (): void => {
    setForm({
      ...initialState,
      date: new Date().toISOString().split('T')[0],
    })
  }

  // Partial<ExpenseFormState> — only some fields need to be provided
  const loadForm = (data: Partial<ExpenseFormState>): void => {
    setForm((prev) => ({ ...prev, ...data }))
  }

  return { form, setField, resetForm, loadForm }
}

export default useForm

export { initialState }
export type { Category }
