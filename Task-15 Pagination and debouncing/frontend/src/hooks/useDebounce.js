import { useState, useEffect } from 'react'

/**
 * useDebounce — delays updating the returned value until the user
 * stops changing `value` for `delay` milliseconds.
 *
 * How it works:
 *  1. Every time `value` changes, a new setTimeout is scheduled.
 *  2. The cleanup function cancels the PREVIOUS timer before the new
 *     one starts — so rapid changes (keystrokes) never fire.
 *  3. Only when `delay` ms pass without interruption does
 *     `setDebounced` run, triggering any effects that depend on it.
 *
 * @param {*}      value  – the raw value (e.g. search string)
 * @param {number} delay  – debounce delay in ms (default 300)
 * @returns the debounced value
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    // Schedule the update
    const timer = setTimeout(() => {
      setDebounced(value)
    }, delay)

    // Cleanup: cancel the timer if value changes before delay expires
    // This is what makes debouncing work — stale timers never fire
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
