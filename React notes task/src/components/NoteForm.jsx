import { useState, useEffect } from 'react'

const CATEGORIES = ['Work', 'Personal', 'Study', 'Other']

function NoteForm({ onSubmit, editingNote, onCancelEdit }) {
  // ── Local state for form fields ───────────────────────────────────────────
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('Personal')

  const MAX_CHARS = 500

  // ── When editing starts, pre-fill the form ─────────────────────────────────
  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title)
      setContent(editingNote.content)
      setCategory(editingNote.category)
    } else {
      setTitle('')
      setContent('')
      setCategory('Personal')
    }
  }, [editingNote])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    onSubmit({ title: title.trim(), content: content.trim(), category })

    // Reset form fields after submit (only when adding, not editing)
    if (!editingNote) {
      setTitle('')
      setContent('')
      setCategory('Personal')
    }
  }

  const isEditing = !!editingNote
  const charsLeft = MAX_CHARS - content.length
  const charsPercent = (content.length / MAX_CHARS) * 100

  return (
    <div className={`note-form-card ${isEditing ? 'editing-mode' : ''}`}>
      {isEditing && (
        <div className="editing-banner">
          <span>✏️ Editing: <strong>{editingNote.title}</strong></span>
          <button className="cancel-edit-btn" onClick={onCancelEdit}>✕ Cancel</button>
        </div>
      )}

      <h2 className="form-title">{isEditing ? 'Update Note' : 'Add New Note'}</h2>

      <form onSubmit={handleSubmit} className="note-form">
        {/* Title */}
        <div className="form-group">
          <label htmlFor="note-title" className="form-label">Title</label>
          <input
            id="note-title"
            type="text"
            className="form-input"
            placeholder="Give your note a title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        {/* Content */}
        <div className="form-group">
          <label htmlFor="note-content" className="form-label">
            Content
            <span className={`char-counter ${charsLeft < 50 ? 'warning' : ''} ${charsLeft < 10 ? 'danger' : ''}`}>
              {content.length}/{MAX_CHARS}
            </span>
          </label>
          <textarea
            id="note-content"
            className="form-textarea"
            placeholder="Write your note here…"
            value={content}
            onChange={e => setContent(e.target.value.slice(0, MAX_CHARS))}
            rows={4}
            required
          />
          {/* Character progress bar */}
          <div className="char-bar">
            <div
              className={`char-bar-fill ${charsPercent > 90 ? 'danger' : charsPercent > 70 ? 'warning' : ''}`}
              style={{ width: `${charsPercent}%` }}
            />
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="note-category" className="form-label">Category</label>
          <div className="category-chips">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`category-chip cat-${cat.toLowerCase()} ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`submit-btn ${isEditing ? 'update-btn' : ''}`}
          disabled={!title.trim() || !content.trim()}
        >
          {isEditing ? '✔ Update Note' : '+ Add Note'}
        </button>
      </form>
    </div>
  )
}

export default NoteForm
