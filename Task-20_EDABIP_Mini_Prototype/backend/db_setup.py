import mysql.connector
import bcrypt
import random
from datetime import date, timedelta

DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "Srisudhan@1223"
}

# Connect without DB first
conn = mysql.connector.connect(**DB_CONFIG)
cur = conn.cursor()
cur.execute("CREATE DATABASE IF NOT EXISTS edabip_mini")
conn.commit()
cur.close()
conn.close()
print("Database edabip_mini created/verified")

# Connect with DB
conn = mysql.connector.connect(**DB_CONFIG, database="edabip_mini")
cur = conn.cursor()

# Create tables one by one
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','analyst','viewer') DEFAULT 'viewer',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")
print("users table OK")

cur.execute("""
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
)
""")
print("departments table OK")

cur.execute("""
CREATE TABLE IF NOT EXISTS metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    department_id INT NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,2) NOT NULL,
    recorded_on DATE NOT NULL,
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
)
""")
print("metrics table OK")

cur.execute("""
CREATE TABLE IF NOT EXISTS activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
""")
print("activity_log table OK")
conn.commit()

# Seed departments
depts = ["Sales", "Marketing", "HR", "Finance", "Operations"]
for d in depts:
    try:
        cur.execute("INSERT INTO departments (name) VALUES (%s)", (d,))
    except:
        pass
conn.commit()
cur.execute("SELECT id, name FROM departments")
dept_map = {name: did for did, name in cur.fetchall()}
print("Departments:", dept_map)

# Seed users
users_data = [
    ("Admin User",   "admin@edabip.com",   "password123", "admin"),
    ("Analyst User", "analyst@edabip.com", "password123", "analyst"),
    ("Viewer User",  "viewer@edabip.com",  "password123", "viewer"),
]
admin_id = None
for name, email, raw_pw, role in users_data:
    hashed = bcrypt.hashpw(raw_pw.encode(), bcrypt.gensalt()).decode()
    try:
        cur.execute(
            "INSERT INTO users (name,email,password,role) VALUES (%s,%s,%s,%s)",
            (name, email, hashed, role)
        )
        conn.commit()
        if role == "admin":
            admin_id = cur.lastrowid
    except Exception as e:
        if role == "admin":
            cur.execute("SELECT id FROM users WHERE email='admin@edabip.com'")
            admin_id = cur.fetchone()[0]
        print(f"User {email}: {e}")
if not admin_id:
    cur.execute("SELECT id FROM users WHERE email='admin@edabip.com'")
    admin_id = cur.fetchone()[0]
print(f"Admin user id: {admin_id}")

# Seed metrics - 300 records (5 depts x 5 metrics x 12 months)
metric_names_by_dept = {
    "Sales":      ["Revenue", "Units Sold", "New Clients", "Deals Closed", "Pipeline Value"],
    "Marketing":  ["Ad Spend", "Leads Generated", "Conversion Rate", "Impressions", "CTR"],
    "HR":         ["Headcount", "Attrition Rate", "Hires This Month", "Training Hours", "Satisfaction Score"],
    "Finance":    ["Operating Expense", "Net Profit", "Budget Utilization", "Cash Flow", "EBITDA"],
    "Operations": ["Tickets Resolved", "Uptime Percent", "Cost Per Unit", "SLA Breaches", "Throughput"],
}

today = date.today()
records = []
for dept_name, metrics in metric_names_by_dept.items():
    dept_id = dept_map[dept_name]
    for metric in metrics:
        for months_ago in range(12):
            first_of_month = today.replace(day=1)
            rec_date = (first_of_month - timedelta(days=30 * months_ago)).replace(day=random.randint(1, 28))
            value = round(random.uniform(1000, 100000), 2)
            records.append((dept_id, metric, value, rec_date, admin_id))

cur.executemany(
    "INSERT INTO metrics (department_id,metric_name,metric_value,recorded_on,uploaded_by) VALUES (%s,%s,%s,%s,%s)",
    records
)
conn.commit()
print(f"{len(records)} metric records inserted")

# Seed activity log
cur.execute(
    "INSERT INTO activity_log (user_id, action) VALUES (%s,%s)",
    (admin_id, "Admin seeded the database with 300 initial metric records.")
)
conn.commit()

cur.close()
conn.close()
print("Database fully seeded and ready!")
