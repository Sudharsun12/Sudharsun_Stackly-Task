# Task 22: Technical Lead (TL) Code Review & Viva Guide

**Author:** Sudharsun A · Software Engineer  
**Project:** Task 22 – TanStack Query v5 Team Taskboard  
**Target Reviewer:** Technical Lead (TL), Engineering Manager, Senior Mentor  
**Repository:** [Sudharsun_Stackly-Task / Task-22-TanStack-Query-Team-Taskboard](https://github.com/Sudharsun12/Sudharsun_Stackly-Task)

---

## Executive Summary for the Code Review

When a **Technical Lead (TL)** conducts a code review, they do not just test if the app works. They inspect:
1. **Architectural Decisions:** Why did you choose TanStack Query over Redux/Zustand/Context?
2. **Code Cleanliness & Patterns:** Are responsibilities separated? Are Query Keys centralized?
3. **Edge Case Handling:** Race conditions, debounce, network failures, stale data, token expiry.
4. **Security & Data Integrity:** SQL injection defense, password hashing, JWT storage, authorization guards.
5. **TypeScript Contract Safety:** Are types strict? Are generics utilized properly?

This document prepares you for every question a TL can ask by referencing the **exact files and lines of code** in this repository.

---

## Module 1: TanStack Query v5 Architecture & Cache Engine

### File: `frontend/src/queryClient.ts`

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes
      gcTime: 1000 * 60 * 10,      // 10 minutes (formerly cacheTime in v4)
      refetchOnWindowFocus: true,   // Sync when returning to tab
      retry: 1,                     // Retry 1 failed network call before throwing
    },
  },
})
```

#### ❓ Question 1 (TL): "Why did you choose `staleTime: 2m` and `gcTime: 10m`? What is the technical difference?"
> **Your Answer:**
> - **`staleTime` (Freshness Contract):** Defines how long fetched data is considered pristine. During these 2 minutes, any component requesting this query key receives cached data **synchronously in 0ms** with zero background network requests. Once 2 minutes elapse, the data is marked "stale". Stale data is still rendered immediately, but TanStack Query triggers a background refetch upon trigger events (like window focus or remount).
> - **`gcTime` (Memory Garbage Collection):** Defines how long inactive/unmounted query data remains in the JavaScript heap memory before being discarded. If a user leaves the Tasks page and returns within 10 minutes, the data hydrates instantly from memory while revalidating.
> - **Rule:** `gcTime` must always be equal to or greater than `staleTime`, otherwise cached data would be evicted while still considered fresh.

#### ❓ Question 2 (TL): "What happens when `refetchOnWindowFocus: true` is triggered? Doesn't that cause unnecessary network spam?"
> **Your Answer:**
> No, because of our `staleTime`. If the user alt-tabs and comes back within the 2-minute window, TanStack Query checks the cache timestamp, sees that data is still fresh, and **does not fire any HTTP request**. It only fires if the data is stale, which is exactly when you want background synchronization to prevent users from making decisions on outdated task lists.

---

### File: `frontend/src/api/tasks.ts` — The Query Key Factory

```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
}
```

#### ❓ Question 3 (TL): "Why did you write a Query Key Factory instead of inline strings like `['tasks', status]`?"
> **Your Answer:**
> 1. **Prevents Typo Disasters:** Writing inline strings in multiple files (`['task']` vs `['tasks']`) leads to silent cache invalidation bugs where mutations update one key while components listen to another.
> 2. **Hierarchical Invalidation:** By structuring keys hierarchically (`['tasks', 'list', filters]`), calling `queryClient.invalidateQueries({ queryKey: taskKeys.lists() })` invalidates **all** filtered task lists (page 1, page 2, filter todo, filter done) in one line without having to know each active filter parameter.
> 3. **Type Safety with `as const`:** `as const` converts mutable arrays (`string[]`) into **immutable tuple types** (`readonly ['tasks', 'list']`). This guarantees deterministic hashing by TanStack Query's internal serializer.

---

## Module 2: Mutations & Cache Invalidation

### File: `frontend/src/hooks/useTaskMutations.ts`

```typescript
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: taskKeys.lists() })
      qc.invalidateQueries({ queryKey: taskKeys.stats() })
    },
  })
}
```

#### ❓ Question 4 (TL): "Why did you use `invalidateQueries` instead of manually updating the cache with `setQueryData`?"
> **Your Answer:**
> - Invalidation is a **declarative, server-state aligned** strategy. When a new task is created, server-generated values (like auto-incremented `id`, `created_at`, `creator_name`, and database trigger updates) are finalized by the backend.
> - Invalidating `taskKeys.lists()` forces a background refetch that brings down the true server state while keeping pagination and sorting 100% accurate.
> - Updating cache manually with `setQueryData` across multiple complex filter combinations and pagination boundaries is fragile and prone to pagination offset drift.

#### ❓ Question 5 (TL): "How would you implement Optimistic Updates if the team requested sub-10ms UI responses?"
> **Your Answer:**
> In `useMutation`:
> 1. In `onMutate`: Call `await queryClient.cancelQueries({ queryKey })` to cancel in-flight fetches so they don't overwrite our optimistic update.
> 2. Snapshot current state: `const previousTasks = queryClient.getQueryData(queryKey)`.
> 3. Optimistically insert temporary item: `queryClient.setQueryData(queryKey, old => [...old, tempTask])`.
> 4. Return the context `{ previousTasks }`.
> 5. In `onError`: Rollback cache: `queryClient.setQueryData(queryKey, context.previousTasks)`.
> 6. In `onSettled`: Always call `queryClient.invalidateQueries` to ensure synchronization with real server IDs.

---

## Module 3: Performance Engineering & UX

### File: `frontend/src/components/TaskCard.tsx` — Hover Prefetching

```typescript
const prefetch = () =>
  queryClient.prefetchQuery({
    queryKey: ['tasks', task.id],
    queryFn: () => fetchTask(task.id),
    staleTime: 1000 * 30, // 30s
  })

