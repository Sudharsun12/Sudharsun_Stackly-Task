# Task 22 — Challenges Faced & How They Were Solved

**Name:** Sudharsun | **Task:** 22 · TanStack Query Team Task Manager

---

## Challenge 1 — Mental Model Shift: Thinking in Cache, Not State

**The Challenge:**
The hardest part of Task 22 was not the syntax — it was unlearning 21 tasks worth of the `useState + useEffect` habit. My first instinct when building a new page was to reach for `useState([])` and write a `useEffect`. I had to consciously stop myself each time.

**What went wrong initially:**
On the first attempt at `Dashboard.tsx`, I mixed both patterns — I used `useQuery` for stats but kept a `useState + useEffect` for the recent task list because it "felt safer." This caused the two data sources to behave differently: the stats auto-refreshed, but the task list never updated after a mutation because there was no `invalidateQueries` connected to it.

**How I fixed it:**
I deleted the manual fetch entirely, moved the task list to `useTasks()`, and let the shared `useRefreshAfterWrite()` helper invalidate both `['tasks']` and `['stats']` on every mutation. Once both were in the TanStack Query cache, they synchronized perfectly.

**The lesson:**
Server state is all-or-nothing within a feature. Mixing `useState` fetching with `useQuery` on the same page breaks the automatic sync guarantee.

---

## Challenge 2 — Query Key Design: Over-Fetching vs. Cache Misses

**The Challenge:**
Getting the query key structure right for the tasks list took several iterations. If the key was too broad (`['tasks']`), filtering and pagination overwrote each other. If it was too narrow (including the full filter object), some invalidations missed stale entries.

**What went wrong initially:**
My first version used `queryKey: ['tasks']` for all task queries — no filters, no page number in the key. This meant every filter change returned the same cache entry, so switching from `status: 'todo'` to `status: 'done'` would briefly flash stale `'todo'` data while fetching `'done'` results. Worse, `invalidateQueries({ queryKey: ['tasks'] })` correctly invalidated everything, but going back to `'todo'` triggered a full refetch instead of hitting the cache.

**How I fixed it:**
Changed the key to `['tasks', filters]` where `filters` is the whole filter/pagination object. This gives every unique combination its own cache bucket. `invalidateQueries({ queryKey: ['tasks'] })` still works because TanStack Query uses prefix matching — any key that starts with `'tasks'` gets invalidated.

**The lesson:**
Think of query keys like database composite indexes. Narrow keys = more granular caching = fewer unnecessary refetches.

---

## Challenge 3 — `isLoading` vs `isFetching` Confusion in the Stats Panel

**The Challenge:**
The stats panel was showing a full skeleton loader every 10 seconds due to the `refetchInterval` polling. This made the dashboard flicker constantly even when data was already on screen.

**What went wrong initially:**
I used `isLoading` to decide when to show the skeleton:
```tsx
if (isLoading) return <SkeletonGrid />
```
But `isLoading` is `true` on every refetch when there is no existing cache data — and since the polling kept invalidating the cache, `isLoading` was toggling frequently.

**How I fixed it:**
Switched to `isLoading` only for the very first load (which is its correct purpose — no cache data at all), and used `isFetching` for the subtle pulsating dot indicator instead:
```tsx
if (isLoading) return <SkeletonGrid />   // First load only
// isFetching used for the live dot animation during background polls
```
TanStack Query keeps the previous data visible during background refetches, so the skeleton never shows after the first load.

**The lesson:**
`isLoading` = "I have nothing to show." `isFetching` = "I'm quietly checking for updates in the background."

---

## Challenge 4 — Centring the Navbar Navigation Between Brand and User Pill

**The Challenge:**
The navbar needed the app name/logo on the left, nav links perfectly centred, and the user pill on the right — a classic three-column layout that breaks with `flexbox + gap` because the left and right elements have different widths.

**What went wrong initially:**
Using `display: flex; justify-content: space-between` pushed links to wherever the remaining space fell, which was visually off-centre depending on how long the user's name was.

**How I fixed it:**
Replaced `display: flex` on `.navbar-inner` with `display: grid; grid-template-columns: 1fr auto 1fr`. The `auto` centre column takes only as much space as the nav links need, and the two `1fr` columns on either side share the remaining space equally — forcing the centre column to be mathematically centred regardless of what is on either side.

**The lesson:**
For true three-column centering, CSS Grid with `1fr auto 1fr` is cleaner and more reliable than any flexbox trick.

---

## Challenge 5 — JWT Token Expiry Mid-Session

**The Challenge:**
When a JWT access token expired while the user was actively using the app, the next API call returned a 401 and nothing useful happened on the UI — the user just saw an error state with no explanation.

**How I fixed it:**
Added a response interceptor in `api/axios.ts` that catches any 401 from a non-login endpoint, clears the token from `localStorage`, and redirects to `/login`. This gives the user an immediate, clear signal that their session ended.

```typescript
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401
        && !err.config?.url?.includes('/api/login')) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
```

**The lesson:**
Authentication edge cases must be handled at the Axios layer, not inside individual components, so every request in the app benefits automatically.
