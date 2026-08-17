from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from datetime import date, timedelta

app = Flask(__name__)
CORS(app)

# ──────────────────────────────────────────────
#  DB CONNECTION HELPER
# ──────────────────────────────────────────────
def get_db():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="Srisudhan@1223",
        database="sales_analytics"
    )

# ──────────────────────────────────────────────
#  FILTER HELPERS
# ──────────────────────────────────────────────
def build_filter_clause(params, alias="s"):
    """Returns (where_clause_str, values_list) from request.args."""
    conditions = []
    values     = []

    from_date = params.get("from")
    to_date   = params.get("to")
    category  = params.get("category")

    if from_date:
        conditions.append(f"{alias}.sold_on >= %s")
        values.append(from_date)
    if to_date:
        conditions.append(f"{alias}.sold_on <= %s")
        values.append(to_date)
    if category and category != "all":
        conditions.append("c.name = %s")
        values.append(category)

    clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""
    return clause, values

# ──────────────────────────────────────────────
#  GET /api/kpis
# ──────────────────────────────────────────────
@app.route("/api/kpis")
def kpis():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    params       = request.args
    from_date    = params.get("from")
    to_date      = params.get("to")
    category_filter = params.get("category")

    conditions = ["1=1"]
    values     = []
    if from_date:
        conditions.append("s.sold_on >= %s"); values.append(from_date)
    if to_date:
        conditions.append("s.sold_on <= %s"); values.append(to_date)
    if category_filter and category_filter != "all":
        conditions.append("c.name = %s"); values.append(category_filter)

    where = "WHERE " + " AND ".join(conditions)

    # Total revenue & orders & avg
    cursor.execute(f"""
        SELECT
            COALESCE(SUM(s.total_amount), 0) AS total_revenue,
            COUNT(s.id)                       AS total_orders,
            COALESCE(AVG(s.total_amount), 0)  AS avg_order_value
        FROM sales s
        JOIN products p  ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
    """, values)
    summary = cursor.fetchone()

    # Best selling product by units
    cursor.execute(f"""
        SELECT p.name AS product_name, SUM(s.quantity) AS units_sold
        FROM sales s
        JOIN products p  ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
        GROUP BY p.name
        ORDER BY units_sold DESC
        LIMIT 1
    """, values)
    best = cursor.fetchone()

    cursor.close()
    conn.close()

    return jsonify({
        "total_revenue"   : float(summary["total_revenue"]),
        "total_orders"    : summary["total_orders"],
        "avg_order_value" : round(float(summary["avg_order_value"]), 2),
        "best_product"    : best["product_name"] if best else "N/A",
        "best_units_sold" : best["units_sold"]    if best else 0,
    })

# ──────────────────────────────────────────────
#  GET /api/sales/monthly
# ──────────────────────────────────────────────
@app.route("/api/sales/monthly")
def sales_monthly():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    params   = request.args
    from_date = params.get("from")
    to_date   = params.get("to")
    category  = params.get("category")

    conditions = ["1=1"]
    values     = []
    if from_date:
        conditions.append("s.sold_on >= %s"); values.append(from_date)
    if to_date:
        conditions.append("s.sold_on <= %s"); values.append(to_date)
    if category and category != "all":
        conditions.append("c.name = %s"); values.append(category)

    where = "WHERE " + " AND ".join(conditions)

    cursor.execute(f"""
        SELECT DATE_FORMAT(s.sold_on, '%b %Y') AS month,
               YEAR(s.sold_on)  AS yr,
               MONTH(s.sold_on) AS mo,
               SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p   ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
        GROUP BY yr, mo, month
        ORDER BY yr, mo
    """, values)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"month": r["month"], "revenue": float(r["revenue"])}
        for r in rows
    ])

# ──────────────────────────────────────────────
#  GET /api/sales/by-category
# ──────────────────────────────────────────────
@app.route("/api/sales/by-category")
def sales_by_category():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    params    = request.args
    from_date = params.get("from")
    to_date   = params.get("to")
    category  = params.get("category")

    conditions = ["1=1"]
    values     = []
    if from_date:
        conditions.append("s.sold_on >= %s"); values.append(from_date)
    if to_date:
        conditions.append("s.sold_on <= %s"); values.append(to_date)
    if category and category != "all":
        conditions.append("c.name = %s"); values.append(category)

    where = "WHERE " + " AND ".join(conditions)

    cursor.execute(f"""
        SELECT c.name AS category, SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p   ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
        GROUP BY c.name
        ORDER BY revenue DESC
    """, values)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"category": r["category"], "revenue": float(r["revenue"])}
        for r in rows
    ])

# ──────────────────────────────────────────────
#  GET /api/sales/by-region
# ──────────────────────────────────────────────
@app.route("/api/sales/by-region")
def sales_by_region():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    params    = request.args
    from_date = params.get("from")
    to_date   = params.get("to")
    category  = params.get("category")

    conditions = ["1=1"]
    values     = []
    if from_date:
        conditions.append("s.sold_on >= %s"); values.append(from_date)
    if to_date:
        conditions.append("s.sold_on <= %s"); values.append(to_date)
    if category and category != "all":
        conditions.append("c.name = %s"); values.append(category)

    where = "WHERE " + " AND ".join(conditions)

    cursor.execute(f"""
        SELECT s.region, SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p   ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
        GROUP BY s.region
        ORDER BY revenue DESC
    """, values)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {"region": r["region"], "revenue": float(r["revenue"])}
        for r in rows
    ])

# ──────────────────────────────────────────────
#  GET /api/sales/top-products
# ──────────────────────────────────────────────
@app.route("/api/sales/top-products")
def top_products():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)

    params    = request.args
    from_date = params.get("from")
    to_date   = params.get("to")
    category  = params.get("category")

    conditions = ["1=1"]
    values     = []
    if from_date:
        conditions.append("s.sold_on >= %s"); values.append(from_date)
    if to_date:
        conditions.append("s.sold_on <= %s"); values.append(to_date)
    if category and category != "all":
        conditions.append("c.name = %s"); values.append(category)

    where = "WHERE " + " AND ".join(conditions)

    cursor.execute(f"""
        SELECT
            p.name          AS product,
            c.name          AS category,
            SUM(s.quantity) AS units_sold,
            SUM(s.total_amount) AS revenue
        FROM sales s
        JOIN products p   ON s.product_id = p.id
        JOIN categories c ON p.category_id = c.id
        {where}
        GROUP BY p.name, c.name
        ORDER BY revenue DESC
        LIMIT 5
    """, values)

    rows = cursor.fetchall()
    cursor.close()
    conn.close()

    return jsonify([
        {
            "rank"      : i + 1,
            "product"   : r["product"],
            "category"  : r["category"],
            "units_sold": r["units_sold"],
            "revenue"   : float(r["revenue"]),
        }
        for i, r in enumerate(rows)
    ])

# ──────────────────────────────────────────────
#  GET /api/sales/filter  (combined summary)
# ──────────────────────────────────────────────
@app.route("/api/sales/filter")
def sales_filter():
    """Returns a combined payload used to update all charts at once."""
    return jsonify({
        "kpis"       : kpis().get_json(),
        "monthly"    : sales_monthly().get_json(),
        "by_category": sales_by_category().get_json(),
        "by_region"  : sales_by_region().get_json(),
        "top_products": top_products().get_json(),
    })

# ──────────────────────────────────────────────
#  GET /api/categories  (for dropdown)
# ──────────────────────────────────────────────
@app.route("/api/categories")
def categories():
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT name FROM categories ORDER BY name")
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify([r["name"] for r in rows])

# ──────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5000)