return (
  <li className="task-row" onMouseEnter={prefetch}>
    ...
  </li>
)
```

#### ❓ Question 6 (TL): "Walk me through how Hover Prefetching works and what problem it solves."
> **Your Answer:**
> - **The Problem:** In standard SPAs, when a user clicks a task link, the router transitions to `/tasks/:id`, the component mounts with a blank state or skeleton loader, and fires an HTTP request. The user experiences a 200–500ms delay.
> - **Our Solution:** Research shows human users hover their mouse over a clickable target for **200ms to 400ms** before pressing the mouse button. On `onMouseEnter`, we invoke `queryClient.prefetchQuery`.
> - By the time the user clicks, the task data is already cached in memory. The detail page mounts and renders **instantly in 0ms (zero perception delay)**.
> - Setting `staleTime: 30s` prevents redundant refetching if the user repeatedly moves their mouse over the item.

---

### File: `frontend/src/hooks/useDebounce.ts` & `frontend/src/pages/TasksPage.tsx`

```typescript
export function useDebounce<T>(value: T, delay = 350): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
```

#### ❓ Question 7 (TL): "Why did you implement Debouncing on search? What happens without it?"
> **Your Answer:**
> - Without debouncing, every keystroke in the search box immediately updates React state, triggering a new HTTP request (`GET /api/tasks?search=s`, `...search=su`, `...search=sud`).
> - This causes **network flooding** (10 keystrokes = 10 API requests) and introduces **race conditions** (a slow earlier query could resolve after a fast later query, displaying outdated results).
> - Our `useDebounce` hook buffers the user's keystrokes for **400ms**. Only when the user pauses typing is the query key updated, firing a single clean network request.

---

## Module 4: Authentication, Security & Backend Architecture

### File: `backend/app.py` — Parameterized SQL & JWT Authentication

```python
# 1. SQL Injection Prevention
row = run("SELECT * FROM users WHERE email=%s", (email,), one=True)

# 2. Secure Password Hashing
hashed = bcrypt.generate_password_hash(password).decode("utf-8")
is_valid = bcrypt.check_password_hash(row["password"], password)

