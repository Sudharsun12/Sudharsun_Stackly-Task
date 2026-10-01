import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'
import api from '../api'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const { user } = useAuth()
  const [socket,        setSocket]        = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)

  // ── Load persisted notifications from DB on login ──────────────────────────
  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    api.get('/api/notifications')
      .then(res => {
        setNotifications(res.data)
        setUnreadCount(res.data.filter(n => !n.is_read).length)
      })
      .catch(() => {}) // silently ignore if not logged in
  }, [user])

  // ── Open WebSocket connection when user logs in ────────────────────────────
  useEffect(() => {
    if (!user) {
      // Disconnect any existing socket when user logs out
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const s = io('http://localhost:5000', {
      withCredentials: false,
      transports: ['polling']   // threading mode doesn't support ws:// — polling works perfectly
    })
    setSocket(s)

    // Join personal room + admin room (if admin)
    s.on('connect', () => {
      console.log('🔌 Socket connected:', s.id)
      s.emit('join', { user_id: user.id, role: user.role })
    })

    // Listen for real-time notifications from server
    s.on('new_notification', (data) => {
      console.log('🔔 New notification:', data)

      setNotifications(prev => [
        {
          id:         Date.now(), // temp id until page refresh re-fetches from DB
          message:    data.message,
          type:       data.type || 'info',
          is_read:    false,
          created_at: new Date().toISOString()
        },
        ...prev
      ])
      setUnreadCount(c => c + 1)

      // ── Bonus: Browser push notification when tab is not active ─────────────
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        const icons = { order: '🛒', alert: '⚠️', info: 'ℹ️' }
        new Notification('ShopSphere', {
          body: data.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag:  `notif-${Date.now()}`
        })
      }

      // ── Bonus: Sound alert ───────────────────────────────────────────────────
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.frequency.setValueAtTime(880, ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3)
        gain.gain.setValueAtTime(0.3, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
        osc.start(ctx.currentTime)
        osc.stop(ctx.currentTime + 0.4)
      } catch (_) {
        // Audio not supported — fail silently
      }
    })

    s.on('disconnect', () => console.log('🔌 Socket disconnected'))

    // Request browser push permission when user logs in (bonus)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => s.disconnect()
  }, [user?.id]) // reconnect only when user ID changes (not on every render)

  // ── Mark one notification as read ─────────────────────────────────────────
  function markAsRead(id) {
    // Optimistic UI update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    )
    setUnreadCount(c => Math.max(0, c - 1))

    // Persist to DB
    api.put(`/api/notifications/${id}/read`).catch(() => {})
  }

  // ── Mark all as read ───────────────────────────────────────────────────────
  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
    api.put('/api/notifications/read-all').catch(() => {})
  }

  // ── Delete a notification ──────────────────────────────────────────────────
  function deleteNotification(id) {
    const target = notifications.find(n => n.id === id)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (target && !target.is_read) setUnreadCount(c => Math.max(0, c - 1))
    api.delete(`/api/notifications/${id}`).catch(() => {})
  }

  return (
    <SocketContext.Provider value={{
      socket,
      notifications,
      setNotifications,
      unreadCount,
      setUnreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
