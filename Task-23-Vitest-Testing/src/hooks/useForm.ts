// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/hooks/useForm.ts
// Typed form state manager using ExpenseFormState interface.
// Partial<ExpenseFormState> allows editing with partial data.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { useState } from 'react'
import type { ExpenseFormState } from '../types'

export const initialState: ExpenseFormState = {
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

  const setField = (field: keyof ExpenseFormState, value: string): void => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = (): void => {
    setForm({
      ...initialState,
      date: new Date().toISOString().split('T')[0],
    })
  }

  const loadForm = (data: Partial<ExpenseFormState>): void => {
    setForm((prev) => ({ ...prev, ...data }))
  }

  return { form, setField, resetForm, loadForm }
}

export default useForm
