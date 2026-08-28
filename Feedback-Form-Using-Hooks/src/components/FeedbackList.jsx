import React from 'react'
import './FeedbackList.css'

/** Maps numeric rating to filled star emojis */
const STARS = { 1: '★☆☆☆☆', 2: '★★☆☆☆', 3: '★★★☆☆', 4: '★★★★☆', 5: '★★★★★' }

export default function FeedbackList({ feedbacks }) {
  if (feedbacks.length === 0) {
    return (
      <p className="no-feedback">
        No feedback yet — be the first to share! 💬
      </p>
    )
  }

  return (
    <section className="feedback-list">
      <h2 className="list-title">All Feedback ({feedbacks.length})</h2>
      <div className="cards">
        {feedbacks.map(fb => (
          <article key={fb.id} className="card">
            <div className="card__header">
              <div className="card__avatar" aria-hidden="true">
                {fb.name[0].toUpperCase()}
              </div>
              <div>
                <p className="card__name">{fb.name}</p>
                <p className="card__email">{fb.email}</p>
              </div>
              <div className="card__stars" aria-label={`Rating: ${fb.rating} out of 5`}>
                {STARS[fb.rating]}
              </div>
            </div>
            <p className="card__message">{fb.message}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
