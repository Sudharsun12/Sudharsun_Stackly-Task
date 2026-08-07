const CATEGORIES = ['All', 'Work', 'Personal', 'Study', 'Other']

function SearchBar({ search, setSearch, category, setCategory, sortOrder, setSortOrder }) {
  return (
    <div className="search-bar-card">

      {/* Search Input */}
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Search notes by title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search notes"
        />
        {search && (
          <button className="clear-search-btn" onClick={() => setSearch('')} aria-label="Clear search">✕</button>
        )}
      </div>

      <div className="filters-row">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">📂 Category</label>
          <div className="filter-chips">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase()}`}
                className={`filter-chip ${category === cat ? 'active' : ''} ${cat !== 'All' ? `cat-${cat.toLowerCase()}` : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="sort-select" className="filter-label">🔃 Sort</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

    </div>
  )
}

export default SearchBar
