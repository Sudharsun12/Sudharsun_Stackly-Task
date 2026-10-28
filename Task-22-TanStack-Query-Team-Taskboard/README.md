# Task 22 — Team Task Manager (TanStack Query)

A full-stack enterprise Team Task Manager built with **React + TypeScript** frontend, powered by **TanStack Query (React Query v5)** for server state management, and a **Python Flask + MySQL** REST backend with JWT authentication.

---

## 📁 Project Architecture & Directory Structure

```text
team-taskboard-rq/
├── backend/
│   ├── app.py              # Flask app with JWT auth, CRUD endpoints & stats aggregation
│   ├── requirements.txt    # Python dependencies
│   └── schema.sql          # MySQL database schema (users & tasks tables)
├── frontend/
│   ├── index.html          # HTML entry point with Manrope typography
│   ├── package.json        # Dependencies (React 18, TanStack Query v5, Axios, React Router 6)
│   ├── tsconfig.json       # TypeScript configuration
│   ├── vite.config.ts      # Vite configuration
│   └── src/
│       ├── main.tsx        # QueryClientProvider, staleTime config & ReactQueryDevtools
│       ├── App.tsx         # Routing, AuthProvider, Layout with custom Header & Footer
│       ├── index.css       # Complete modern design system & animations
│       ├── api/
│       │   ├── axios.ts    # Axios instance with JWT interceptors
│       │   └── tasks.ts    # Pure async API fetchers (separated from components)
│       ├── context/
│       │   ├── AuthContext.tsx   # Cached session state with useQuery(['me'])
│       │   └── ToastContext.tsx  # Global feedback notifications
│       ├── hooks/
│       │   ├── useTasks.ts         # useQuery hooks (tasks, task detail, stats, users)
│       │   ├── useTaskMutations.ts # useMutation hooks (create, update, delete + invalidateQueries)
│       │   └── useDebounce.ts      # Search input debounce hook
│       ├── components/
│       │   ├── Navbar.tsx        # Branded header with role badges & user pill
│       │   ├── Footer.tsx        # Modern footer with stack tags & credits
│       │   ├── StatsPanel.tsx    # Live stats dashboard with refetchInterval: 10s
│       │   ├── TaskCard.tsx      # Task item with hover prefetching
│       │   ├── TaskForm.tsx      # Modal form for task creation & editing
│       │   ├── FilterBar.tsx     # Filter by status, priority, assignee & search
│       │   ├── Pagination.tsx    # Paginated page control
│       │   ├── Badges.tsx        # Semantic status & priority badges
│       │   ├── Skeleton.tsx      # Shimmer loading skeleton
│       │   ├── ErrorBoundary.tsx # React error boundary fallback
│       │   └── ProtectedRoute.tsx # Route guard for authenticated users
│       ├── pages/
│       │   ├── LoginPage.tsx     # Login & registration
│       │   ├── Dashboard.tsx     # Parallel queries (stats + recent tasks)
│       │   ├── TasksPage.tsx     # Paginated & filtered task management
│       │   └── TaskDetail.tsx    # Single task detail with dependent query
│       └── types/
│           └── index.ts          # Strict TypeScript interfaces (no `any`)
└── README.md
```

---

## 🚀 Setup & Execution Guide

### 1. Database (MySQL)
Make sure your MySQL server is running, then run:
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend (Flask)
```bash
cd backend
python -m venv venv
venv\Scripts\activate            # On Windows PowerShell: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py                    # Runs on http://localhost:5000
```
> **Environment Variables (Optional):**
> - `DB_HOST`: default `localhost`
> - `DB_USER`: default `root`
> - `DB_PASSWORD`: default `""` (Set via `$env:DB_PASSWORD="your_password"`)
> - `DB_NAME`: default `task_manager`
> - `JWT_SECRET_KEY`: default dev secret key

