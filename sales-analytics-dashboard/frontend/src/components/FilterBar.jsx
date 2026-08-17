import { useState, useEffect } from "react";
import { fetchCategories } from "../api";

export default function FilterBar({ filters, onChange, onApply, onReset }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <div className="filter-bar" role="search" aria-label="Dashboard filters">
      <div className="filter-group">
        <label htmlFor="filter-from">From Date</label>
        <input
          id="filter-from"
          type="date"
          value={filters.from}
          onChange={(e) => set("from", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="filter-to">To Date</label>
        <input
          id="filter-to"
          type="date"
          value={filters.to}
          onChange={(e) => set("to", e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label htmlFor="filter-category">Category</label>
        <select
          id="filter-category"
          value={filters.category}
          onChange={(e) => set("category", e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="filter-btn-group">
        <button id="apply-filter-btn" className="btn-apply" onClick={onApply}>
          Apply Filters
        </button>
        <button id="reset-filter-btn" className="btn-reset" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
}
