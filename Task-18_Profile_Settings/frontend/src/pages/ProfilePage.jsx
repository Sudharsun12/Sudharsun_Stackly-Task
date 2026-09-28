import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'

// ─── Toast notification (inline, no extra library) ────────────────────────────
function Toast({ message, type, onClose }) {
  if (!message) return null
  return (
    <div className={`profile-toast profile-toast-${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="toast-close">✕</button>
    </div>
  )
}

// ─── Section 1 — Profile Picture ──────────────────────────────────────────────
function AvatarSection({ user, updateUser }) {
  const [preview,    setPreview]    = useState(null)
  const [file,       setFile]       = useState(null)
  const [uploading,  setUploading]  = useState(false)
  const [toast,      setToast]      = useState({ msg: '', type: 'success' })
  const fileInputRef = useRef()

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Update AuthContext → Navbar reflects immediately
      updateUser({ avatar_url: res.data.avatar_url })
      setToast({ msg: '✅ Profile picture updated!', type: 'success' })
      setPreview(null)
      setFile(null)
      fileInputRef.current.value = ''
    } catch (err) {
      setToast({ msg: err.response?.data?.error || 'Upload failed', type: 'error' })
    } finally {
      setUploading(false)
    }
  }

  const avatarSrc = preview
    ? preview
    : user?.avatar_url
      ? `http://localhost:5000${user.avatar_url}`
      : null

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div className="profile-section">
      <h2 className="section-title">📸 Profile Picture</h2>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />

      <div className="avatar-area">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Profile" className="avatar-large" />
        ) : (
          <div className="avatar-large avatar-initials-lg">{initials}</div>
        )}

        <div className="avatar-actions">
          <button className="btn-secondary" onClick={() => fileInputRef.current.click()}>
            📂 Choose Photo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {file && (
            <>
              <p className="file-hint">Selected: <strong>{file.name}</strong></p>
              <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : '⬆️ Upload Photo'}
              </button>
            </>
          )}
        </div>
      </div>

      {user?.created_at && (
        <p className="member-since">
          🗓️ Member since{' '}
          {new Date(user.created_at).toLocaleDateString('en-IN', {
            month: 'long', year: 'numeric'
          })}
        </p>
      )}
    </div>
  )
}

// ─── Section 2 — Edit Profile ─────────────────────────────────────────────────
function EditProfileSection({ user, updateUser }) {
  const [name,      setName]      = useState(user?.name || '')
  const [email,     setEmail]     = useState(user?.email || '')
  const [saving,    setSaving]    = useState(false)
  const [emailErr,  setEmailErr]  = useState('')
  const [toast,     setToast]     = useState({ msg: '', type: 'success' })

  async function handleSave(e) {
    e.preventDefault()
    setEmailErr('')
    if (!name.trim() || !email.trim()) return

    setSaving(true)
    try {
      await api.put('/api/me', { name: name.trim(), email: email.trim() })
      // Update AuthContext → Navbar name updates instantly
      updateUser({ name: name.trim(), email: email.trim() })
      setToast({ msg: '✅ Profile updated successfully!', type: 'success' })
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.error || 'Update failed'
      if (status === 409) {
        setEmailErr(msg)  // inline error under email field
      } else {
        setToast({ msg, type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-section">
      <h2 className="section-title">✏️ Edit Profile</h2>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />

      <form onSubmit={handleSave} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
            required
          />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setEmailErr('') }}
            placeholder="your@email.com"
            required
          />
          {emailErr && <p className="field-error">⚠️ {emailErr}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  )
}

// ─── Section 3 — Change Password ──────────────────────────────────────────────
function ChangePasswordSection() {
  const [form,       setForm]       = useState({ current: '', newPass: '', confirm: '' })
  const [saving,     setSaving]     = useState(false)
  const [currentErr, setCurrentErr] = useState('')
  const [matchErr,   setMatchErr]   = useState('')
  const [toast,      setToast]      = useState({ msg: '', type: 'success' })

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'current') setCurrentErr('')
    if (name === 'newPass' || name === 'confirm') setMatchErr('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setCurrentErr('')
    setMatchErr('')

    // Frontend validation
    if (form.newPass !== form.confirm) {
      setMatchErr('New passwords do not match')
      return
    }
    if (form.newPass.length < 6) {
      setMatchErr('Password must be at least 6 characters')
      return
    }

    setSaving(true)
    try {
      await api.put('/api/me/password', {
        current_password:  form.current,
        new_password:      form.newPass,
        confirm_password:  form.confirm
      })
      setToast({ msg: '✅ Password changed successfully!', type: 'success' })
      setForm({ current: '', newPass: '', confirm: '' })
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.error || 'Password change failed'
      if (status === 401) {
        setCurrentErr(msg)  // inline under current password field
      } else {
        setToast({ msg, type: 'error' })
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-section">
      <h2 className="section-title">🔒 Change Password</h2>
      <Toast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '' })} />

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            name="current"
            value={form.current}
            onChange={handleChange}
            placeholder="Your current password"
            required
          />
          {currentErr && <p className="field-error">⚠️ {currentErr}</p>}
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPass"
            value={form.newPass}
            onChange={handleChange}
            placeholder="Min 6 characters"
            required
          />
          {/* Password strength indicator */}
          {form.newPass.length > 0 && (
            <div className="strength-bar">
              <div
                className={`strength-fill strength-${
                  form.newPass.length < 6 ? 'weak'
                  : form.newPass.length < 10 ? 'medium'
                  : 'strong'
                }`}
                style={{ width: `${Math.min((form.newPass.length / 12) * 100, 100)}%` }}
              />
              <span className="strength-label">
                {form.newPass.length < 6 ? 'Weak' : form.newPass.length < 10 ? 'Medium' : 'Strong'}
              </span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            placeholder="Repeat new password"
            required
          />
          {matchErr && <p className="field-error">⚠️ {matchErr}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Changing...' : '🔑 Change Password'}
        </button>
      </form>
    </div>
  )
}

// ─── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUser } = useAuth()

  if (!user) return <div className="page-loading">Loading profile...</div>

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>👤 My Profile & Settings</h1>
        <p>Manage your account details, profile picture and password.</p>
      </div>

      <div className="profile-grid">
        <AvatarSection      user={user} updateUser={updateUser} />
        <EditProfileSection user={user} updateUser={updateUser} />
        <ChangePasswordSection />
      </div>
    </div>
  )
}
