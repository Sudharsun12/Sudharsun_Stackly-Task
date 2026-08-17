import { useState, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { fetchByCategory } from "../api";

const COLORS = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700, fontFamily: "Inter,sans-serif" }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "var(--bg-card)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "10px 14px", boxShadow: "var(--shadow-md)"
      }}>
        <p style={{ fontWeight: 700, color: payload[0].payload.fill, fontSize: "0.9rem" }}>
          {payload[0].name}
        </p>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: 2 }}>
          ₹{Number(payload[0].value).toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function CategoryPieChart({ filters }) {
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

  const pieData = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  return (
    <div className="chart-card" id="category-pie-chart">
      <div className="chart-card-title">
        <span className="dot" style={{ background: "#10b981" }} />
        Category Share
      </div>

      {loading ? (
        <div className="skeleton skeleton-rect" />
      ) : data.length === 0 ? (
        <div className="empty-state">📭 No data found</div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="revenue"
              nameKey="category"
              cx="50%"
              cy="46%"
              outerRadius={100}
              labelLine={false}
              label={renderCustomLabel}
              isAnimationActive
              animationBegin={100}
              animationDuration={800}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} stroke="var(--bg-card)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "0.78rem", color: "var(--text-secondary)", paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
