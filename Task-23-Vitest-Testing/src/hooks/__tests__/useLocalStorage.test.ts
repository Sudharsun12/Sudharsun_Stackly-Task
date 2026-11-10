// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/hooks/__tests__/useLocalStorage.test.ts
// Tests the generic useLocalStorage hook in isolation.
// localStorage is provided by jsdom in the test environment.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useLocalStorage from '../useLocalStorage'

// Clear localStorage before each test to avoid state leaking between tests
beforeEach(() => {
  localStorage.clear()
})

describe('useLocalStorage', () => {
  it('returns the initial value when the key does not exist in localStorage', () => {
    const { result } = renderHook(() =>
      useLocalStorage('missing_key', 'default')
    )
    expect(result.current[0]).toBe('default')
  })

  it('returns the stored value when the key already exists', () => {
    localStorage.setItem('my_key', JSON.stringify('stored_value'))
    const { result } = renderHook(() =>
      useLocalStorage('my_key', 'default')
    )
    expect(result.current[0]).toBe('stored_value')
  })

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() =>
      useLocalStorage('counter', 0)
    )

    act(() => {
      result.current[1](42)
    })

    expect(result.current[0]).toBe(42)
    expect(JSON.parse(localStorage.getItem('counter')!)).toBe(42)
  })

  it('works correctly with array values', () => {
    const initial = [1, 2, 3]
    const { result } = renderHook(() =>
      useLocalStorage<number[]>('nums', initial)
    )

    act(() => {
      result.current[1]([4, 5, 6])
    })

    expect(result.current[0]).toEqual([4, 5, 6])
    expect(JSON.parse(localStorage.getItem('nums')!)).toEqual([4, 5, 6])
  })

  it('falls back to initial value if stored JSON is corrupted', () => {
    localStorage.setItem('bad_key', 'NOT_VALID_JSON{{{')
    const { result } = renderHook(() =>
      useLocalStorage('bad_key', 'fallback')
    )
    expect(result.current[0]).toBe('fallback')
  })
})
