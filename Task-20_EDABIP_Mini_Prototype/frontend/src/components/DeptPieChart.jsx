import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { PieChart as PieIcon } from "lucide-react";

const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export default function DeptPieChart({ data, loading }) {
  return (
    <div className="glass-card" style={{ padding: "22px", height: "380px", display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: "16px" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
          <PieIcon size={18} color="#10b981" />
          Department Share Distribution
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "2px" }}>
          Proportional contribution across divisions
        </p>
      </div>

      <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
            Loading department share...
          </div>
        ) : !data || data.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)" }}>
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(val) => [`$${Number(val).toLocaleString()}`, "Value"]}
                contentStyle={{
                  backgroundColor: "var(--bg-surface)",
                  borderColor: "var(--border-color)",
                  borderRadius: "8px",
                  color: "var(--text-primary)"
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(val) => <span style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{val}</span>}
              />
              <Pie
                data={data}
                dataKey="total"
                nameKey="department"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
