# Task 23 – Testing with Vitest & React Testing Library
## Expense Tracker — Testing Edition

**Developer:** Sudharsun A
**Task:** 23 / EDABIP
**Deadline:** 6th November 2026

---

## 🚀 Setup

```bash
npm install
npm test              # watch mode
npm run test:ui       # browser UI
npm run test:coverage # coverage report
npm run dev           # run the app
```

---

## 🧪 Test Results

```
 Test Files  7 passed (7)
      Tests  57 passed (57)
   Duration  8.27s
```

### Test breakdown

| File | Tests | Description |
|------|-------|-------------|
| `formatters.test.ts` | 8 | formatCurrency, formatDate |
| `filters.test.ts` | 10 | getTotalByCategory, filterExpenses |
| `ExpenseCard.test.tsx` | 10 | Rendering, buttons, interactions, snapshot |
| `SummaryStats.test.tsx` | 8 | With data, empty state |
| `ExpenseForm.test.tsx` | 12 | Rendering, validation, submission |
| `useDebounce.test.ts` | 4 | Timer behaviour with fake timers |
| `useLocalStorage.test.ts` | 5 | CRUD, fallback, error handling |

---

## 📝 Write-up

### Q1: What is the difference between a unit test and an integration test?

A **unit test** tests one single function or component in complete isolation — no real
dependencies, no other components involved.

**Example from this project (unit test):**
```ts
// formatters.test.ts
it('formats zero as ₹0.00', () => {
  expect(formatCurrency(0)).toBe('₹0.00')
})
```
`formatCurrency` is a pure function. Input goes in, output comes out. No DOM,
no React, no network — just the function.

An **integration test** tests how multiple pieces work together as a system.

**Example from this project (integration test):**
```ts
// ExpenseForm.test.tsx
it('calls onAdd with correct title and amount on valid submit', async () => {
  render(<ExpenseForm onAdd={onAdd} ... />)
  await userEvent.type(titleInput, 'Coffee')
  await userEvent.type(amountInput, '80')
  await userEvent.click(submitButton)
  expect(onAdd).toHaveBeenCalledWith(expect.objectContaining({ title: 'Coffee', amount: 80 }))
})
```
This test covers: user interaction → state update → validation logic → callback firing.
Multiple pieces working together.

---

### Q2: What does `vi.fn()` do and why do you need it?

`vi.fn()` creates a **mock function** — a fake stand-in that records every call made
to it, what arguments it received, and how many times it was called.

When testing `ExpenseCard`, the component requires an `onDelete` prop — a function
that in production comes from the parent `App`. In a test, there is no parent. If you
pass a real function, you can't inspect it. If you pass nothing, TypeScript errors out.

```tsx
const onDelete = vi.fn()
render(<ExpenseCard expense={mockExpense} onDelete={onDelete} onEdit={vi.fn()} />)
await userEvent.click(screen.getByRole('button', { name: /delete lunch/i }))

expect(onDelete).toHaveBeenCalledOnce()
expect(onDelete).toHaveBeenCalledWith(42)   // correct id
```

`vi.fn()` lets you verify WHAT happened (was the function called?) and HOW
(with what arguments?) — without needing any real implementation.

---

### Q3: Why must tests not make real API calls? How did you mock an API?

Tests run in a **virtual jsdom environment** with no real browser, no network interface,
and no server. Real API calls would:

1. Fail — because there is no real server in a test run
2. Be **slow** — 100ms per test × 50 tests = your suite takes 5 seconds for no reason
3. Be **flaky** — network is unreliable; tests must be deterministic

To mock API calls, Vitest provides `vi.mock()`:

```ts
vi.mock('../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}))

vi.mocked(api.get).mockResolvedValueOnce({ data: mockExpenses })
```

The component receives exactly the data you tell the mock to return. The test is
instant, deterministic, and works with no network.

---

### Q4: What does `vi.useFakeTimers()` do and why is it needed?

`vi.useFakeTimers()` replaces JavaScript's real `setTimeout`, `setInterval`, and
`Date` with **fake, controllable versions**.

The `useDebounce` hook waits 300ms before updating its value. If tests used real
timers, every debounce test would take 300ms of actual wall-clock time — slow and
fragile.

With fake timers, we can "fast-forward" time instantly:

```ts
vi.useFakeTimers()
rerender({ value: 'world' })

// 299ms — still old value (not updated yet)
act(() => { vi.advanceTimersByTime(299) })
expect(result.current).toBe('hello')

// 300ms — updated now
await act(async () => { vi.advanceTimersByTime(1) })
expect(result.current).toBe('world')

vi.useRealTimers()  // Always restore after each test
```

This makes timer-based tests **instant, deterministic, and completely reliable**.
No race conditions, no waiting, no flakiness.

---

## 🎨 Theme

This project uses the **Midnight Violet** colour palette — a completely original
design distinct from Task 21's teal theme.

| Token | Light | Dark |
|-------|-------|------|
| Background | `#f3f0ff` (soft lavender) | `#0d0a1a` (deep space) |
| Surface | `#ffffff` | `#1a1530` |
| Accent | `#7c3aed` (violet) | `#a78bfa` (lilac) |
| Header | Purple gradient | Dark violet gradient |
| Footer | `#1e1b2e` dark | `#0a0714` deeper dark |

Features:
- Animated shimmer line in the header
- Violet glow strip on stat cards
- Gradient submit button with hover elevation
- Fully accessible (all buttons have aria-labels)

---

## 📁 Project Structure

```
src/
├── test/setup.ts
├── types/index.ts
├── utils/
│   ├── formatters.ts
│   ├── filters.ts
│   └── __tests__/
│       ├── formatters.test.ts
│       └── filters.test.ts
├── hooks/
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   ├── useForm.ts
│   ├── useToast.ts
│   └── __tests__/
│       ├── useDebounce.test.ts
│       └── useLocalStorage.test.ts
├── context/ThemeContext.tsx
├── components/
│   ├── ExpenseCard.tsx
│   ├── ExpenseForm.tsx
│   ├── SummaryStats.tsx
│   ├── ExpenseList.tsx
│   ├── FilterBar.tsx
│   ├── ToastContainer.tsx
│   └── __tests__/
│       ├── ExpenseCard.test.tsx
│       ├── ExpenseForm.test.tsx
│       └── SummaryStats.test.tsx
├── App.tsx
├── main.tsx
└── index.css
```
