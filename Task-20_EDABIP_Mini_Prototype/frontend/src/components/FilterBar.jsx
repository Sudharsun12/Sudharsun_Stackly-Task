import React, { useState, useEffect } from "react";
import api from "../api";
import { Filter, Calendar, RotateCcw } from "lucide-react";

export default function FilterBar({ filters, onChange, onReset }) {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    api.get("/api/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => {});
  }, []);

  return (
    <div
      className="glass-card"
      style={{
        padding: "16px 20px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "24px"
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-secondary)" }}>
        <Filter size={18} color="var(--brand-primary)" />
        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>Dashboard Filters</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "14px" }}>
        {/* Department select */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>Department:</label>
          <select
            value={filters.department || ""}
            onChange={(e) => onChange("department", e.target.value)}
            style={{ minWidth: "160px" }}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>From:</label>
          <input
            type="date"
            value={filters.from || ""}
            onChange={(e) => onChange("from", e.target.value)}
          />
        </div>

        {/* Date To */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>To:</label>
          <input
            type="date"
            value={filters.to || ""}
            onChange={(e) => onChange("to", e.target.value)}
          />
        </div>

        {/* Reset button */}
        {(filters.department || filters.from || filters.to) && (
          <button
            onClick={onReset}
            className="btn-secondary"
            style={{ padding: "8px 12px", fontSize: "0.85rem" }}
            title="Reset Filters"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
