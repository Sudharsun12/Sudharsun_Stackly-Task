import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { useForm } from "../hooks/useForm";
import { useToast } from "../hooks/useToast";
import { useDebounce } from "../hooks/useDebounce";
import Pagination from "../components/Pagination";
import {
  PlusCircle,
  UploadCloud,
  FileSpreadsheet,
  Search,
  Trash2,
  Download,
  AlertCircle,
  CheckCircle2,
  Eye,
  RefreshCw
} from "lucide-react";

export default function DataManagement() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  // Departments for dropdown
  const [departments, setDepartments] = useState([]);

  // Form for single record
  const { values, handleChange, resetForm } = useForm({
    department: "",
    metric_name: "",
    metric_value: "",
    recorded_on: new Date().toISOString().split("T")[0]
  });
  const [adding, setAdding] = useState(false);

  // CSV Upload state
  const [csvFile, setCsvFile] = useState(null);
  const [csvPreview, setCsvPreview] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Records Table state
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingRecords, setLoadingRecords] = useState(false);

  // Filters for table
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);
  const [tableDept, setTableDept] = useState("");
  const [tableFrom, setTableFrom] = useState("");
  const [tableTo, setTableTo] = useState("");

  useEffect(() => {
    api.get("/api/departments")
      .then((res) => {
        setDepartments(res.data);
        if (res.data.length > 0 && !values.department) {
          handleChange({ target: { name: "department", value: res.data[0].name } });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch records
  const fetchRecords = async () => {
    setLoadingRecords(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (tableDept) params.append("department", tableDept);
      if (tableFrom) params.append("from", tableFrom);
      if (tableTo) params.append("to", tableTo);

      const res = await api.get(`/api/metrics?${params.toString()}`);
      setRecords(res.data.data);
      setTotalRecords(res.data.total);
      setTotalPages(res.data.total_pages);
    } catch (err) {
      toastError("Failed to fetch metric records.");
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, debouncedSearch, tableDept, tableFrom, tableTo]);

  // Submit single metric
  const handleAddMetric = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post("/api/metrics", {
        department: values.department,
        metric_name: values.metric_name,
        metric_value: parseFloat(values.metric_value),
        recorded_on: values.recorded_on
      });
      success(`Metric '${values.metric_name}' added successfully!`);
      resetForm();
      fetchRecords();
    } catch (err) {
      toastError(err.response?.data?.error || "Error adding metric.");
    } finally {
      setAdding(false);
    }
  };

  // CSV File select and preview parsing (first 5 rows)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toastError("Please select a valid .csv file.");
      return;
    }

    setCsvFile(file);

    // Parse preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length > 1) {
        const headers = lines[0].split(",").map((h) => h.trim());
        const previewRows = lines.slice(1, 6).map((line) => {
          const cells = line.split(",").map((c) => c.trim());
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = cells[i] || "";
          });
          return obj;
        });
        setCsvPreview(previewRows);
      }
    };
    reader.readAsText(file);
  };

  // Upload CSV to API
  const handleUploadCsv = async () => {
    if (!csvFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      const res = await api.post("/api/metrics/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      success(res.data.message || `${res.data.inserted} records uploaded successfully!`);
      setCsvFile(null);
      setCsvPreview([]);
      fetchRecords();
    } catch (err) {
      toastError(err.response?.data?.error || "CSV upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // Delete metric (admin only)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete metric '${name}'?`)) return;
    try {
      await api.delete(`/api/metrics/${id}`);
      success("Metric record deleted successfully.");
      fetchRecords();
    } catch (err) {
      toastError(err.response?.data?.error || "Failed to delete record.");
    }
  };

  // Bonus: Export to CSV
  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = ["ID", "Department", "Metric Name", "Value", "Recorded On", "Uploaded By"];
    const rows = records.map((r) => [
      r.id,
      r.department,
      `"${r.metric_name}"`,
      r.metric_value,
      r.recorded_on,
      `"${r.uploaded_by}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `edabip_metrics_page_${page}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: "28px", maxWidth: "1500px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, letterSpacing: "-0.5px" }}>
          Data Ingestion & Management
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "4px" }}>
          Submit manual data points, bulk-upload departmental CSV spreadsheets, and manage audit logs
        </p>
      </div>

      {/* Top 2 Columns: Add Single Record + CSV Upload */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "24px" }}>
        {/* Section 1: Add Single Metric */}
        <div className="glass-card" style={{ padding: "26px" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <PlusCircle size={20} color="var(--brand-primary)" />
            Add Single Metric Record
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "20px" }}>
            Input individual verified metric entries directly into the enterprise database
          </p>

          <form onSubmit={handleAddMetric} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Department</label>
                <select
                  name="department"
                  value={values.department}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Recorded Date</label>
                <input
                  type="date"
                  name="recorded_on"
                  value={values.recorded_on}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Metric Name</label>
                <input
                  type="text"
                  name="metric_name"
                  placeholder="e.g. Q4 Cloud Invoicing"
                  value={values.metric_name}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "6px" }}>Metric Value ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="metric_value"
                  placeholder="e.g. 54200.00"
                  value={values.metric_value}
                  onChange={handleChange}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <button type="submit" disabled={adding} className="btn-primary" style={{ marginTop: "8px", alignSelf: "flex-start" }}>
              <PlusCircle size={16} />
              {adding ? "Inserting..." : "Insert Metric Record"}
            </button>
          </form>
        </div>

        {/* Section 2: CSV Bulk Upload */}
        <div className="glass-card" style={{ padding: "26px", display: "flex", flexDirection: "column" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
            <UploadCloud size={20} color="#06b6d4" />
            Bulk CSV Upload
          </h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
            Expected columns: <code>department, metric_name, metric_value, recorded_on</code>
          </p>

          <div
            style={{
              border: "2px dashed var(--border-color)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
              background: "var(--bg-input)",
              cursor: "pointer",
              marginBottom: "16px"
            }}
            onClick={() => document.getElementById("csvFileInput").click()}
          >
            <FileSpreadsheet size={36} color="var(--brand-primary)" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
              {csvFile ? csvFile.name : "Click to browse or drop CSV spreadsheet"}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
              Supports UTF-8 CSV up to 16MB
            </div>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {/* 5-Row Preview Table */}
          {csvPreview.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Eye size={14} /> Preview (First 5 Rows):
              </div>
              <div style={{ overflowX: "auto", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                  <thead style={{ background: "var(--bg-input)" }}>
                    <tr>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Dept</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Metric Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "right" }}>Value</th>
                      <th style={{ padding: "6px 8px", textAlign: "left" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, idx) => (
                      <tr key={idx} style={{ borderTop: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "6px 8px" }}>{row.department}</td>
                        <td style={{ padding: "6px 8px" }}>{row.metric_name}</td>
                        <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{row.metric_value}</td>
                        <td style={{ padding: "6px 8px" }}>{row.recorded_on}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {csvFile && (
            <button
              onClick={handleUploadCsv}
              disabled={uploading}
              className="btn-primary"
              style={{ background: "#059669", marginTop: "auto" }}
            >
              <UploadCloud size={16} />
              {uploading ? "Parsing & Bulk Inserting..." : `Upload All Records from ${csvFile.name}`}
            </button>
          )}
        </div>
      </div>

      {/* Section 3: Records Table with Pagination, Search, Filters, and Admin Delete */}
      <div className="glass-card" style={{ padding: "26px", overflow: "hidden" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>
              Master Metric Repository
            </h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
              Explore, filter, and audit recorded metrics with debounced search
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            {/* Search Input (useDebounce) */}
            <div style={{ position: "relative", minWidth: "220px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                placeholder="Search metrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: "100%", paddingLeft: "36px", fontSize: "0.85rem" }}
              />
            </div>

            {/* Department Filter */}
            <select
              value={tableDept}
              onChange={(e) => { setTableDept(e.target.value); setPage(1); }}
              style={{ fontSize: "0.85rem" }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Bonus: Export CSV */}
            <button onClick={handleExportCSV} className="btn-secondary" style={{ fontSize: "0.85rem", padding: "8px 14px" }}>
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-color)", textAlign: "left", background: "var(--bg-input)" }}>
                <th style={{ padding: "12px 14px" }}>ID</th>
                <th style={{ padding: "12px 14px" }}>Department</th>
                <th style={{ padding: "12px 14px" }}>Metric Name</th>
                <th style={{ padding: "12px 14px", textAlign: "right" }}>Value</th>
                <th style={{ padding: "12px 14px" }}>Recorded Date</th>
                <th style={{ padding: "12px 14px" }}>Uploaded By</th>
                {user?.role === "admin" && (
                  <th style={{ padding: "12px 14px", textAlign: "center" }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loadingRecords ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                    No metric records match your criteria.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: "1px solid var(--border-color)",
                      transition: "background 0.15s"
                    }}
                  >
                    <td style={{ padding: "12px 14px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      #{r.id}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span className="badge" style={{ background: "var(--bg-input)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}>
                        {r.department}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", fontWeight: 600 }}>
                      {r.metric_name}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontWeight: 700, color: "var(--brand-primary)" }}>
                      ${Number(r.metric_value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                      {r.recorded_on}
                    </td>
                    <td style={{ padding: "12px 14px", color: "var(--text-secondary)" }}>
                      {r.uploaded_by}
                    </td>
                    {user?.role === "admin" && (
                      <td style={{ padding: "12px 14px", textAlign: "center" }}>
                        <button
                          onClick={() => handleDelete(r.id, r.metric_name)}
                          className="btn-danger"
                          title="Delete metric (Admin only)"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          limit={10}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </div>
    </div>
  );
}
