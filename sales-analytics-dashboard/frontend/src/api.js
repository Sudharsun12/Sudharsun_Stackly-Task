import axios from "axios";

// No baseURL needed — Vite proxy forwards /api → Flask on port 5000
const API = axios.create({ baseURL: "" });

export const fetchKPIs = (filters = {}) =>
  API.get("/api/kpis", { params: filters }).then((r) => r.data);

export const fetchMonthly = (filters = {}) =>
  API.get("/api/sales/monthly", { params: filters }).then((r) => r.data);

export const fetchByCategory = (filters = {}) =>
  API.get("/api/sales/by-category", { params: filters }).then((r) => r.data);

export const fetchByRegion = (filters = {}) =>
  API.get("/api/sales/by-region", { params: filters }).then((r) => r.data);

export const fetchTopProducts = (filters = {}) =>
  API.get("/api/sales/top-products", { params: filters }).then((r) => r.data);

export const fetchCategories = () =>
  API.get("/api/categories").then((r) => r.data);
