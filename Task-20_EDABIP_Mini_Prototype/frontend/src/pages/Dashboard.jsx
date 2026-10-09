import React, { useState, useEffect } from "react";
import api from "../api";
import FilterBar from "../components/FilterBar";
import KPICards from "../components/KPICards";
import TrendChart from "../components/TrendChart";
import DeptBarChart from "../components/DeptBarChart";
import DeptPieChart from "../components/DeptPieChart";
import TopMetricsTable from "../components/TopMetricsTable";
import ActivityFeed from "../components/ActivityFeed";
import { useSocket } from "../context/SocketContext";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    department: "",
    from: "",
    to: ""
  });

  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [topMetrics, setTopMetrics] = useState([]);

  const { activities } = useSocket();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ department: "", from: "", to: "" });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);

      const [kpiRes, trendRes, deptRes, topRes] = await Promise.all([
        api.get(`/api/kpis?${params.toString()}`),
        api.get(`/api/metrics/trend?${params.toString()}`),
        api.get(`/api/metrics/by-department?${params.toString()}`),
        api.get("/api/metrics/top")
      ]);

      setKpis(kpiRes.data);
      setTrendData(trendRes.data);
      setDeptData(deptRes.data);
      setTopMetrics(topRes.data);
    } catch (err) {
      console.error("Error fetching dashboard analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // When live activity arrives via WebSocket, refresh KPIs automatically!
  useEffect(() => {
    if (activities.length > 0) {
      fetchData();
    }
  }, [activities]);

  return (
    <div style={{ padding: "28px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Executive Business Intelligence
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
          Cross-departmental performance metrics, trend forecasts, and live telemetry
        </p>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* KPI Cards Row */}
      <KPICards data={kpis} loading={loading} />

      {/* Main Grid: 2/3 Charts + 1/3 Live Activity Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Left Side: First Row Charts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Charts Row 1: Trend Area + Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <TrendChart data={trendData} loading={loading} />
            <DeptBarChart data={deptData} loading={loading} />
          </div>

          {/* Charts Row 2: Pie Share + Top 5 Leaderboard */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <DeptPieChart data={deptData} loading={loading} />
            <TopMetricsTable data={topMetrics} loading={loading} />
          </div>
        </div>

        {/* Right Side: WebSocket Live Activity Feed Sidebar */}
        <div style={{ height: "100%", minHeight: "600px" }}>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
