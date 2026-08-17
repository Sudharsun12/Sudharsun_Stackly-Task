import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { fetchByRegion } from "../api";

const COLORS = { North: "#6366f1", South: "#06b6d4", East: "#10b981", West: "#f59e0b" };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)"
      }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
        <p style={{ fontWeight: 700, color: payload[0].fill, fontSize: "0.95rem" }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function RegionBarChart({ filters }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;

    fetchByRegion(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.category]);

  return (
    <div className="chart-card" id="region-bar-chart">
      <div className="chart-card-title">
        <span className="dot" style={{ background: "#f59e0b" }} />
        Revenue by Region
      </div>

      {loading ? (
        <div className="skeleton skeleton-rect" />
      ) : data.length === 0 ? (
        <div className="empty-state">📭 No data found</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="region"
              tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-card-hover)" }} />
            <Bar dataKey="revenue" radius={[0, 6, 6, 0]} barSize={28}>
              {data.map((entry, i) => (
                <Cell key={i} fill={COLORS[entry.region] || "#6366f1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
