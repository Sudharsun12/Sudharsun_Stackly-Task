import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, total, limit, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderTop: "1px solid var(--border-color)",
        flexWrap: "wrap",
        gap: "12px"
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        Showing page <strong style={{ color: "var(--text-primary)" }}>{page}</strong> of{" "}
        <strong style={{ color: "var(--text-primary)" }}>{totalPages}</strong> ({total} records total)
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="btn-secondary"
          style={{
            padding: "6px 12px",
            fontSize: "0.85rem",
            opacity: page <= 1 ? 0.4 : 1,
            cursor: page <= 1 ? "not-allowed" : "pointer"
          }}
        >
          <ChevronLeft size={16} /> Previous
        </button>

        <span style={{ fontSize: "0.85rem", fontWeight: 600, padding: "0 8px" }}>
          {page} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="btn-secondary"
          style={{
            padding: "6px 12px",
            fontSize: "0.85rem",
            opacity: page >= totalPages ? 0.4 : 1,
            cursor: page >= totalPages ? "not-allowed" : "pointer"
          }}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
