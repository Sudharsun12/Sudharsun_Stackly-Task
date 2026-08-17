import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { fetchMonthly } from "../api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "10px 14px",
        boxShadow: "var(--shadow-md)", fontFamily: "Inter,sans-serif"
      }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: 700, color: "var(--accent)", fontSize: "0.95rem" }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function RevenueLineChart({ filters }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;

    fetchMonthly(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.category]);

  return (
    <div className="chart-card charts-full" id="revenue-line-chart">
      <div className="chart-card-title">
        <span className="dot" style={{ background: "var(--accent)" }} />
        Revenue Over Time (Monthly)
      </div>

      {loading ? (
        <div className="skeleton skeleton-rect" />
      ) : data.length === 0 ? (
        <div className="empty-state">📭 No data for selected range</div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#6366f1"
              strokeWidth={2.5}
              fill="url(#revenueGrad)"
              dot={{ fill: "#6366f1", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
