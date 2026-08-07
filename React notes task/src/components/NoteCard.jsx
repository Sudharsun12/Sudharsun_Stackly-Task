import { useState } from 'react'

const CATEGORY_META = {
  Work:     { emoji: '💼', color: 'cat-work' },
  Personal: { emoji: '🌸', color: 'cat-personal' },
  Study:    { emoji: '📚', color: 'cat-study' },
  Other:    { emoji: '✨', color: 'cat-other' },
}

function NoteCard({ note, onDelete, onEdit, onTogglePin }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = CATEGORY_META[note.category] || CATEGORY_META.Other

  const formatDate = (ts) =>
    new Date(ts).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })

  const handleDeleteClick = () => {
    if (confirmDelete) {
      onDelete(note.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={`note-card ${meta.color} ${note.pinned ? 'is-pinned' : ''}`}>
      {note.pinned && <div className="pin-ribbon">📌</div>}

      <div className="card-header">
        <span className={`category-badge ${meta.color}`}>
          {meta.emoji} {note.category}
        </span>
        <button
          className={`pin-btn ${note.pinned ? 'pinned' : ''}`}
          onClick={() => onTogglePin(note.id)}
          title={note.pinned ? 'Unpin note' : 'Pin note'}
          aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
        >
          {note.pinned ? '📌' : '📍'}
        </button>
      </div>

      <h3 className="card-title">{note.title}</h3>
      <p className="card-content">{note.content}</p>

      <div className="card-date">
        🕐 {formatDate(note.updatedAt || note.createdAt)}
        {note.updatedAt !== note.createdAt && ' (edited)'}
      </div>

      <div className="card-actions">
        <button
          className="action-btn edit-btn"
          onClick={() => onEdit(note)}
          aria-label="Edit note"
        >
          ✏️ Edit
        </button>
        <button
          className={`action-btn delete-btn ${confirmDelete ? 'confirm' : ''}`}
          onClick={handleDeleteClick}
          aria-label={confirmDelete ? 'Confirm delete' : 'Delete note'}
        >
          {confirmDelete ? '⚠️ Confirm?' : '🗑️ Delete'}
        </button>
      </div>
    </div>
  )
}

export default NoteCard
