import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api'
import { useForm }  from '../hooks/useForm'
import { useToast } from '../hooks/useToast'

// ─── Toast Renderer — renders all active toasts from useToast ─────────────────
function ToastContainer({ toasts, dismissToast }) {
  if (!toasts.length) return null
  return (
    <div style={{ position: 'fixed', top: '80px', right: '1.5rem', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(t => (
        <div key={t.id} className={`profile-toast profile-toast-${t.type}`}>
          <span>{t.message}</span>
          <button onClick={() => dismissToast(t.id)} className="toast-close">✕</button>
        </div>
      ))}
    </div>
  )
}

// ─── Section 1 — Profile Picture ──────────────────────────────────────────────
// Uses: File upload pattern (Task 14) + useToast (Task 13)
function AvatarSection({ user, updateUser, showToast }) {
  const [preview,   setPreview]   = useState(null)
  const [file,      setFile]      = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef()

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) return
    setFile(selected)
    // Instant preview using browser object URL — no upload needed yet (Task 14 pattern)
    setPreview(URL.createObjectURL(selected))
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      // FormData is required for file uploads — JSON cannot carry binary (Task 14 pattern)
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await api.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      // Update AuthContext — Navbar avatar updates instantly (React Context re-render)
      updateUser({ avatar_url: res.data.avatar_url })
      showToast('✅ Profile picture updated!', 'success')
      setPreview(null)
      setFile(null)
      fileInputRef.current.value = ''
    } catch (err) {
      showToast(err.response?.data?.error || 'Upload failed', 'error')
    } finally {
      setUploading(false)
    }
  }

  // Build avatar src: show preview blob URL → then server URL → then null (initials fallback)
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
          {/* Hidden input triggered by button click via useRef (Task 14 pattern) */}
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
// Uses: useForm (Task 13) + useToast (Task 13)
// The /api/me endpoint identifies the logged-in user (JWT/session pattern — Task 16)
function EditProfileSection({ user, updateUser, showToast }) {
  const [emailErr, setEmailErr] = useState('')

  // useForm — Task 13 pattern: manages form values, errors, handleChange, reset
  const { values, errors, handleChange, validateForm } = useForm(
    { name: user?.name || '', email: user?.email || '' },
    (vals) => {
      const errs = {}
      if (!vals.name.trim())  errs.name  = 'Name is required'
      if (!vals.email.trim()) errs.email = 'Email is required'
      else if (!/\S+@\S+\.\S+/.test(vals.email)) errs.email = 'Enter a valid email'
      return errs
    }
  )

  const [saving, setSaving] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setEmailErr('')

    // useForm validateForm() — runs validation, returns true if no errors
    if (!validateForm()) return

    setSaving(true)
    try {
      // PUT /api/me — session cookie identifies the user (Task 16 pattern)
      await api.put('/api/me', { name: values.name.trim(), email: values.email.trim() })
      // updateUser merges into AuthContext → Navbar name updates instantly
      updateUser({ name: values.name.trim(), email: values.email.trim() })
      // useToast — Task 13 pattern
      showToast('✅ Profile updated successfully!', 'success')
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.error || 'Update failed'
      if (status === 409) {
        setEmailErr(msg)  // Inline error for email conflict (409 Conflict)
      } else {
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-section">
      <h2 className="section-title">✏️ Edit Profile</h2>

      <form onSubmit={handleSave} className="profile-form">
        <div className="form-group">
          <label>Full Name</label>
          {/* useForm handleChange reads e.target.name to update values.name */}
          <input
            type="text"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Your full name"
          />
          {errors.name && <p className="field-error">⚠️ {errors.name}</p>}
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={e => { handleChange(e); setEmailErr('') }}
            placeholder="your@email.com"
          />
          {(errors.email || emailErr) && (
            <p className="field-error">⚠️ {emailErr || errors.email}</p>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  )
}

// ─── Section 3 — Change Password ──────────────────────────────────────────────
// Uses: useForm (Task 13) + useToast (Task 13)
function ChangePasswordSection({ showToast }) {
  const [currentErr, setCurrentErr] = useState('')
  const [saving, setSaving] = useState(false)

  // useForm — Task 13 pattern for password form
  const { values, errors, handleChange, validateForm, resetForm } = useForm(
    { current: '', newPass: '', confirm: '' },
    (vals) => {
      const errs = {}
      if (!vals.current)             errs.current = 'Current password is required'
      if (!vals.newPass)             errs.newPass = 'New password is required'
      else if (vals.newPass.length < 6) errs.newPass = 'At least 6 characters'
      if (vals.newPass !== vals.confirm) errs.confirm = 'Passwords do not match'
      return errs
    }
  )

  async function handleSubmit(e) {
    e.preventDefault()
    setCurrentErr('')

    // useForm validateForm — runs validation before API call
    if (!validateForm()) return

    setSaving(true)
    try {
      await api.put('/api/me/password', {
        current_password:  values.current,
        new_password:      values.newPass,
        confirm_password:  values.confirm
      })
      showToast('✅ Password changed successfully!', 'success')
      resetForm()  // useForm resetForm — clears all fields on success
    } catch (err) {
      const status = err.response?.status
      const msg    = err.response?.data?.error || 'Password change failed'
      if (status === 401) {
        setCurrentErr(msg)  // 401 = wrong current password → inline error
      } else {
        showToast(msg, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="profile-section">
      <h2 className="section-title">🔒 Change Password</h2>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Current Password</label>
          <input
            type="password"
            name="current"
            value={values.current}
            onChange={e => { handleChange(e); setCurrentErr('') }}
            placeholder="Your current password"
          />
          {(currentErr || errors.current) && (
            <p className="field-error">⚠️ {currentErr || errors.current}</p>
          )}
        </div>

        <div className="form-group">
          <label>New Password</label>
          <input
            type="password"
            name="newPass"
            value={values.newPass}
            onChange={handleChange}
            placeholder="Min 6 characters"
          />
          {/* Password strength indicator */}
          {values.newPass.length > 0 && (
            <div className="strength-bar">
              <div
                className={`strength-fill strength-${
                  values.newPass.length < 6  ? 'weak'
                  : values.newPass.length < 10 ? 'medium'
                  : 'strong'
                }`}
                style={{ width: `${Math.min((values.newPass.length / 12) * 100, 100)}%` }}
              />
              <span className="strength-label">
                {values.newPass.length < 6 ? 'Weak' : values.newPass.length < 10 ? 'Medium' : 'Strong'}
              </span>
            </div>
          )}
          {errors.newPass && <p className="field-error">⚠️ {errors.newPass}</p>}
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirm"
            value={values.confirm}
            onChange={handleChange}
            placeholder="Repeat new password"
          />
          {errors.confirm && <p className="field-error">⚠️ {errors.confirm}</p>}
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Changing...' : '🔑 Change Password'}
        </button>
      </form>
    </div>
  )
}

// ─── Main ProfilePage ──────────────────────────────────────────────────────────
// Integrates:
//   ✅ /api/me identifies logged-in user (Task 16 JWT/session pattern)
//   ✅ File upload for profile picture (Task 14 pattern)
//   ✅ useForm for Edit Profile + Change Password forms (Task 13)
//   ✅ useToast for success/error feedback (Task 13)
//   ✅ Dark mode via CSS variables [data-theme="dark"] (Task 17)
export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  // useToast — Task 13 pattern: single shared toast system for the whole page
  const { toasts, showToast, dismissToast } = useToast()

  if (!user) return <div className="page-loading">Loading profile...</div>

  return (
    <div className="profile-page">
      {/* Global toast container — fixed position, top-right */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />

      <div className="profile-header">
        <h1>👤 My Profile &amp; Settings</h1>
        <p>Manage your account details, profile picture and password.</p>
      </div>

      <div className="profile-grid">
        {/* All three sections share the same showToast from useToast */}
        <AvatarSection
          user={user}
          updateUser={updateUser}
          showToast={showToast}
        />
        <EditProfileSection
          user={user}
          updateUser={updateUser}
          showToast={showToast}
        />
        <ChangePasswordSection
          showToast={showToast}
        />
      </div>
    </div>
  )
}
