# Task 22: TanStack Query v5 Team Task Manager — Mentor Review Guide & Viva Prep

**Author:** Sudharsun A · Software Engineer  
**Project:** Task 22 – TanStack Query Team Taskboard  
**Repository:** [Sudharsun_Stackly-Task / Task-22-TanStack-Query-Team-Taskboard](https://github.com/Sudharsun12/Sudharsun_Stackly-Task)  
**Target Reviewer:** Muddigari Induu Reddy / Technical Mentors

---

## 1. Summary of Changes Implemented

| Area | Previous State | New Enhanced Implementation | Reason / Benefit |
| :--- | :--- | :--- | :--- |
| **Theme System** | Hardcoded dark nav, basic dark mode, only toggled from inside dashboard navbar | Global `ThemeProvider` (`ThemeContext.tsx`) persisted in `localStorage` + OS system preference fallback | Seamless light/dark transition across the entire app |
| **Pre-Login Theme Toggle** | Not available before logging in | Interactive Theme Switcher added to the pre-auth header on `LoginPage.tsx` | Allows users to choose light/dark theme before sign in |
| **Navbar Styling** | Fixed dark navy (`--ink`) background regardless of theme | Dynamic CSS variables (`--nav-bg`, `--nav-border`, `--nav-text`, `--nav-quote-bg`) reacting instantly to theme switch | Clean, frosted-glass header matching the chosen color mode |
| **Footer Component** | Cluttered multi-column footer with EDABIP internship tags and mentor links | Strict, minimal, professional bar: `Developed by Sudharsun A · Software Engineer • © 2026 All Rights Reserved` | Clean corporate polish adhering strictly to requirements |
| **Dashboard Layout** | Heavy nested container cards wrapping greeting, filters, and boards | Open executive layout removing outer card wrappers; only 4 essential KPI metric cards retained | Eliminates visual noise, emphasizes high-priority task data |
| **KPI Metrics** | 6 cluttered, repetitive stat tiles | 4 essential KPI cards: Workload, Completed %, Overdue Alerts, Weekly Closed with live polling indicator | High-signal metrics for fast executive scanning |
| **Database Connection** | Blank default password | Configured for `127.0.0.1:3306`, user `root`, password `Srisudhan@1223`, database `task_manager` | Zero-configuration plug-and-play local execution in VS Code |

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

### 4. Smart Hover Prefetching (`src/pages/Dashboard.tsx`)
```typescript
// Prefetches single task details when user hovers over a task card
const handleMouseEnter = (taskId: number) => {
  queryClient.prefetchQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => fetchTaskByIdApi(taskId),
    staleTime: 1000 * 30, // 30s
  });
};
```
*Result:* When the user clicks on the task modal, the data is already in cache—**zero loading spinner (0ms perception delay)**.

### 5. Live Auto-Polling (`src/components/StatsPanel.tsx`)
```typescript
const { data: stats, isFetching } = useQuery({
  queryKey: taskKeys.stats(),
  queryFn: fetchTaskStatsApi,
  refetchInterval: 15000, // Background poll every 15 seconds
  refetchIntervalInBackground: false, // Pauses when tab is hidden
});
```

---

## 4. Mentor Viva & Technical Review Q&A

### Q1: What is the difference between `staleTime` and `gcTime` in TanStack Query v5?
> **Answer:**
> - `staleTime` determines **how long fetched data is considered fresh**. While data is fresh, TanStack Query returns it directly from cache without triggering any background network requests. When data becomes stale (after `staleTime` expires), it remains visible in the UI, but TanStack Query will automatically trigger a background refetch when the window is refocused or a component mounts.
> - `gcTime` (Garbage Collection Time, previously called `cacheTime` in v4) defines **how long unused or unmounted query data remains in memory** before being garbage collected. Even if a query is stale, it stays in memory until `gcTime` elapses.

### Q2: What is the difference between `isLoading` and `isFetching`?
> **Answer:**
> - `isLoading` is true **only during the initial fetch** when there is no data in the cache yet (`status === 'pending' && isFetching`).
> - `isFetching` is true **any time a network request is in flight**, including initial loads, background refetches on window focus, and periodic polling intervals.

### Q3: Why did we move from `useState + useEffect` to TanStack Query?
> **Answer:**
> TanStack Query eliminates ~80% of boilerplate code. It provides out-of-the-box:
> 1. In-memory caching and automatic deduplication of identical requests.
> 2. Zero-latency UI via cache hydration and background revalidation (Stale-While-Revalidate).
> 3. Declarative mutations with `useMutation` and automatic cache synchronization via `queryClient.invalidateQueries`.
> 4. Window focus refetching and offline network recovery without manual event listeners.

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
