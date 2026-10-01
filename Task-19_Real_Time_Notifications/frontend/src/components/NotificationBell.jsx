import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'

// ── Relative time helper ─────────────────────────────────────────────────────
function timeAgo(dateStr) {
  const now  = new Date()
  const then = new Date(dateStr)
  const diff = Math.floor((now - then) / 1000) // seconds

  if (diff < 60)   return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400)return `${Math.floor(diff / 3600)} hr ago`
  return `${Math.floor(diff / 86400)} day ago`
}

// ── Type icon ────────────────────────────────────────────────────────────────
function typeIcon(type) {
  if (type === 'order') return '🛒'
  if (type === 'alert') return '⚠️'
  return 'ℹ️'
}

export default function NotificationBell() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useSocket()

  const [open, setOpen] = useState(false)
  const ref             = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const displayed = notifications.slice(0, 10)

  return (
    <div className="notif-bell-wrapper" ref={ref}>
      {/* ── Bell button ── */}
      <button
        className="notif-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={`Notifications (${unreadCount} unread)`}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div className="notif-dropdown">
          {/* Header */}
          <div className="notif-header">
            <span className="notif-title">🔔 Notifications</span>
            {unreadCount > 0 && (
              <button
                className="notif-mark-all"
                onClick={() => { markAllAsRead(); }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="notif-list">
            {displayed.length === 0 ? (
              <div className="notif-empty">
                <span>🎉</span>
                <p>You're all caught up!</p>
                <small>No notifications yet</small>
              </div>
            ) : (
              displayed.map(n => (
                <div
                  key={n.id}
                  className={`notif-item ${n.is_read ? 'notif-read' : 'notif-unread'}`}
                  onClick={() => {
                    if (!n.is_read) markAsRead(n.id)
                  }}
                >
                  <div className="notif-item-left">
                    <span className="notif-icon">{typeIcon(n.type)}</span>
                    <div className="notif-content">
                      <p className="notif-message">{n.message}</p>
                      <span className="notif-time">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  <div className="notif-item-right">
                    {!n.is_read && <span className="notif-dot" title="Unread" />}
                    <button
                      className="notif-delete-btn"
                      title="Delete"
                      onClick={e => {
                        e.stopPropagation()
                        deleteNotification(n.id)
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="notif-footer">
              +{notifications.length - 10} more notifications
            </div>
          )}
        </div>
      )}
    </div>
  )
}
