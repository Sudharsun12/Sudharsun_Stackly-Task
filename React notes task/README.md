# NoteVault — Personal Notes App 📝
### Task 9 | Full-Stack Development Programme | React

---

## 🌟 Overview

NoteVault is a fully functional personal notes application built from scratch using **React 18**. This project marks the transition from plain HTML/CSS/JavaScript to component-based, reactive UI development.

Instead of manually updating the DOM with `innerHTML` or `appendChild`, this app uses React's **state system** — the UI updates automatically whenever data changes. Every feature from adding notes to filtering and pinning was built using React's `useState` and `useEffect` hooks, with no backend — all data persists locally in the browser via `localStorage`.

This README documents the project structure, how it works, how to run it, and the key React concepts applied throughout.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI library |
| **JavaScript (ES6+)** | App logic — hooks, array methods, event handlers |
| **Vite** | Lightning-fast build tool and dev server |
| **Vanilla CSS** | Styling — glassmorphism dark theme |
| **localStorage** | Client-side data persistence (no backend needed) |
| **Google Fonts (Inter)** | Premium typography |
| **Git + GitHub** | Version control and submission |

---

## ✨ Features

- 📝 **Create Notes** — Add a title, content body, and assign a category
- ✏️ **Edit Notes** — Click Edit to pre-fill the form and update any note
- 🗑️ **Delete Notes** — Two-click confirmation prevents accidental deletions
- 📌 **Pin Notes** — Pinned notes always appear at the top of the list
- 🔍 **Live Search** — Filter notes by title in real-time as you type
- 📂 **Category Filter** — Filter by Work, Personal, Study, or Other
- 🔃 **Sort** — Toggle between Newest First and Oldest First
- 💾 **Persistence** — Notes survive page refresh (stored in localStorage)
- 📊 **Live Count** — Header badge updates in real-time as notes are added/removed
- 💬 **Rotating Quotes** — Inspirational quotes rotate every 8 seconds with a fade animation
- 📊 **Character Counter** — Live counter with colour-coded bar warns as you approach the limit
- 📱 **Responsive Design** — Fully usable on mobile and desktop

---

## 📁 Project Structure

```
React notes task/
├── index.html                  # HTML entry point — loads the React app
├── package.json                # Project dependencies and npm scripts
├── vite.config.js              # Vite build configuration
└── src/
    ├── main.jsx                # ReactDOM.createRoot — mounts App into #root
    ├── App.jsx                 # Root component — owns ALL shared state
    ├── App.css                 # Design system — variables, layout, components
    └── components/
        ├── NoteForm.jsx        # Controlled form for adding and editing notes
        ├── NoteList.jsx        # Renders pinned + unpinned note sections
        ├── NoteCard.jsx        # Single note card with edit/delete/pin buttons
        └── SearchBar.jsx       # Search input, category chips, and sort selector
```

---

## 🧩 Component Architecture & Data Flow

React uses **unidirectional data flow** — data flows top-down from parent to child via props. Only `App.jsx` owns and manages the notes state; child components receive data and call parent-provided functions to request changes.

```
App.jsx  (owns state: notes, search, category, sortOrder, editingNote, quoteIndex)
 │
 ├── <NoteForm>
 │     Props received:  editingNote, onSubmit, onCancelEdit
 │     Responsibility:  Controlled input form. Calls onSubmit with new/updated data.
 │
 ├── <SearchBar>
 │     Props received:  search, setSearch, category, setCategory, sortOrder, setSortOrder
 │     Responsibility:  Search input + filter chips + sort dropdown.
 │
 └── <NoteList>
       Props received:  notes (filtered), onDelete, onEdit, onTogglePin, totalNotes
       Responsibility:  Splits notes into pinned/unpinned, renders NoteCard for each.
         │
         └── <NoteCard> (one per note)
               Props received:  note, onDelete, onEdit, onTogglePin
               Responsibility:  Displays note data. Calls handlers on button clicks.
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **npm** (comes with Node.js)

### 1. Navigate to the project folder
```bash
cd "React notes task"
```

### 2. Install dependencies
```bash
npm install
```
> This installs React, ReactDOM, Vite, and other packages listed in `package.json`.
> The `node_modules` folder (~200MB) is NOT included in this repository (excluded via `.gitignore`).

### 3. Start the development server
```bash
npm run dev
```
Open your browser at → **http://localhost:5173**

### 4. Build for production (optional)
```bash
npm run build
```

---

## 🔑 React Concepts Applied

### `useState`
Used to store and update: the notes array, search text, active category, sort order, which note is being edited, and the current quote index.

```jsx
const [notes, setNotes] = useState(() => {
  const saved = localStorage.getItem('notes')
  return saved ? JSON.parse(saved) : []
})
```
The **lazy initializer** (arrow function) reads from localStorage before the first render, preventing the save effect from overwriting stored data with an empty array.

### `useEffect`
Used for two side effects:

```jsx
// 1. Save notes to localStorage whenever the notes array changes
useEffect(() => {
  localStorage.setItem('notes', JSON.stringify(notes))
}, [notes])

// 2. Rotate the quote every 8 seconds (runs once on mount)
useEffect(() => {
  const timer = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 8000)
  return () => clearInterval(timer)
}, [])
```

### Controlled Inputs
All form inputs in `NoteForm.jsx` are **controlled** — their value is tied to state and updated via `onChange`, giving React full control over the form data.

### Conditional Rendering
```jsx
{editingNote && <div className="editing-banner">Editing: {editingNote.title}</div>}
{notes.length === 0 && <div className="empty-state">No notes yet.</div>}
```

### Array Methods for Derived State
```jsx
const filtered = notes
  .filter(n => n.title.toLowerCase().includes(search.toLowerCase()))
  .sort((a, b) => b.pinned - a.pinned || b.createdAt - a.createdAt)
```
The actual `notes` array is never mutated — a new filtered + sorted array is computed on every render.

---

## 🐛 Bug Fixed During Development

**Problem:** After refreshing the browser, all notes disappeared.

**Root cause:** Both `useEffect` hooks (load from localStorage, save to localStorage) ran after the first render. The save effect ran with an empty `notes = []` array BEFORE the load effect could restore the saved notes — wiping all data.

**Fix:** Replaced the load `useEffect` with a lazy initializer in `useState`:
```jsx
// ❌ Before — race condition
const [notes, setNotes] = useState([])
useEffect(() => {
  const saved = localStorage.getItem('notes')
  if (saved) setNotes(JSON.parse(saved))
}, [])

// ✅ After — reads localStorage before first render
const [notes, setNotes] = useState(() => {
  const saved = localStorage.getItem('notes')
  return saved ? JSON.parse(saved) : []
})
```

---

## 👨‍💻 Developer

**A. Sudharsun**
Task 9 — Introduction to React | Full-Stack Development Programme

Built with React ⚛️ and ❤️

---

*No external UI libraries were used. All components and styles were written from scratch.*
