import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FilterBar from "./components/FilterBar";
import KPICards from "./components/KPICards";
import RevenueLineChart from "./components/RevenueLineChart";
import CategoryBarChart from "./components/CategoryBarChart";
import CategoryPieChart from "./components/CategoryPieChart";
import RegionBarChart from "./components/RegionBarChart";
import TopProductsTable from "./components/TopProductsTable";

function App() {
  const [theme, setTheme]     = useState("light");
  const [filters, setFilters] = useState({ from: "", to: "", category: "all" });
  const [applied, setApplied] = useState({ from: "", to: "", category: "all" });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleApply = () => setApplied({ ...filters });

  const handleReset = () => {
    const blank = { from: "", to: "", category: "all" };
    setFilters(blank);
    setApplied(blank);
  };

  return (
    <div className="app-wrapper">
      <Navbar
        theme={theme}
        onToggleTheme={() => setTheme(t => t === "light" ? "dark" : "light")}
      />

      <main className="dashboard">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          onApply={handleApply}
          onReset={handleReset}
        />
        <p className="section-title">Key Performance Indicators</p>
        <KPICards filters={applied} />
        <div className="charts-full">
          <RevenueLineChart filters={applied} />
        </div>
        <div className="charts-row">
          <CategoryBarChart filters={applied} />
          <CategoryPieChart filters={applied} />
        </div>
        <div className="charts-full">
          <RegionBarChart filters={applied} />
        </div>
        <div className="charts-full">
          <TopProductsTable filters={applied} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
