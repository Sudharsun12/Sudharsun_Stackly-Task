import { useState, useEffect } from "react";
import { fetchKPIs } from "../api";

const CARDS = [
  { key: "total_revenue",    label: "Total Revenue",       icon: "💰", prefix: "₹", isCurrency: true  },
  { key: "total_orders",     label: "Total Orders",        icon: "🛒", prefix: "",  isCurrency: false },
  { key: "avg_order_value",  label: "Avg Order Value",     icon: "📈", prefix: "₹", isCurrency: true  },
  { key: "best_product",     label: "Best Selling Product",icon: "🏆", prefix: "",  isCurrency: false },
];

function formatNum(val, isCurrency) {
  if (typeof val === "string") return val;
  if (isCurrency) {
    if (val >= 1_00_000) return `${(val / 1_00_000).toFixed(1)}L`;
    if (val >= 1_000)   return `${(val / 1_000).toFixed(1)}K`;
    return val.toFixed(2);
  }
  return val.toLocaleString("en-IN");
}

export default function KPICards({ filters }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;

    fetchKPIs(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.category]);

  if (loading) return (
    <div className="kpi-grid">
      {CARDS.map((_, i) => (
        <div key={i} className="kpi-card">
          <div className="skeleton skeleton-text" style={{ width: "40%" }} />
          <div className="skeleton skeleton-text" style={{ width: "70%", height: 36, marginTop: 8 }} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="kpi-grid">
      {CARDS.map((card, i) => (
        <div
          key={card.key}
          className="kpi-card"
          id={`kpi-card-${card.key}`}
          style={{ animationDelay: `${i * 0.08}s` }}
        >
          <div className="kpi-icon">{card.icon}</div>
          <div className="kpi-label">{card.label}</div>
          <div className="kpi-value">
            {card.prefix}{data ? formatNum(data[card.key], card.isCurrency) : "—"}
          </div>
          {card.key === "best_product" && data && (
            <div className="kpi-sub">{data.best_units_sold} units sold</div>
          )}
        </div>
      ))}
    </div>
  );
}
