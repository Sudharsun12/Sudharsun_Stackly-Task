// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// src/hooks/__tests__/useDebounce.test.ts
// Tests the useDebounce hook using vi.useFakeTimers() to control
// time manually — no real waiting in the test suite.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useDebounce from '../useDebounce'

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebounce', () => {
  it('returns the initial value immediately on first render', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('still returns the old value before the delay expires', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })

    // 299ms — should NOT have updated yet
    act(() => { vi.advanceTimersByTime(299) })
    expect(result.current).toBe('hello')
  })

  it('updates to the new value after the delay expires', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    )

    rerender({ value: 'world' })

    // 300ms — should have updated now
    await act(async () => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('world')
  })

  it('resets the timer when value changes rapidly', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    )

    rerender({ value: 'ab' })
    act(() => { vi.advanceTimersByTime(200) })

    rerender({ value: 'abc' })
    act(() => { vi.advanceTimersByTime(200) })

    // Only 200ms since last change — still old value
    expect(result.current).toBe('a')

    // Now complete the full 300ms delay from last change
    await act(async () => { vi.advanceTimersByTime(100) })
    expect(result.current).toBe('abc')
  })
})
