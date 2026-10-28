# Task 22 — Write-up: TanStack Query (React Query)

**Name:** Sudharsun
**Mentor:** Muddigari Induu Reddy
**Task:** 22 · Team Task Manager with TanStack Query
**Stack:** React 18 · TypeScript · TanStack Query v5 · Flask · MySQL

---

## Q1. What is the difference between server state and client state? Give one example of each from your application.

**Server State** is data that lives in an external database, is fetched asynchronously over the network, can become stale at any moment, and can be changed by other users or processes without your browser knowing.

**Client State** is transient, synchronous data that lives only in your browser's RAM, is owned entirely by the current user, and resets every time the page reloads.

**Example of Server State in this app:**
The task list (`GET /api/tasks`) and the KPI numbers (`GET /api/stats`).
These are stored in MySQL, fetched over HTTP, and can change whenever any user adds, updates, or deletes a task. I managed both of them with `useQuery` from TanStack Query, which keeps them cached and re-syncs them automatically.

**Example of Client State in this app:**
The `searchInput` string in `TasksPage.tsx` — the text the user is currently typing into the search bar. It exists only in the browser, does not need to go to the server until it is debounced, and is managed with plain `useState`.

---

## Q2. What is a query key in TanStack Query? Why does the key `['tasks', { status: 'todo' }]` cache separately from `['tasks']`?

A **query key** is a serializable JavaScript array that TanStack Query uses as the primary key for storing and retrieving data from its in-memory cache. It is like a label on a file drawer — the contents of the drawer depend completely on the label.

**Why they cache separately:**
TanStack Query runs a deterministic JSON serializer on the array. The key `['tasks']` serializes to `["tasks"]`, while `['tasks', { status: 'todo' }]` serializes to `["tasks",{"status":"todo"}]`. They produce different hash strings, so they become two completely separate cache entries.

This means:
- Filtering tasks by `status: 'todo'` fetches and stores its own independent result set.
- Switching the filter from `'todo'` to `'done'` creates yet another cache entry.
- Going back to `'todo'` immediately reads from the cached result — **zero extra network request**.

In this project, every unique combination of `{ status, priority, search, page }` has its own cache bucket, enabling instant back-and-forth navigation between filter states.

---

## Q3. What does `invalidateQueries` do after a mutation? What would happen if you forgot to call it?

**What it does:**
After a mutation (create, update, or delete), `queryClient.invalidateQueries({ queryKey: ['tasks'] })` marks every cache entry whose key starts with `['tasks']` as **stale**. If any component on screen is currently subscribed to that key (i.e. the task list is visible), TanStack Query immediately fires a background network request to fetch fresh data. The UI updates automatically — the user sees the new or changed task without pressing Refresh.

In this project, every mutation also invalidates `['stats']` so the dashboard counters (total tasks, overdue, completed this week) stay in sync.

**What would happen if you forgot to call it:**
The cache would remain marked as **fresh** for up to the configured `staleTime` (1 minute in this project). The user would see outdated data — a task they just created would not appear in the list, a task they deleted would still show, and the stat counts would be wrong. The only way the screen would self-correct is if the user manually refreshed the browser or waited for staleTime to expire.

---

## Q4. What is `staleTime` and how did you use it in this project? What problem does it solve?

**Definition:**
`staleTime` is the duration in milliseconds after a successful fetch during which TanStack Query considers the cached data "fresh." While the data is fresh, TanStack Query will serve it directly from the in-memory cache without making any network requests, even if the component unmounts and remounts.

After `staleTime` elapses, the data becomes "stale." Stale data is still shown on screen immediately (so there is no blank flash), but TanStack Query quietly refetches the latest data in the background to keep it up to date.

**How I used it in this project:**

| Query Key | staleTime | Why |
|---|---|---|
| Global default | `60 000 ms (1 min)` | A reasonable balance — data is fresh for a minute before background sync kicks in. |
| `['me']` (current user session) | `Infinity` | The logged-in user profile does not change mid-session. Never needs a background refetch. |
| `['users']` (assignment dropdown) | `300 000 ms (5 min)` | Team members rarely join or leave within minutes. Reduces unnecessary API calls. |
| Hover prefetch on TaskCard | `30 000 ms (30 s)` | Prefetched task detail stays usable for 30 seconds without re-fetching. |

**Problem it solves:**
Without `staleTime`, TanStack Query would refetch data every time a component re-renders or the user switches tabs. This would create constant unnecessary network traffic. A user opening the Tasks page, clicking into a task detail, and pressing Back would trigger three separate network calls for the same data. With `staleTime: 60000`, the second and third navigations read instantly from cache — no loading state, no flicker, no wasted bandwidth.
