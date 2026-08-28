import React, { useState } from 'react'
import './StarRating.css'

/**
 * StarRating — Bonus component.
 * Click stars to select a rating 1–5.
 * Hover previews the selection before clicking.
 */
export default function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="star-rating" role="group" aria-label="Select a star rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={`star ${star <= (hovered || value) ? 'star--filled' : ''}`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={star === value}
        >
          ★
        </button>
      ))}
      {value > 0 && (
        <span className="star-label">{value} / 5</span>
      )}
    </div>
  )
}
