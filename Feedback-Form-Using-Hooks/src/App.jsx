import React, { useState, useEffect } from 'react'
import { useToast } from './hooks/useToast'
import FeedbackForm from './components/FeedbackForm'
import FeedbackList from './components/FeedbackList'
import ToastContainer from './components/ToastContainer'
import Footer from './components/Footer'
import './App.css'

const STORAGE_KEY   = 'task13_feedbacks'
const THEME_KEY     = 'task13_theme'

/* ── Rotating Quotes ─────────────────────────────────────────────── */
const QUOTES = [
  {
    text: "The details are not the details. They make the design.",
    author: "— Charles Eames"
  },
  {
    text: "First, solve the problem. Then, write the code.",
    author: "— John Johnson"
  },
  {
    text: "Any application that can be written in JavaScript, will eventually be written in JavaScript.",
    author: "— Jeff Atwood"
  },
  {
    text: "Code is like humor. When you have to explain it, it's bad.",
    author: "— Cory House"
  },
  {
    text: "Simplicity is the soul of efficiency.",
    author: "— Austin Freeman"
  },
  {
    text: "Don't repeat yourself. Every piece of knowledge must have a single, unambiguous representation.",
    author: "— Andy Hunt & Dave Thomas (The Pragmatic Programmer)"
  },
  {
    text: "Make it work, make it right, make it fast.",
    author: "— Kent Beck"
  },
  {
    text: "The best error message is the one that never shows up.",
    author: "— Thomas Fuchs"
  },
]

export default function App() {
  /* ── Dark Mode ───────────────────────────────────────────────── */
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDark ? 'dark' : 'light'
    )
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light')
  }, [isDark])

  /* ── Rotating Quote ──────────────────────────────────────────── */
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length)
  )

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % QUOTES.length)
    }, 8000)                          // rotate every 8 seconds
    return () => clearInterval(timer)
  }, [])

  const currentQuote = QUOTES[quoteIndex]

  /* ── Feedback List (+ localStorage bonus) ────────────────────── */
  const [feedbackList, setFeedbackList] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbackList))
  }, [feedbackList])

  /* ── Toast ───────────────────────────────────────────────────── */
  const { toasts, showToast, dismissToast } = useToast()

  function handleAddFeedback(feedback) {
    setFeedbackList(prev => [feedback, ...prev])
  }

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div className="app">

        {/* ── Header with Dark Mode Toggle ────────────── */}
        <header className="app-header">
          <div className="app-header__text">
            <h1>💬 Feedback App</h1>
            <p>Task 13 — Custom Hooks: useForm + useToast</p>
          </div>

          <button
            className="dark-toggle"
            onClick={() => setIsDark(prev => !prev)}
            aria-label="Toggle dark mode"
          >
            <span className="dark-toggle__icon">
              {isDark ? '☀️' : '🌙'}
            </span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        {/* ── Rotating Quote Banner ───────────────────── */}
        <div className="quote-banner" key={quoteIndex}>
          <p className="quote-banner__text">"{currentQuote.text}"</p>
          <p className="quote-banner__author">{currentQuote.author}</p>
        </div>

        {/* ── Feedback Form ───────────────────────────── */}
        <FeedbackForm
          onAddFeedback={handleAddFeedback}
          showToast={showToast}
        />

        <hr className="divider" />

        {/* ── Feedback Cards ──────────────────────────── */}
        <FeedbackList feedbacks={feedbackList} />
      </div>

      {/* ── Footer ──────────────────────────────────── */}
      <Footer />
    </>
  )
}
