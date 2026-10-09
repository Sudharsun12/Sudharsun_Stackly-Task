import React from "react";
import { Trophy, TrendingUp } from "lucide-react";

export default function TopMetricsTable({ data, loading }) {
  return (
    <div className="glass-card" style={{ padding: "22px", height: "380px", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <Trophy size={18} color="#f59e0b" />
          Top 5 Metrics Leaderboard
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Highest aggregate value across all categories
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
            Loading top metrics...
          </div>
        ) : !data || data.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
            No metrics found
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                <th style={{ padding: "8px 10px", color: "var(--text-secondary)", fontWeight: 600, width: "40px" }}>#</th>
                <th style={{ padding: "8px 10px", color: "var(--text-secondary)", fontWeight: 600 }}>Metric Name</th>
                <th style={{ padding: "8px 10px", color: "var(--text-secondary)", fontWeight: 600, textAlign: "right" }}>Total Value</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    transition: "background-color 0.15s"
                  }}
                >
                  <td style={{ padding: "10px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        backgroundColor:
                          index === 0 ? "#fef3c7" : index === 1 ? "#f1f5f9" : index === 2 ? "#ffedd5" : "var(--bg-input)",
                        color:
                          index === 0 ? "#b45309" : index === 1 ? "#475569" : index === 2 ? "#c2410c" : "var(--text-secondary)"
                      }}
                    >
                      {index + 1}
                    </span>
                  </td>
                  <td style={{ padding: "10px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.metric_name}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, color: "var(--brand-primary)" }}>
                    ${Number(item.total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
