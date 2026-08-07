import NoteCard from './NoteCard'

function NoteList({ notes, onDelete, onEdit, onTogglePin, totalNotes }) {

  if (totalNotes === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📝</div>
        <h3 className="empty-title">No notes yet.</h3>
        <p className="empty-text">Add your first note above.</p>
      </div>
    )
  }

  if (notes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3 className="empty-title">No matching notes.</h3>
        <p className="empty-text">Try a different search term or category.</p>
      </div>
    )
  }

  const pinned   = notes.filter(n => n.pinned)
  const unpinned = notes.filter(n => !n.pinned)

  return (
    <div className="note-list-container">
      {pinned.length > 0 && (
        <section className="notes-section">
          <div className="section-label">📌 Pinned</div>
          <div className="notes-grid">
            {pinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={onDelete} onEdit={onEdit} onTogglePin={onTogglePin} />
            ))}
          </div>
        </section>
      )}
      {unpinned.length > 0 && (
        <section className="notes-section">
          {pinned.length > 0 && <div className="section-label">📄 Other Notes</div>}
          <div className="notes-grid">
            {unpinned.map(note => (
              <NoteCard key={note.id} note={note} onDelete={onDelete} onEdit={onEdit} onTogglePin={onTogglePin} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default NoteList
