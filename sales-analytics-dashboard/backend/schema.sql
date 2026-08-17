-- ============================================================
--  Task 11 — Sales Analytics Dashboard
--  Database Schema + Sample Queries
--  Author : Sudharsun A
-- ============================================================

CREATE DATABASE IF NOT EXISTS sales_analytics;
USE sales_analytics;

-- ─────────────────────────────────────────────
--  TABLE 1 : categories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- ─────────────────────────────────────────────
--  TABLE 2 : products
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- ─────────────────────────────────────────────
--  TABLE 3 : sales
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    product_id   INT NOT NULL,
    quantity     INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    sold_on      DATE NOT NULL,
    region       VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ============================================================
--  VERIFY DATA (run after seed.py)
-- ============================================================

-- Check row counts
SELECT 'categories' AS table_name, COUNT(*) AS total FROM categories
UNION ALL
SELECT 'products',  COUNT(*) FROM products
UNION ALL
SELECT 'sales',     COUNT(*) FROM sales;

-- ─────────────────────────────────────────────
--  ANALYTICS QUERIES (same as Flask endpoints)
-- ─────────────────────────────────────────────

-- 1. KPIs — Total Revenue, Orders, Avg Order Value
SELECT
    SUM(total_amount)  AS total_revenue,
    COUNT(id)          AS total_orders,
    AVG(total_amount)  AS avg_order_value
FROM sales;

-- 2. Best Selling Product (by units)
SELECT p.name AS product, SUM(s.quantity) AS units_sold
FROM sales s
JOIN products p ON s.product_id = p.id
GROUP BY p.name
ORDER BY units_sold DESC
LIMIT 1;

-- 3. Monthly Revenue (last 12 months)
SELECT DATE_FORMAT(sold_on, '%b %Y') AS month,
       YEAR(sold_on)  AS yr,
       MONTH(sold_on) AS mo,
       SUM(total_amount) AS revenue
FROM sales
GROUP BY yr, mo, month
ORDER BY yr, mo;

-- 4. Revenue by Category
SELECT c.name AS category, SUM(s.total_amount) AS revenue
FROM sales s
JOIN products p   ON s.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY c.name
ORDER BY revenue DESC;

-- 5. Revenue by Region
SELECT region, SUM(total_amount) AS revenue
FROM sales
GROUP BY region
ORDER BY revenue DESC;

-- 6. Top 5 Products by Revenue
SELECT
    p.name          AS product,
    c.name          AS category,
    SUM(s.quantity) AS units_sold,
    SUM(s.total_amount) AS revenue
FROM sales s
JOIN products p   ON s.product_id = p.id
JOIN categories c ON p.category_id = c.id
GROUP BY p.name, c.name
ORDER BY revenue DESC
LIMIT 5;

-- 7. Filter Example — Electronics sales in 2025
SELECT p.name, s.sold_on, s.total_amount, s.region
FROM sales s
JOIN products p   ON s.product_id = p.id
JOIN categories c ON p.category_id = c.id
WHERE c.name = 'Electronics'
  AND s.sold_on BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY s.sold_on;
