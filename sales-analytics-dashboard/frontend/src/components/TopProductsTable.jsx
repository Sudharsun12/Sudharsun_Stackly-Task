import { useState, useEffect } from "react";
import { fetchTopProducts } from "../api";

const MEDAL = ["gold", "silver", "bronze", "", ""];

export default function TopProductsTable({ filters }) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filters.from)     params.from     = filters.from;
    if (filters.to)       params.to       = filters.to;
    if (filters.category && filters.category !== "all")
      params.category = filters.category;

    fetchTopProducts(params)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters.from, filters.to, filters.category]);

  return (
    <div className="chart-card" id="top-products-table">
      <div className="chart-card-title">
        <span className="dot" style={{ background: "#ef4444" }} />
        Top 5 Products by Revenue
      </div>

      {loading ? (
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton skeleton-text" style={{ marginBottom: 12, height: 32 }} />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">📭 No products found</div>
      ) : (
        <div className="products-table-wrap">
          <table className="products-table" aria-label="Top 5 products">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product</th>
                <th>Category</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.rank} id={`product-row-${i + 1}`}>
                  <td>
                    <span className={`rank-badge ${MEDAL[i]}`}>{row.rank}</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{row.product}</td>
                  <td><span className="cat-pill">{row.category}</span></td>
                  <td>{row.units_sold.toLocaleString("en-IN")}</td>
                  <td className="revenue-cell">
                    ₹{Number(row.revenue).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
