# Task 22: TanStack Query v5 Team Task Manager — Mentor Review Guide & Viva Prep

**Author:** Sudharsun A · Software Engineer  
**Project:** Task 22 – TanStack Query Team Taskboard  
**Repository:** [Sudharsun_Stackly-Task / Task-22-TanStack-Query-Team-Taskboard](https://github.com/Sudharsun12/Sudharsun_Stackly-Task)  
**Target Reviewer:** Muddigari Induu Reddy / Technical Mentors

---

## 1. Summary of Changes Implemented

| Area | Previous State | New Enhanced Implementation | Reason / Benefit |
| :--- | :--- | :--- | :--- |
| **Header (Navbar) Title** | Brand placed on the left side alongside nav links | **Centered "Team Task Board"** in the top navbar via 3-column CSS Grid (`1fr auto 1fr`) | Clean symmetry, making the board brand the primary focal point of the header |
| **Dashboard & Tasks Navigation** | Links were embedded inside the top sticky navbar | Moved **into the body page** as dedicated view switcher tabs (`BodyNav.tsx`) | Keeps the top header uncluttered and places view navigation right where the user works |
| **Status & Priority Badges** | Badges lacked explicit spacing and collided/overlapped on rows | Separate flex container with `gap: 0.65rem`, explicit padding, rounded pills, and distinct light/dark color tokens | Completely eliminates visual collision; badges render with clear separation |
| **Search & Filter Controls** | Search input and 3 dropdowns (Status, Priority, Assignee) were cramped without clear structure | Dedicated `.filter-bar` flex layout with `gap: 1.25rem`, labeled selects, dedicated search icon, and balanced widths | Generous spacing, professional input borders, and responsive stacking on mobile |
| **Task Pagination** | Pagination bar was left-aligned or centered | **Right-aligned** pagination (`.pagination-right`) with clean previous/next buttons and bold page indicator | Standard executive UI layout allowing intuitive right-side table navigation |
| **KPI Metrics Polling Indicator** | Displayed "Live · Polled every 10s · ..." badge | Removed polling text completely while retaining seamless background caching in TanStack Query | Eliminates distracting ticker text from executive metrics |
| **Theme System** | Hardcoded dark nav, only toggled from inside dashboard | Global `ThemeProvider` (`ThemeContext.tsx`) persisted in `localStorage` + pre-login switcher on `LoginPage.tsx` | Allows theme toggle before sign-in and across all components |
| **Minimalist Footer** | Multi-column links with organization tags and quotes | Minimalist single-line footer: `Developed by Sudharsun A · Software Engineer • © 2026 All Rights Reserved` | Strict compliance with professional formatting guidelines |
| **Database Connection** | Blank default password | Configured for `127.0.0.1:3306`, user `root`, password `Srisudhan@1223`, database `task_manager` | Plug-and-play execution in VS Code |

---

## 2. Core Concepts: TanStack Query v5 vs. Legacy State

### A. Server State vs. Client State
- **Client State:** Ephemeral, synchronous UI state owned completely by the browser (e.g., active modal open/close, selected tab, theme mode). Managed via React `useState`, `useReducer`, or Context.
- **Server State:** Asynchronous data persisted on an external database (e.g., tasks, user profiles, dashboard metrics). It is asynchronous, shared across multiple users, requires caching, background refetching, and can become stale at any moment. TanStack Query is specifically engineered to manage server state.

### B. The Pitfalls of `useState` + `useEffect`
```typescript
// ❌ Legacy Approach: 20+ lines of boilerplate per fetch
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let isMounted = true;
  setIsLoading(true);
  fetchTasks()
    .then(data => { if (isMounted) setTasks(data); })
    .catch(err => { if (isMounted) setError(err.message); })
    .finally(() => { if (isMounted) setIsLoading(false); });
  return () => { isMounted = false; };
}, []);
```
**Problems with legacy approach:**
1. **Network Waterfalls & Race Conditions:** Fast responses can overwrite slow responses if filters change quickly.
2. **No Cache Sharing:** Switching views destroys state, causing blank loading spinners on every return visit.
3. **Complex Cache Invalidation:** Creating a task requires either manual array mutation (`[newTask, ...tasks]`) or re-triggering `useEffect` via convoluted flag variables.
4. **No Deduping:** Mounting two components requesting the same API fires two duplicate HTTP requests simultaneously.

---

## 3. Key TanStack Query v5 Architecture in This Project

### 1. Central QueryClient Configuration (`src/queryClient.ts`)
```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,  // 2 minutes: queries are fresh, zero background refetching during this window
      gcTime: 1000 * 60 * 10,    // 10 minutes: inactive cache persists in memory for instant reuse
      refetchOnWindowFocus: true, // Auto-sync data when tab regains focus
      retry: 1,                   // Fail-fast on network drops
    },
  },
});
```

### 2. Query Key Factory Pattern (`src/api/tasks.ts`)
```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
};
```
*Why this matters:* TanStack Query serializes query keys deterministically. By utilizing structured tuple factories, invalidating `taskKeys.lists()` invalidates all filtered variations simultaneously without manual string regex.

### 3. Automatic Cache Invalidation on Mutations
When creating, updating, or deleting a task, mutations trigger targeted cache invalidation:
```typescript
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      // Automatically refetches tasks list and stats panel
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};
```

### 4. Smart Hover Prefetching (`src/components/TaskCard.tsx`)
```typescript
// Prefetches single task details when user hovers over a task card
const prefetch = () => {
  queryClient.prefetchQuery({
    queryKey: ['tasks', task.id],
    queryFn: () => fetchTask(task.id),
    staleTime: 1000 * 30, // 30s
  });
};
```
*Result:* When the user clicks on the task detail, the data is already in cache—**zero loading spinner (0ms perception delay)**.

---

## 4. Mentor Viva & Technical Review Q&A

### Q1: What is the difference between `staleTime` and `gcTime` in TanStack Query v5?
> **Answer:**
> - `staleTime` determines **how long fetched data is considered fresh**. While data is fresh, TanStack Query returns it directly from cache without triggering background network requests. When data becomes stale, it remains visible in the UI, but TanStack Query will automatically trigger a background refetch when the window is refocused or a component mounts.
> - `gcTime` (Garbage Collection Time, previously called `cacheTime` in v4) defines **how long unused or unmounted query data remains in memory** before being garbage collected.

### Q2: What is the difference between `isLoading` and `isFetching`?
> **Answer:**
> - `isLoading` is true **only during the initial fetch** when there is no data in the cache yet (`status === 'pending' && isFetching`).
> - `isFetching` is true **any time a network request is in flight**, including initial loads, background refetches on window focus, and background syncs.

### Q3: Why did we move from `useState + useEffect` to TanStack Query?
> **Answer:**
> TanStack Query eliminates boilerplate code. It provides:
> 1. In-memory caching and automatic deduplication of identical requests.
> 2. Zero-latency UI via cache hydration and background revalidation (Stale-While-Revalidate).
> 3. Declarative mutations with `useMutation` and automatic cache synchronization via `queryClient.invalidateQueries`.
> 4. Automatic window focus refetching and error retry handling.

### Q4: How is the Light/Dark theme implemented?
> **Answer:**
> The theme is managed via React Context (`ThemeContext.tsx`) and controlled with CSS custom properties (`--bg`, `--surface`, `--ink`, `--nav-bg`, `--border`).
> - It initializes by checking `localStorage.getItem('ttm_theme')`. If none exists, it falls back to the user's OS preference via `window.matchMedia('(prefers-color-scheme: dark)')`.
> - It applies a `data-theme="light"` or `data-theme="dark"` attribute to the document root element `<html>`.
> - The theme toggle is accessible on the `LoginPage` prior to signing in, as well as on the authenticated `Navbar`.

### Q5: What security practices are followed for authentication?
> **Answer:**
> - Passwords are never stored in plain text; they are hashed using **`bcrypt`** with salt on registration.
> - Authentication is verified via **JWT (JSON Web Tokens)** containing user ID, role, and username, signed with an HS256 secret.
> - Protected endpoints verify the JWT via an `Authorization: Bearer <token>` header on every Axios request via an HTTP interceptor.

---

## 5. Quick Verification Commands

```powershell
# 1. Start MySQL (ensure running on 127.0.0.1:3306)
# Database: task_manager

# 2. Run Backend (from E:\task-manager-rq\backend)
python app.py
# Server starts on http://127.0.0.1:5000

# 3. Run Frontend (from E:\task-manager-rq\frontend)
npm run dev
# Vite runs on http://localhost:5173
```
