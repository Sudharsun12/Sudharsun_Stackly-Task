# Task 22 — Implementation Notes

**Name:** Sudharsun | **Task:** 22 · TanStack Query Team Task Manager

---

## How the Application Was Built

### Phase 1 — Backend (Flask + MySQL)

The backend was built first following the discipline established over 21 tasks: build and test every endpoint in isolation before opening the frontend.

**Database schema** (`backend/schema.sql`):
Two tables — `users` (id, name, email, password hash, role, created_at) and `tasks` (id, title, description, status, priority, assigned_to FK, created_by FK, due_date, timestamps). Role is an ENUM with `admin` and `member`. Status and priority use ENUMs for data integrity.

**Flask app** (`backend/app.py`):
- JWT authentication using `flask-jwt-extended`. Access tokens are short-lived and sent as Bearer tokens in every protected request.
- An in-memory revoked token set handles logout invalidation (appropriate for a learning project).
- A shared `run()` helper wraps every SQL operation with a connection, cursor, and commit/rollback cycle to avoid repetitive boilerplate.
- The `GET /api/stats` endpoint aggregates totals, per-status counts, overdue count, and completed-this-week count in a single SQL query using `SUM(CASE WHEN ...)` expressions.
- `GET /api/tasks` supports query-string filters (`status`, `priority`, `assigned_to`, `search`) and returns paginated results with `total`, `page`, `pages`, and `items`.

**Testing approach:** All endpoints were manually tested in Postman before the frontend was started. A registration creates the first admin automatically (checked via `SELECT COUNT(*) FROM users`).

---

### Phase 2 — Frontend Architecture

The frontend was deliberately structured in layers so that each layer has a single responsibility:

```
src/api/        →  Pure async fetch functions (no React, no state)
src/hooks/      →  TanStack Query wrappers (useQuery, useMutation)
src/context/    →  Global React context (Auth + Toast)
src/components/ →  Presentational UI components (no direct API calls)
src/pages/      →  Route-level pages that compose components and hooks
src/types/      →  TypeScript interfaces shared across all layers
```

**Why separate `api/` from `hooks/`:**
The fetch functions in `api/tasks.ts` are plain async functions that return typed promises. They can be called from TanStack Query, from a loader, or in a test without importing any React APIs. If the API URL or request format changes, it is fixed in one place.

---

### Phase 3 — TanStack Query Integration

**`main.tsx`** — `QueryClient` is created once with global defaults (`staleTime: 60s`, `retry: 1`) and provided to the entire app via `QueryClientProvider`. `ReactQueryDevtools` is mounted alongside the app so the cache can be inspected in the browser during development.

**`hooks/useTasks.ts`** — Four query hooks:
1. `useTasks(filters)` — paginated list with `keepPreviousData` for smooth pagination.
2. `useTask(id)` — single task detail with `enabled: id > 0` guard.
3. `useStats()` — dashboard KPIs with `refetchInterval: 10000` for live polling.
4. `useUsers(enabled)` — assignment dropdown with `staleTime: 5min` and a boolean `enabled` flag for the dependent-query pattern (admin-only).

**`hooks/useTaskMutations.ts`** — Three mutation hooks (create, update, delete). All three share a `useRefreshAfterWrite()` helper that calls `invalidateQueries` on both `['tasks']` and `['stats']` simultaneously after any write, ensuring both the list and the dashboard counters stay in sync.

**Bonus implementations:**
- **Hover prefetching** on `TaskCard` — `queryClient.prefetchQuery` fires on `onMouseEnter` so the task detail page loads instantly.
- **`keepPreviousData`** on `useTasks` — prevents pagination from blanking the screen between pages.
- **Dependent query** in `TaskDetail` — `useUsers` only fires when the task is loaded and the current user is an admin.

---

### Phase 4 — UI: Custom Header and Footer

**Navbar (`Navbar.tsx`):**
- A quote strip spans the full width at the top of the navbar, centred, with a subtle gradient background.
- The main nav row uses a CSS grid with three columns (`1fr auto 1fr`) so the nav links are mathematically centred between the brand (left) and the user pill + logout (right).
- The user pill shows an initial avatar, the user's name, and their role badge.

**Footer (`Footer.tsx`):**
- A quote strip at the top of the footer, centred, matching the navbar style.
- The main footer row is a CSS grid with three columns — brand identity (left), tech stack badges centred in the middle, credits (right).
- A bottom bar shows the EDABIP task progress note.
