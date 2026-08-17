# SalesIQ — Sales Analytics Dashboard
### Task 11 | React + Flask + MySQL | Data Visualisation with Recharts

A full-stack, professional-grade analytics dashboard that transforms raw MySQL sales data into beautiful, interactive charts using Recharts. Features dark mode, live filter controls, skeleton loaders, and responsive layout.

---

## 📁 Project Structure

```
sales-dashboard/
├── backend/
│   ├── app.py           ← Flask REST API (6 endpoints)
│   ├── seed.py          ← Inserts 280+ sales records into MySQL
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── KPICards.jsx
    │   │   ├── RevenueLineChart.jsx
    │   │   ├── CategoryBarChart.jsx
    │   │   ├── CategoryPieChart.jsx
    │   │   ├── RegionBarChart.jsx
    │   │   └── TopProductsTable.jsx
    │   ├── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    └── package.json
```

---

## ⚙️ Setup Instructions

### 1. MySQL Setup

Open MySQL Workbench or run in terminal:
```sql
CREATE DATABASE sales_analytics;
```
*(The seed script will create tables automatically.)*

### 2. Backend Setup

```bash
cd sales-dashboard/backend

# Install Python dependencies
pip install flask flask-cors mysql-connector-python

# Seed the database (creates tables + inserts 280+ rows)
python seed.py

# Start Flask server
python app.py
```
Flask runs at: **http://localhost:5000**

### 3. Frontend Setup

```bash
cd sales-dashboard/frontend

# Install npm packages
npm install

# Install Recharts + Axios (if not already)
npm install recharts axios

# Start development server
npm run dev
```
React app runs at: **http://localhost:5173**

---

## 🔌 API Endpoints

| Method | Endpoint                  | Description                            |
|--------|---------------------------|----------------------------------------|
| GET    | `/api/kpis`               | Total revenue, orders, avg, best product |
| GET    | `/api/sales/monthly`      | Revenue grouped by month (12 months)   |
| GET    | `/api/sales/by-category`  | Revenue per category                   |
| GET    | `/api/sales/by-region`    | Revenue per region                     |
| GET    | `/api/sales/top-products` | Top 5 products by revenue              |
| GET    | `/api/sales/filter`       | Combined filtered payload              |
| GET    | `/api/categories`         | List of all category names             |

All endpoints accept optional query params: `?from=YYYY-MM-DD&to=YYYY-MM-DD&category=Electronics`

---

## ✍️ Write-Up Answers

### 1. Monthly Revenue SQL Query

```sql
SELECT DATE_FORMAT(sold_on, '%b %Y') AS month,
       YEAR(sold_on)  AS yr,
       MONTH(sold_on) AS mo,
       SUM(total_amount) AS revenue
FROM sales
GROUP BY yr, mo, month
ORDER BY yr, mo
```

- **`DATE_FORMAT(sold_on, '%b %Y')`** — Converts a `DATE` column into a human-readable label like `"Aug 2025"`. `%b` = abbreviated month name, `%Y` = 4-digit year.
- **`GROUP BY YEAR(sold_on), MONTH(sold_on)`** — Collapses all individual sale rows that share the same year+month into a single aggregated row, then `SUM(total_amount)` adds up all their amounts.

---

### 2. How Charts Re-fetch on Filter Change

In `App.jsx`, filter values (`from`, `to`, `category`) are stored in React state. When the user clicks **Apply Filters**, the `applied` state updates. Every chart component receives `filters` as a prop and has:

```js
useEffect(() => {
  fetchData(filters);           // re-calls the API with new params
}, [filters.from, filters.to, filters.category]);
```

The **dependency array** `[filters.from, filters.to, filters.category]` is the key — React watches these three values. The moment any of them changes (i.e., when `applied` state updates in App.jsx), React re-runs the `useEffect` callback, which fires a new Axios GET request with the updated `?from=&to=&category=` query params. All 5 components share the same `applied` state, so they all re-fetch simultaneously.

---

### 3. Bar Chart vs Line Chart — When to Use Each

| | Bar Chart | Line Chart / Area Chart |
|---|---|---|
| **Best for** | Comparing discrete categories | Showing change over continuous time |
| **Example** | Revenue per region, revenue per category | Monthly revenue over 12 months |
| **Why** | Bars make magnitude comparison easy at a glance | Lines show trends and movement between time points |

**Rule of thumb:** If your X-axis is a *category* (Electronics, North, South…) → use Bar. If your X-axis is *time* (Jan, Feb, Mar…) → use Line/Area.

---

### 4. What Does ResponsiveContainer Do?

```jsx
<ResponsiveContainer width="100%" height={300}>
  <AreaChart data={data}>...</AreaChart>
</ResponsiveContainer>
```

Recharts charts need an **explicit pixel width and height** to render. Without `ResponsiveContainer`, you'd have to hard-code `width={800}` — which breaks on smaller screens.

`ResponsiveContainer` wraps the chart and listens to its parent element's size using a `ResizeObserver`. It automatically passes the correct `width` and `height` in pixels to the inner chart, re-rendering it whenever the browser window or container resizes.

**Why it's important:** It makes every chart fully responsive — the same dashboard looks correct on a 1440px desktop and a 375px mobile screen without any extra CSS.

---

## ✅ Features

- 📊 Area Chart — monthly revenue with gradient fill
- 📊 Bar Chart — revenue by category (vertical, coloured bars)  
- 🥧 Pie Chart — category share with % labels inside slices
- 📊 Horizontal Bar Chart — revenue by region
- 🏆 Top 5 Products leaderboard table with gold/silver/bronze medals
- 🔲 KPI Cards — Revenue, Orders, Avg Order Value, Best Product
- 🎛️ Filter Bar — date range + category filter updates all charts
- 🌙 Dark Mode toggle
- ⏳ Skeleton loaders while data fetches
- 📱 Responsive layout

---

## 👨‍💻 Tech Stack

- **Frontend:** React 18, Vite, Recharts, Axios
- **Backend:** Python 3, Flask, Flask-CORS
- **Database:** MySQL 8
