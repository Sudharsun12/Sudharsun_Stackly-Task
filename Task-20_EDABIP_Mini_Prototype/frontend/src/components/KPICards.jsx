import React from "react";
import { DollarSign, Layers, Award, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KPICards({ data, loading }) {
  if (loading) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-card" style={{ padding: "24px", height: "130px", animation: "pulse 1.5s infinite" }}>
            <div style={{ width: "40%", height: "14px", background: "var(--bg-input)", borderRadius: "4px", marginBottom: "16px" }} />
            <div style={{ width: "70%", height: "28px", background: "var(--bg-input)", borderRadius: "6px" }} />
          </div>
        ))}
      </div>
    );
  }

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const isPositive = (data?.mom_change || 0) >= 0;

  const cards = [
    {
      title: "Total Metric Value",
      value: formatCurrency(data?.total_value),
      subtitle: "Across filtered selection",
      icon: DollarSign,
      color: "#4f46e5",
      bg: "rgba(79, 70, 229, 0.12)"
    },
    {
      title: "Total Records",
      value: (data?.total_records || 0).toLocaleString(),
      subtitle: "Logged entries in platform",
      icon: Layers,
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)"
    },
    {
      title: "Top Department",
      value: data?.top_department || "N/A",
      subtitle: "Most metrics submitted",
      icon: Award,
      color: "#10b981",
      bg: "rgba(16, 185, 129, 0.12)"
    },
    {
      title: "Month-on-Month Change",
      value: `${isPositive ? "+" : ""}${data?.mom_change ?? 0}%`,
      subtitle: `This Mo: ${formatCurrency(data?.this_month)} vs Last: ${formatCurrency(data?.last_month)}`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "#10b981" : "#ef4444",
      bg: isPositive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
      trend: isPositive ? "up" : "down"
    }
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "24px"
      }}
    >
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            className="glass-card"
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                {c.title}
              </span>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: c.bg,
                  color: c.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Icon size={20} />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 800,
                  letterSpacing: "-0.5px",
                  color: c.trend ? c.color : "var(--text-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {c.value}
                {c.trend === "up" && <ArrowUpRight size={22} />}
                {c.trend === "down" && <ArrowDownRight size={22} />}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px" }}>
                {c.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
