"""
seed.py — Run once to populate the edabip_mini database.
Usage: python seed.py
"""
import mysql.connector
import bcrypt
import random
from datetime import date, timedelta

# ── DB connection ──────────────────────────────────────────────
conn = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="Srisudhan@1223",
    database="edabip_mini"
)
cur = conn.cursor()

# ── 1. Departments ─────────────────────────────────────────────
departments = ["Sales", "Marketing", "HR", "Finance", "Operations"]
cur.executemany(
    "INSERT IGNORE INTO departments (name) VALUES (%s)",
    [(d,) for d in departments]
)
conn.commit()

cur.execute("SELECT id, name FROM departments")
dept_map = {name: did for did, name in cur.fetchall()}
print("Departments seeded:", dept_map)

# ── 2. Users ───────────────────────────────────────────────────
users = [
    ("Admin User",    "admin@edabip.com",   "password123", "admin"),
    ("Analyst User",  "analyst@edabip.com", "password123", "analyst"),
    ("Viewer User",   "viewer@edabip.com",  "password123", "viewer"),
]
for name, email, raw_pw, role in users:
    hashed = bcrypt.hashpw(raw_pw.encode(), bcrypt.gensalt()).decode()
    try:
        cur.execute(
            "INSERT INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)",
            (name, email, hashed, role)
        )
    except mysql.connector.errors.IntegrityError:
        print(f"User {email} already exists — skipping.")
conn.commit()

cur.execute("SELECT id FROM users WHERE email='admin@edabip.com'")
admin_id = cur.fetchone()[0]
print("Admin user id:", admin_id)

# ── 3. Metrics (200+ records) ──────────────────────────────────
metric_names_by_dept = {
    "Sales":      ["Revenue", "Units Sold", "New Clients", "Deals Closed", "Pipeline Value"],
    "Marketing":  ["Ad Spend", "Leads Generated", "Conversion Rate", "Impressions", "Click-Through Rate"],
    "HR":         ["Headcount", "Attrition Rate", "Hires This Month", "Training Hours", "Employee Satisfaction"],
    "Finance":    ["Operating Expense", "Net Profit", "Budget Utilization", "Cash Flow", "EBITDA"],
    "Operations": ["Tickets Resolved", "Uptime Percent", "Cost Per Unit", "SLA Breach Count", "Throughput"],
}

today = date.today()
records = []
for dept_name, metrics in metric_names_by_dept.items():
    dept_id = dept_map[dept_name]
    for metric in metrics:
        # One entry per month for the last 12 months → 5 depts * 5 metrics * 12 months = 300 records
        for months_ago in range(12):
            rec_date = (today.replace(day=1) - timedelta(days=30 * months_ago))
            value = round(random.uniform(1000, 100000), 2)
            records.append((dept_id, metric, value, rec_date, admin_id))

cur.executemany(
    "INSERT INTO metrics (department_id, metric_name, metric_value, recorded_on, uploaded_by) "
    "VALUES (%s,%s,%s,%s,%s)",
    records
)
conn.commit()
print(f"{len(records)} metric records inserted.")

# ── 4. Activity log seed entries ──────────────────────────────
cur.execute(
    "INSERT INTO activity_log (user_id, action) VALUES (%s,%s)",
    (admin_id, "Admin seeded the database with initial data.")
)
conn.commit()
print("Activity log seeded.")

cur.close()
conn.close()
print("Done! Database is ready.")
