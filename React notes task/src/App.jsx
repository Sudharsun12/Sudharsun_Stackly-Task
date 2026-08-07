import { useState, useEffect } from 'react'
import NoteForm from './components/NoteForm'
import SearchBar from './components/SearchBar'
import NoteList from './components/NoteList'
import './App.css'

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Write it. Shoot it. Publish it. Crave it.", author: "Quentin Tarantino" },
  { text: "A small note today is a great idea tomorrow.", author: "Anonymous" },
  { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
  { text: "Ideas are the beginning points of all fortunes.", author: "Napoleon Hill" },
  { text: "One day or day one — you decide.", author: "Paulo Coelho" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "The best time to start was yesterday. The next best time is now.", author: "Proverb" },
  { text: "Capture everything. Regret nothing.", author: "NoteVault" },
  { text: "Knowledge is of no value unless you put it into practice.", author: "Anton Chekhov" },
]

function App() {
  // ── Notes: lazy-init from localStorage (fixes refresh bug) ───────────────
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem('notes')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [search, setSearch]           = useState('')
  const [category, setCategory]       = useState('All')
  const [sortOrder, setSortOrder]     = useState('newest')
  const [editingNote, setEditingNote] = useState(null)
  const [quoteIndex, setQuoteIndex]   = useState(() => Math.floor(Math.random() * QUOTES.length))

  // ── Save notes to localStorage whenever notes change ─────────────────────
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes])

  // ── Rotate quote every 8 seconds ─────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 8000)
    return () => clearInterval(timer)
  }, [])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAddNote = (noteData) => {
    if (editingNote) {
      setNotes(prev => prev.map(n =>
        n.id === editingNote.id ? { ...n, ...noteData, updatedAt: Date.now() } : n
      ))
      setEditingNote(null)
    } else {
      setNotes(prev => [{
        id: Date.now(), ...noteData,
        pinned: false, createdAt: Date.now(), updatedAt: Date.now(),
      }, ...prev])
    }
  }

  const handleDelete = (id) => {
    setNotes(prev => prev.filter(n => n.id !== id))
    if (editingNote?.id === id) setEditingNote(null)
  }

  const handleEdit = (note) => {
    setEditingNote(note)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => setEditingNote(null)

  const handleTogglePin = (id) => {
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n))
  }

  // ── Filter & Sort ─────────────────────────────────────────────────────────
  const filtered = notes
    .filter(n =>
      n.title.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'All' || n.category === category)
    )
    .sort((a, b) => {
      if (b.pinned !== a.pinned) return b.pinned - a.pinned
      return sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    })

  const pinnedCount = notes.filter(n => n.pinned).length

  return (
    <div className="app">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">📝</span>
          </div>
          <div className="header-center">
            <h1 className="app-title">NoteVault</h1>
            <p className="app-subtitle">Your personal note-taking space</p>
          </div>
          <div className="header-stats">
            <div className="stat-badge">
              <span className="stat-num">{notes.length}</span>
              <span className="stat-label">Total</span>
            </div>
            {pinnedCount > 0 && (
              <div className="stat-badge pinned-badge">
                <span className="stat-num">{pinnedCount}</span>
                <span className="stat-label">📌 Pinned</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">

        {/* ── Note Form ───────────────────────────────────────────────── */}
        <NoteForm
          onSubmit={handleAddNote}
          editingNote={editingNote}
          onCancelEdit={handleCancelEdit}
        />

        {/* ── Live Count ──────────────────────────────────────────────── */}
        <div className="count-bar">
          <p className="note-count">
            {notes.length === 0
              ? 'No notes yet — add your first one above!'
              : `You have ${notes.length} note${notes.length !== 1 ? 's' : ''}`}
            {filtered.length !== notes.length && notes.length > 0 &&
              ` · Showing ${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* ── Rotating Quote Banner ───────────────────────────────────── */}
        <div className="quote-banner" key={quoteIndex}>
          <span className="quote-mark">&ldquo;</span>
          <div className="quote-body">
            <p className="quote-text">{QUOTES[quoteIndex].text}</p>
            <span className="quote-author">— {QUOTES[quoteIndex].author}</span>
          </div>
          <span className="quote-mark">&rdquo;</span>
        </div>

        {/* ── Search & Filter Bar ─────────────────────────────────────── */}
        <SearchBar
          search={search}       setSearch={setSearch}
          category={category}   setCategory={setCategory}
          sortOrder={sortOrder} setSortOrder={setSortOrder}
        />

        {/* ── Notes List ──────────────────────────────────────────────── */}
        <NoteList
          notes={filtered}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onTogglePin={handleTogglePin}
          totalNotes={notes.length}
        />

      </main>

      <footer className="app-footer">
        <p>NoteVault · Task 9 &nbsp;|&nbsp; Developed by <strong>A. Sudharsun</strong> &nbsp;|&nbsp; Built with React &amp; ❤️</p>
      </footer>
    </div>
  )
}

export default App