# 3. Stateless Token Generation
access_token = create_access_token(identity=str(row["id"]))
```

#### ❓ Question 8 (TL): "How does your backend prevent SQL Injection attacks?"
> **Your Answer:**
> - In `backend/app.py`, we strictly avoid string formatting like `f"SELECT * FROM users WHERE email='{email}'"`.
> - Instead, we use **parameterized queries** with `%s` placeholders passed to `mysql.connector`. The MySQL driver treats inputs strictly as literal values rather than executable SQL code, completely neutralizing SQL injection attempts (e.g., `' OR '1'='1`).

#### ❓ Question 9 (TL): "Why did you use Bcrypt for passwords instead of SHA-256 or MD5?"
> **Your Answer:**
> - SHA-256 and MD5 are **fast general-purpose cryptographic hash functions**. Modern GPUs can compute billions of SHA-256 hashes per second, making them extremely vulnerable to brute-force rainbow table attacks.
> - **Bcrypt** is an adaptive, CPU-intensive, salted key-derivation algorithm designed specifically for passwords. It incorporates:
>   1. **Automatic Salt Generation:** Every hash has a unique salt, making rainbow tables useless.
>   2. **Configurable Work Factor (Rounds):** As hardware gets faster, the work factor can be increased to ensure hashing remains computationally expensive.

#### ❓ Question 10 (TL): "How are protected endpoints secured on both frontend and backend?"
> **Your Answer:**
> - **Backend:** Endpoints use the `@jwt_required()` decorator from `flask_jwt_extended`. It verifies the HMAC-SHA256 signature and expiration time of the JWT in the `Authorization: Bearer <token>` header. If invalid or missing, it responds with `401 Unauthorized`.
> - **Frontend:** 
>   1. In `src/api/axios.ts`, an Axios request interceptor reads the token from `localStorage` and automatically attaches it to every outgoing request.
>   2. In `src/components/ProtectedRoute.tsx`, React Router redirects any unauthenticated user to `/login` before protected components ever mount.

---

## Module 5: TypeScript Typing & Contract Safety

### File: `frontend/src/types/index.ts`

```typescript
export type TaskStatus = 'todo' | 'in_progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assigned_to?: number
  assigned_name?: string
  created_by: number
  creator_name?: string
  due_date?: string
  created_at: string
  updated_at: string
}
```

#### ❓ Question 11 (TL): "Why did you use union types like `'todo' | 'in_progress' | 'done'` instead of `string`?"
> **Your Answer:**
> - `string` is infinitely wide; it permits invalid values like `"pending"`, `"finished"`, or `"TODO"`.
> - Union types create a **closed enum contract** between TypeScript, Flask (`STATUSES = ("todo", "in_progress", "done")`), and the MySQL `ENUM` column.
> - If any developer accidentally passes an unsupported status string in frontend components, TypeScript throws a compile-time error during `npm run build`.

#### ❓ Question 12 (TL): "How do TypeScript Generics work in our `useTasks` hook?"
> **Your Answer:**
> - In `useQuery<TaskResponse, Error>`, we pass two generic type parameters:
>   1. `TData = TaskResponse`: Informs TypeScript that `data` will contain `{ items: Task[], total: number, page: number, pages: number }`.
>   2. `TError = Error`: Types any catchable error object.
> - This gives us full IntelliSense and autocomplete across the entire application without needing type casting (`as Task`).

---

## Module 6: UI System & Theme Engine

### File: `frontend/src/context/ThemeContext.tsx` & `frontend/src/index.css`

#### ❓ Question 13 (TL): "How does the Theme System work? Why is it accessible before login?"
> **Your Answer:**
> - **Context & Storage:** `ThemeContext` persists the active theme (`'light'` or `'dark'`) in `localStorage` under key `ttm_theme`. If no preference is saved, it detects the user's OS preference using `window.matchMedia('(prefers-color-scheme: dark)')`.
> - **DOM Attribute:** It sets `document.documentElement.setAttribute('data-theme', theme)`.
> - **CSS Custom Properties:** In `index.css`, variables like `--bg`, `--surface`, `--ink`, `--nav-bg`, and badge colors dynamically shift based on `[data-theme='dark']`.
> - **Pre-Login Accessibility:** The `ThemeProvider` wraps the entire `<BrowserRouter>` at the root of `App.tsx`. Therefore, `LoginPage.tsx` has full access to `useTheme()` before authentication occurs.

---

## Module 7: Edge Cases & "Trick" Questions TLs Love to Ask

#### ❓ Question 14 (TL): "What happens if MySQL goes down while a user is using the app?"
> **Your Answer:**
> 1. TanStack Query will attempt **1 retry** (`retry: 1` in `queryClient.ts`).
> 2. Once the retry fails, `isError` turns `true` with the error object.
> 3. In [`Dashboard.tsx`](file:///E:/task-manager-rq/frontend/src/pages/Dashboard.tsx) and [`TasksPage.tsx`](file:///E:/task-manager-rq/frontend/src/pages/TasksPage.tsx), we render a non-crashing `.state-box.state-error` displaying a human-readable message and an interactive **Retry Fetch** button.
> 4. If an unexpected JavaScript crash occurs, the top-level [`ErrorBoundary.tsx`](file:///E:/task-manager-rq/frontend/src/components/ErrorBoundary.tsx) catches the exception and renders a recovery screen without crashing the whole browser tab.

#### ❓ Question 15 (TL): "Why didn't you use Redux Toolkit or Zustand for this project?"
> **Your Answer:**
> - Redux and Zustand are **client state management libraries**. When used for server data, developers are forced to manually write async thunks, loading states, error states, caching logic, and polling intervals.
> - TanStack Query is a dedicated **server state synchronization engine**. It eliminates hundreds of lines of boilerplate by handling caching, deduplication, background revalidation, window focus sync, and garbage collection out of the box.
> - Using Redux for server data in 2026 is an anti-pattern when tools like TanStack Query exist.

#### ❓ Question 16 (TL): "What if two users edit the same task at the same time? How does our code handle concurrency?"
> **Your Answer:**
> - In our current implementation, the backend updates the row with `UPDATE tasks SET ... WHERE id=%s`, and MySQL updates the `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`.
> - For enterprise-grade optimistic concurrency control, we can include the `updated_at` timestamp in the `PUT` payload: `UPDATE tasks SET ... WHERE id=%s AND updated_at=%s`. If the affected rows count is 0, Flask returns `409 Conflict`, prompting the user that another teammate modified the task.

---

## 8. Summary Checklist for Your Review Presentation

When speaking with your TL, walk through the project in this sequence:
1. **Show the Problem:** Explain the limitations of legacy `useState + useEffect` (boilerplates, race conditions, no cache).
2. **Show the Solution:** Point to `queryClient.ts` (`staleTime: 2m`, `gcTime: 10m`) and `taskKeys` in `api/tasks.ts`.
3. **Show Data Flow:** Demonstrate task creation $\rightarrow$ mutation $\rightarrow$ automatic cache invalidation $\rightarrow$ instant UI sync.
4. **Show Optimizations:** Demonstrate hover prefetching in `TaskCard.tsx` and debouncing in `FilterBar.tsx`.
5. **Show Security:** Highlight parameterized queries and Bcrypt in `backend/app.py`.
