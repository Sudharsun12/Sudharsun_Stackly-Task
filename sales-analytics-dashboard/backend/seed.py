import mysql.connector
import random
from datetime import date, timedelta

# ──────────────────────────────────────────────
#  DB CONNECTION
# ──────────────────────────────────────────────
conn = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="Srisudhan@1223"
)
cursor = conn.cursor()

# ──────────────────────────────────────────────
#  CREATE DATABASE & TABLES
# ──────────────────────────────────────────────
cursor.execute("CREATE DATABASE IF NOT EXISTS sales_analytics")
cursor.execute("USE sales_analytics")

cursor.execute("""
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    category_id INT NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)
""")

cursor.execute("""
CREATE TABLE IF NOT EXISTS sales (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    product_id   INT NOT NULL,
    quantity     INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    sold_on      DATE NOT NULL,
    region       VARCHAR(50) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id)
)
""")

# ──────────────────────────────────────────────
#  CLEAR EXISTING DATA (safe re-run)
# ──────────────────────────────────────────────
cursor.execute("SET FOREIGN_KEY_CHECKS = 0")
cursor.execute("TRUNCATE TABLE sales")
cursor.execute("TRUNCATE TABLE products")
cursor.execute("TRUNCATE TABLE categories")
cursor.execute("SET FOREIGN_KEY_CHECKS = 1")

# ──────────────────────────────────────────────
#  SEED CATEGORIES  (5)
# ──────────────────────────────────────────────
categories = ["Electronics", "Clothing", "Food", "Books", "Sports"]
cursor.executemany(
    "INSERT INTO categories (name) VALUES (%s)",
    [(c,) for c in categories]
)

# ──────────────────────────────────────────────
#  SEED PRODUCTS  (15 — 3 per category)
# ──────────────────────────────────────────────
products = [
    # Electronics (cat_id=1)
    ("Laptop Pro 15",         1,  89999.00),
    ("Wireless Headphones",   1,   4999.00),
    ("Smartphone X12",        1,  59999.00),
    # Clothing (cat_id=2)
    ("Running Jacket",        2,   2499.00),
    ("Denim Jeans",           2,   1299.00),
    ("Formal Shirt Pack",     2,    999.00),
    # Food (cat_id=3)
    ("Organic Coffee 1kg",    3,    799.00),
    ("Protein Bars (12pk)",   3,    599.00),
    ("Olive Oil Premium",     3,    449.00),
    # Books (cat_id=4)
    ("Clean Code",            4,    499.00),
    ("The Pragmatic Programmer", 4, 549.00),
    ("Design Patterns",       4,    529.00),
    # Sports (cat_id=5)
    ("Yoga Mat Pro",          5,   1299.00),
    ("Dumbell Set 20kg",      5,   3499.00),
    ("Cycling Helmet",        5,   2199.00),
]
cursor.executemany(
    "INSERT INTO products (name, category_id, price) VALUES (%s, %s, %s)",
    products
)

# ──────────────────────────────────────────────
#  SEED SALES  (250+ records over last 12 months)
# ──────────────────────────────────────────────
regions      = ["North", "South", "East", "West"]
today        = date.today()
start_date   = today - timedelta(days=365)

random.seed(42)   # reproducible

sales_rows = []
for _ in range(280):
    product_id = random.randint(1, 15)
    quantity   = random.randint(1, 10)
    # Look up price from products list (0-indexed)
    price      = products[product_id - 1][2]
    total      = round(price * quantity, 2)
    days_ago   = random.randint(0, 365)
    sold_on    = today - timedelta(days=days_ago)
    region     = random.choice(regions)
    sales_rows.append((product_id, quantity, total, sold_on, region))

cursor.executemany(
    "INSERT INTO sales (product_id, quantity, total_amount, sold_on, region) VALUES (%s,%s,%s,%s,%s)",
    sales_rows
)

conn.commit()
cursor.close()
conn.close()

print("[OK] Database seeded successfully!")
print(f"     Categories : {len(categories)}")
print(f"     Products   : {len(products)}")
print(f"     Sales      : {len(sales_rows)}")