### 3. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev                      # Runs on http://localhost:5173
```

### 4. Verification Workflow
1. Navigate to `http://localhost:5173/login`.
2. Click **"New here? Create an account"** and register. The very first user automatically receives the **`admin`** role.
3. Once logged in, the **Dashboard** opens showing live KPI counters and recent tasks.
4. Click the **React Query Devtools flower icon** (bottom-right) to observe cache states (`['stats']`, `['tasks', ...]`, `['me']`).

---

## 💡 Technical Write-up (Task 22 Q&A)

### 1. What is the difference between server state and client state? Give one example of each from your application.
- **Server State**: Data that is persisted on an external server/database, fetched asynchronously, outside the browser's direct control, and potentially modified by multiple users or background jobs.
  - *Example in this app*: The task list (`/api/tasks`) and dashboard summary numbers (`/api/stats`). They originate in the MySQL database, require network calls to fetch, and can become stale over time. Managed seamlessly by **TanStack Query**.
- **Client State**: Transient, synchronous UI data that exists strictly in the browser memory for local UI flow. It does not exist in the database and resets on refresh.
  - *Example in this app*: The search input string before debouncing (`searchInput`), active modal visibility boolean (`formOpen`), or the selected filter dropdown values before triggering queries. Managed via standard React `useState`.

### 2. What is a query key in TanStack Query? Why does the key `['tasks', { status: 'todo' }]` cache separately from `['tasks']`?
- **Query Key**: A unique serializable array (or tuple) that TanStack Query uses as a hash key to store, index, and retrieve data from its in-memory cache.
- **Why they cache separately**: TanStack Query deterministically serializes the array items. `['tasks', { status: 'todo' }]` and `['tasks']` produce different cache hashes. This ensures that filtering by `todo` stores its own distinct result list without overwriting the unfiltered tasks query or causing unwanted layout thrashing. When the user toggles between filters, each cached view is served instantly.

### 3. What does `invalidateQueries` do after a mutation? What would happen if you forgot to call it?
- **What it does**: When `queryClient.invalidateQueries({ queryKey: ['tasks'] })` is executed, TanStack Query marks every active or inactive query whose key matches or starts with `['tasks']` as **stale**. If a component currently rendering that data is mounted on screen, TanStack Query immediately triggers an automatic background refetch to synchronize the UI with the database.
- **What would happen if you forgot to call it**: If omitted after creating, updating, or deleting a task, the local cache would remain marked as fresh (until `staleTime` expired). The user would see outdated lists unless they manually refreshed the browser page or triggered another navigation event.

### 4. What is `staleTime` and how did you use it in this project? What problem does it solve?
- **What is staleTime**: The duration (in milliseconds) that fetched data is considered fresh. During this time window, components mounting or re-rendering will read directly from the memory cache without executing duplicate HTTP requests to the backend.
- **How it was used in this project**:
  - Global default: `staleTime: 1000 * 60` (1 minute) in `main.tsx`.
  - Current user query (`['me']`): `staleTime: Infinity` because user role/profile doesn't change during the session.
  - Users list dropdown (`['users']`): `staleTime: 1000 * 60 * 5` (5 minutes) because team members rarely change.
  - Hover prefetching on `TaskCard`: `staleTime: 1000 * 30` (30 seconds) to warm up task detail page transitions.
- **Problem it solves**: Prevents aggressive, wasteful API requests every time a user changes focus, tabs back to the app, or navigates back and forth between routes.

---

## 🎥 Screen Recording Checklist
When recording your demonstration for submission:
1. **Dashboard Loading**: Show stats loading with Skeleton placeholders, then rendering live counters.
2. **React Query Devtools**: Click the TanStack Query logo in the bottom corner to show queries in `fresh`, `stale`, and `fetching` states.
3. **Auto-refetching (10s interval)**: Keep Devtools open and observe `['stats']` flash to fetching state every 10 seconds automatically.
4. **Task Creation**: Add a task via the modal — observe that `['tasks']` and `['stats']` are invalidated, the task list auto-updates immediately without manual page refresh, and toast confirms.
5. **Task Deletion / Update**: Delete or update status and show instant auto-synchronization across views.
