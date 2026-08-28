# Task 13 – Custom Hooks: useForm + useToast
### Write-up | Feedback App | React

---

## Q1. What is a custom hook? Why must its name start with "use"?

A **custom hook** is a plain JavaScript function that calls one or more of React's built-in hooks (`useState`, `useEffect`, `useCallback`, etc.) and packages that logic so any component can reuse it — without duplicating code and without touching a class.

Before custom hooks, shared stateful logic meant either copying the same `useState` + validation block into every form component, or wrestling with Higher-Order Components and render props. A custom hook lets that logic live in one file and be pulled in with a single import.

**Why the `use` prefix?**
React's ESLint plugin (`eslint-plugin-react-hooks`) scans your code **by name** to enforce the Rules of Hooks — hooks can only be called at the top level of a component or another hook, never inside loops, conditions, or nested functions. The `use` prefix is the signal it relies on to detect a hook. Without it, the linter treats the function as a regular utility, cannot protect you from misuse, and React itself may behave unpredictably.

---

## Q2. Paste your `useForm` hook code. How does one hook handle validation for multiple different fields?

```js
// src/hooks/useForm.js
import { useState } from 'react'

export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setValues(prev => ({ ...prev, [name]: value }))
  }

  function validateForm() {
    const newErrors = validate(values)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function resetForm() {
    setValues(initialValues)
    setErrors({})
  }

  return { values, errors, handleChange, validateForm, resetForm }
}
```

**How one hook handles many different fields:**

`useForm` knows nothing about which fields exist. The caller passes two arguments:

| Argument | Role |
|---|---|
| `initialValues` | Defines the shape — `{ name: '', email: '', rating: '', message: '' }` |
| `validate` | Defines the rules — a function the caller writes for that specific form |

Inside `handleChange`, the key line is:
```js
setValues(prev => ({ ...prev, [name]: value }))
```
`[name]` is a **computed property** — it reads `e.target.name` from whichever input fired the event and updates only that key in state. The hook never hardcodes "name" or "email"; it reacts to whatever field the user typed in.

So the same hook works for the Login form, Register form, Checkout form, and Feedback form — just by passing different `initialValues` and a different `validate` function.

---

## Q3. How does your toast message disappear automatically after 3 seconds? Show the exact code.

```js
// src/hooks/useToast.js  — exact code responsible for auto-dismiss
const showToast = useCallback((message, type = 'success') => {
  const id = Date.now()                               // ① unique ID captured now

  setToasts(prev => [...prev, { id, message, type }]) // ② append to visible list

  setTimeout(() => {                                   // ③ schedule removal
    setToasts(prev => prev.filter(t => t.id !== id))  // ④ remove only this toast
  }, 3000)
}, [])
```

**Step-by-step:**

1. `Date.now()` generates a unique numeric ID at the moment `showToast` is called.
2. The new toast is appended to the `toasts` array — React re-renders and it appears on screen.
3. `setTimeout` fires after exactly **3000 ms** (3 seconds).
4. Inside the callback, a **functional updater** (`prev => prev.filter(...)`) is used — it always reads the *latest* state snapshot, not a stale closure value. So even if five toasts fire in quick succession, each one dismisses only itself.

The result: every toast disappears on its own, no user action needed.

---

## Q4. Why is a toast notification better UX than `alert()` for the user?

| | `alert()` | Toast |
|---|---|---|
| **Blocks the page** | Yes — freezes everything until clicked | No — page stays fully interactive |
| **Requires user action** | Must click OK every time | Disappears on its own after 3 s |
| **Multiple messages** | One at a time; blocks the queue | Stack independently, dismiss independently |
| **Styling** | Browser-default — looks different everywhere | Fully controlled CSS — green / red |
| **Accessibility** | Intrusive | Uses `aria-live="polite"` — screen readers announce it naturally |
| **User trust** | Feels like a system error or phishing warning | Feels native to the app |

In short: `alert()` stops the user's flow and hands control to the browser. A toast informs the user **without interrupting them** — that is the definition of good UX.

---

## Implementation Challenges Faced

**1. StarRating doesn't fire an event — `useForm` expected one.**
`useForm`'s `handleChange` reads `e.target.name` and `e.target.value`. `StarRating` calls `onChange(starNumber)` — no event object. Fix: a small bridge function in `FeedbackForm`:
```js
function handleRatingChange(star) {
  handleChange({ target: { name: 'rating', value: String(star) } })
}
```
This fakes the event shape so `useForm` stays generic.

**2. Stale closure inside `setTimeout`.**
First attempt used `setToasts(toasts.filter(...))` — `toasts` was stale (captured when the timer was set). Switching to the functional updater `prev => prev.filter(...)` fixed it. Classic React pitfall when async code meets state.

**3. `useCallback` on `showToast`.**
Without it, `showToast` gets a new reference every render. If passed as a prop or used in a dependency array, it could cause unnecessary re-renders or infinite loops. `useCallback([])` stabilizes the reference.

**4. `localStorage` initialization had to be lazy.**
`useState(localStorage.getItem(...))` runs on every render in Strict Mode. Using the initializer form `useState(() => ...)` ensures it runs only once, avoiding a flicker on first load.

---

## Bonus Features Implemented

- ✅ **Persist feedback to `localStorage`** — feedback survives page refresh
- ✅ **Star rating component** — hover preview + click to select
- ✅ **Character counter** — turns orange when fewer than 30 characters remain
- ✅ **Dark mode toggle** — theme persisted to `localStorage`
- ✅ **Rotating developer quote banner** — cycles every 8 seconds
- ✅ **Manual dismiss** — × button on each toast before auto-dismiss fires

---

*Submitted by Sudharsun | Task 13 | Friday 28 August 2026*
