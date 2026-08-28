import React from 'react'
import { useForm } from '../hooks/useForm'
import StarRating from './StarRating'
import './FeedbackForm.css'

/** Initial blank state for the form */
const INITIAL_VALUES = { name: '', email: '', rating: '', message: '' }

/**
 * validate — the rules specific to this feedback form.
 * useForm calls this with the current values and stores the result.
 *
 * HOW ONE HOOK HANDLES MULTIPLE FIELDS:
 * useForm knows nothing about which fields exist. It accepts `initialValues`
 * (which defines the shape) and this `validate` function (which defines the
 * rules). handleChange reads e.target.name as a dynamic key, so the same
 * hook works for any form — Login, Register, Checkout, Feedback — just
 * by passing different arguments.
 */
function validate(vals) {
  const errs = {}
  if (!vals.name.trim())                   errs.name    = 'Name is required'
  if (!vals.email.includes('@'))           errs.email   = 'Valid email is required'
  if (!vals.rating)                        errs.rating  = 'Please select a rating'
  if (!vals.message.trim())               errs.message = 'Message is required'
  else if (vals.message.length > 300)     errs.message = 'Max 300 characters allowed'
  return errs
}

const MAX_CHARS = 300

export default function FeedbackForm({ onAddFeedback, showToast }) {
  const {
    values,
    errors,
    handleChange,
    validateForm,
    resetForm,
  } = useForm(INITIAL_VALUES, validate)

  /** Bridge: StarRating gives us a number; useForm expects an event-like object */
  function handleRatingChange(star) {
    handleChange({ target: { name: 'rating', value: String(star) } })
  }

  function handleSubmit(e) {
    e.preventDefault()
    const isValid = validateForm()

    if (!isValid) {
      // Error toast — no alert() used
      showToast('Please fix the errors below', 'error')
      return
    }

    // Build the feedback object and pass it up to App
    onAddFeedback({
      id:      Date.now(),
      name:    values.name.trim(),
      email:   values.email.trim(),
      rating:  Number(values.rating),
      message: values.message.trim(),
    })

    // Success toast — no alert() used
    showToast('Feedback submitted! 🎉', 'success')
    resetForm()
  }

  const remaining = MAX_CHARS - values.message.length

  return (
    <form className="feedback-form" onSubmit={handleSubmit} noValidate>
      <h2 className="form-title">Share Your Feedback</h2>

      {/* ── Name ────────────────────────────────── */}
      <div className="field">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Your full name"
          value={values.name}
          onChange={handleChange}
          className={errors.name ? 'input--error' : ''}
        />
        {errors.name && <p className="error-msg">{errors.name}</p>}
      </div>

      {/* ── Email ───────────────────────────────── */}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="your@email.com"
          value={values.email}
          onChange={handleChange}
          className={errors.email ? 'input--error' : ''}
        />
        {errors.email && <p className="error-msg">{errors.email}</p>}
      </div>

      {/* ── Star Rating (Bonus) ─────────────────── */}
      <div className="field">
        <label>Rating</label>
        <StarRating
          value={Number(values.rating)}
          onChange={handleRatingChange}
        />
        {errors.rating && <p className="error-msg">{errors.rating}</p>}
      </div>

      {/* ── Message with character counter (Bonus) ─ */}
      <div className="field">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us what you think..."
          value={values.message}
          onChange={handleChange}
          className={errors.message ? 'input--error' : ''}
          maxLength={300}
        />
        <span className={`char-counter ${remaining < 30 ? 'char-counter--warn' : ''}`}>
          {remaining} / {MAX_CHARS} characters remaining
        </span>
        {errors.message && <p className="error-msg">{errors.message}</p>}
      </div>

      <button type="submit" className="btn-submit">
        Submit Feedback
      </button>
    </form>
  )
}
