// ─────────────────────────────────────────────────────────────
// src/components/FilterBar.tsx
// Typed Category | 'all' filter + FilterType time period buttons.
// React.ChangeEvent<HTMLSelectElement> is the correct event type.
// ─────────────────────────────────────────────────────────────

import React from 'react'
import type { Category, FilterType } from '../types'

// 'all' added to Category union for the "show all" option
type CategoryFilter = Category | 'all'

interface FilterBarProps {
  categoryFilter: CategoryFilter
  timeFilter: FilterType
  onCategoryChange: (cat: CategoryFilter) => void
  onTimeChange: (time: FilterType) => void
}

const CATEGORIES: Category[] = [
  'Food', 'Transport', 'Shopping', 'Health', 'Education', 'Other',
]

const TIME_FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All Time', value: 'all' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
]

function FilterBar({
  categoryFilter,
  timeFilter,
  onCategoryChange,
  onTimeChange,
}: FilterBarProps): JSX.Element {
  // Correct event type: React.ChangeEvent<HTMLSelectElement>
  function handleCategoryChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ): void {
    onCategoryChange(e.target.value as CategoryFilter)
  }

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label htmlFor="category-filter" className="filter-label">
          📂 Category
        </label>
        <select
          id="category-filter"
          className="filter-select"
          value={categoryFilter}
          onChange={handleCategoryChange}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((cat: Category) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">⏱ Time Period</span>
        <div className="time-filter-buttons">
          {TIME_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              className={`time-btn ${timeFilter === value ? 'active' : ''}`}
              onClick={() => onTimeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FilterBar
export type { CategoryFilter }
