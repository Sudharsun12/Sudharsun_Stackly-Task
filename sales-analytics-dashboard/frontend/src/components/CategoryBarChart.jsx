import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { fetchByCategory } from "../api";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)"
      }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: 700, color: payload[0].color, fontSize: "0.95rem" }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryBarChart({ filters }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;

    fetchByCategory(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.category]);

  return (
    <div className="chart-card" id="category-bar-chart">
      <div className="chart-card-title">
        <span className="dot" style={{ background: "#06b6d4" }} />
        Revenue by Category
      </div>

      {loading ? (
        <div className="skeleton skeleton-rect" />
      ) : data.length === 0 ? (
        <div className="empty-state">📭 No data found</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="category"
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-card-hover)" }} />
            <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
