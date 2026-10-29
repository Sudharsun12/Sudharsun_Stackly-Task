# Learn from Scratch: Core Concepts of Task 22 (TanStack Query Full-Stack Taskboard)

**Author:** Sudharsun A · Software Engineer  
**Task:** Task 22 – Team Task Manager  
**Tech Stack:** React 18 + TypeScript + TanStack Query v5 + Flask (Python) + MySQL

---

## 1. The Big Picture: Why Does This Project Exist?

In modern web development, almost every application fetches data from an API and shows it on the screen. 

Before tools like **TanStack Query (React Query)**, developers used standard React tools: `useState` and `useEffect`.
Let’s see why that caused huge problems and how our project solves it.

---

## 2. The Core Problem: Client State vs. Server State

Understanding this difference is the single most important concept in modern frontend architecture.

### A. Client State (Local UI State)
- **What it is:** Data that **only exists inside the browser tab**. The backend server does not care about it.
- **Examples:**
  - Whether a modal or dropdown is open or closed (`isModalOpen`).
  - Dark mode vs. Light mode theme toggle (`theme = 'dark'`).
  - The current text being typed inside an input field (`searchQuery`).
- **How we handle it:** Standard React tools: `useState`, `useReducer`, or `ThemeContext`.

### B. Server State (Remote Database Data)
- **What it is:** Data that **lives on an external database (MySQL)** and is shared across multiple users.
- **Characteristics:**
  1. It is **asynchronous** (takes time to fetch over HTTP).
  2. It can be changed by other users at any moment without you knowing.
  3. The data inside your browser is just a **temporary snapshot** (cache), not the source of truth.
- **Examples:**
  - List of team tasks.
  - Task status (`todo`, `in_progress`, `done`).
  - Total workload, overdue count, completion rates.
- **How we handle it:** **TanStack Query v5**.

---

## 3. Why `useState` + `useEffect` Was a Nightmare

Before TanStack Query, writing a task fetch looked like this:

```typescript
// ❌ THE OLD WAY (Messy, prone to bugs)
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetch('/api/tasks')
      .then(res => res.json())
      .then(data => {
        if (isMounted) {
          setTasks(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  return <ul>{tasks.map(t => <li key={t.id}>{t.title}</li>)}</ul>;
}
```

### The 5 Critical Flaws of the Old Way:
1. **Endless Boilerplate:** You have to write 3 states (`tasks`, `loading`, `error`) for *every single API endpoint*.
2. **No Caching:** If a user clicks from "Dashboard" to "Tasks" and back to "Dashboard", the whole component unmounts, state is destroyed, and the user sees a blank loading spinner all over again.
3. **No Automatic Invalidation:** When you create a new task via `POST /api/tasks`, how does the Task List know to refresh? You have to manually pass setState down three levels or write convoluted triggers.
4. **Race Conditions:** If a user rapidly clicks filters (e.g., "Todo", then "Done", then "All"), network requests finish out of order. A slow "Todo" response can overwrite a fast "All" response.
5. **No Window Focus Sync:** If another teammate marks a task as "Done" on their laptop, your screen remains outdated until you manually refresh the entire browser page (`F5`).

---

## 4. How TanStack Query Solves Everything

With TanStack Query v5, that entire 30-line messy block becomes **3 lines**:

```typescript
// ✅ THE TANSTACK QUERY WAY (Clean, cached, synchronized)
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['tasks', status, priority],
  queryFn: () => fetchTasksApi({ status, priority }),
});
```

TanStack Query acts as an **intelligent cache layer** sitting between your React components and the Flask backend.

---

## 5. The 4 Golden Pillars We Implemented

### Pillar 1: The Query Key (`queryKey`) — The Identity Card
Every query has a unique key, like a primary key in a database.
In our project (`src/api/tasks.ts`):
```typescript
export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...taskKeys.lists(), filters] as const,
  detail: (id: number) => [...taskKeys.all, 'detail', id] as const,
  stats: () => [...taskKeys.all, 'stats'] as const,
};
```
- When `status` changes from `'todo'` to `'done'`, the key changes:
  - From `['tasks', 'list', { status: 'todo' }]`
  - To `['tasks', 'list', { status: 'done' }]`
- TanStack Query sees a new key and immediately fetches that data, keeping both caches saved in memory!

---

### Pillar 2: Stale-While-Revalidate (`staleTime` vs. `gcTime`)
This is the secret behind the super-fast UI.

1. **`staleTime` (Freshness Period):**
   - We configured `staleTime: 1000 * 60 * 2` (2 minutes).
   - When data is fetched, it is considered **fresh** for 2 minutes.
   - If the user switches pages or clicks back within 2 minutes, **zero network calls are made**. Data is rendered in **0 milliseconds**.
   - After 2 minutes, the data becomes **stale**. Stale does NOT mean deleted; it means *"next time the user focuses the tab or navigates here, show this old data immediately, but quietly fetch updated data in the background."*

2. **`gcTime` (Garbage Collection Time):**
   - We configured `gcTime: 1000 * 60 * 10` (10 minutes).
   - Even when a component unmounts and is no longer on the screen, its cached data stays in browser memory for 10 minutes before being cleaned up.

---

### Pillar 3: Mutations & Invalidation (`useMutation`)
Queries are for **reading** (`GET`). Mutations are for **writing** (`POST`, `PUT`, `DELETE`).

When a user adds a new task:
```typescript
// In src/hooks/useTaskMutations.ts
export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTaskApi,
    onSuccess: () => {
      // 🌟 MAGIC MOMENT: Tell TanStack Query that the old list is invalid
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.stats() });
    },
  });
};
```
**What happens behind the scenes:**
1. The user fills the form and clicks "Save".
2. `useMutation` sends `POST /api/tasks` to Flask.
3. Flask inserts the task into MySQL and returns `201 Created`.
4. `onSuccess` runs `queryClient.invalidateQueries`.
5. TanStack Query automatically refetches the task list and the dashboard stats.
6. The UI updates instantly without any manual state synchronization or page reload!

---

### Pillar 4: Hover Prefetching (`prefetchQuery`)
In `src/components/TaskCard.tsx`:
```typescript
const prefetch = () => {
  queryClient.prefetchQuery({
    queryKey: ['tasks', task.id],
    queryFn: () => fetchTask(task.id),
    staleTime: 1000 * 30, // 30s
  });
};

return (
  <li className="task-row" onMouseEnter={prefetch}>
    ...
  </li>
);
```
**How it feels to the user:**
- When the user hovers their mouse over a task, TanStack Query starts downloading the detail data **in the background**.
- By the time the user actually clicks the link (approx 200–400ms later), the data is already inside the browser's cache.
- The task detail screen opens **instantly with zero loading spinner**.

---

## 6. Full-Stack Data Flow Architecture

Here is how data travels across the entire stack:

```
[ User Browser ]
   │
   ├─► 1. React Component renders UI
   │      (useQuery / useMutation)
   │
   ├─► 2. TanStack Query Cache
   │      (Checks if fresh data exists in memory)
   │
   ├─► 3. Axios Client (`src/api/axios.ts`)
   │      (Attaches `Authorization: Bearer <JWT>` header)
   │
   ▼  [ HTTP Network / REST API ]
   │
   ├─► 4. Flask Backend (`backend/app.py` on port 5000)
   │      (Verifies JWT signature, extracts user role)
   │
   ├─► 5. MySQL Database (`127.0.0.1:3306` database: `task_manager`)
   │      (Executes SELECT / INSERT / UPDATE queries)
   │
   ▼
[ Response sent back up: MySQL -> Flask -> Axios -> TanStack Cache -> React UI ]
```

---

## 7. How to Answer Review Questions in Simple Words

### Q: "What is TanStack Query?"
> *"TanStack Query is an asynchronous state management and caching library for React. Instead of writing manual useEffect and useState hooks to fetch and store server data, TanStack Query manages caching, background revalidation, deduplication, and synchronization automatically."*

### Q: "What is the difference between isLoading and isFetching?"
> *"isLoading is only true during the very first load when there is NO data in the cache at all. isFetching is true whenever any network request is in flight, including background updates when re-focusing a tab."*

### Q: "How does our app ensure data stays fresh when another team member updates a task?"
> *"We use TanStack Query's refetchOnWindowFocus feature. As soon as the user switches back to our tab, TanStack Query silently checks with the server in the background and updates the UI without disturbing the user."*

### Q: "Why did you separate Client State and Server State?"
> *"Client state like theme toggles and input typing is synchronous and local to the browser. Server state is asynchronous, shared, and can become stale. Mixing server state into local useState creates bugs, duplicated data, and race conditions. TanStack Query solves this by treating server state as a synchronized cache."*
