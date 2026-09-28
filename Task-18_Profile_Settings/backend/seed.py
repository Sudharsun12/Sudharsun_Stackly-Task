"""
seed.py  –  Database setup + 20 products across 5 categories
Run once:   python seed.py
"""
import sys
import mysql.connector
from flask_bcrypt import Bcrypt
from flask import Flask

sys.stdout.reconfigure(encoding='utf-8')

app    = Flask(__name__)
bcrypt = Bcrypt(app)

DB_CONFIG = {
    'host':     '127.0.0.1',
    'port':     3306,
    'user':     'root',
    'password': 'Srisudhan@1223',
}

# ─── Connect (no DB yet) + create database ────────────────────────────────────
conn   = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()
cursor.execute('CREATE DATABASE IF NOT EXISTS ecommerce')
cursor.execute('USE ecommerce')

# ─── Tables ───────────────────────────────────────────────────────────────────
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(100) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('admin','customer') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       DECIMAL(10,2) NOT NULL,
    stock       INT NOT NULL DEFAULT 0,
    category_id INT,
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS orders (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status       ENUM('Pending','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    address      TEXT NOT NULL,
    ordered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
)''')

conn.commit()
print('Tables ready.')

# ─── Users ────────────────────────────────────────────────────────────────────
admin_pw    = bcrypt.generate_password_hash('admin123').decode('utf-8')
customer_pw = bcrypt.generate_password_hash('customer123').decode('utf-8')

for u in [
    ('Admin User',    'admin@shopsphere.com',    admin_pw,    'admin'),
    ('Test Customer', 'customer@shopsphere.com', customer_pw, 'customer'),
]:
    cursor.execute(
        'INSERT IGNORE INTO users (name, email, password, role) VALUES (%s,%s,%s,%s)', u)
conn.commit()
print('Users seeded.')

# ─── Categories ───────────────────────────────────────────────────────────────
for c in ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports & Fitness']:
    cursor.execute('INSERT IGNORE INTO categories (name) VALUES (%s)', (c,))
conn.commit()

cursor.execute('SELECT id, name FROM categories')
cat = {r[1]: r[0] for r in cursor.fetchall()}
print('Categories:', list(cat.keys()))

# ─── Helper ───────────────────────────────────────────────────────────────────
def img(photo_id):
    return f'https://images.unsplash.com/photo-{photo_id}?w=400&h=300&fit=crop&auto=format'

# ─── 20 Products — all verified working images ────────────────────────────────
products = [

    # ELECTRONICS (6)
    ('Wireless Noise-Cancelling Headphones',
     'Premium over-ear headphones with 30h battery and active noise cancellation.',
     4999.00, 25, cat['Electronics'],
     img('1505740420928-5e560c06d30e')),           # Sony headphones

    ('Mechanical Gaming Keyboard',
     'RGB backlit keyboard with Cherry MX red switches and aluminium frame.',
     3499.00, 18, cat['Electronics'],
     img('1541140532154-b024d705b90a')),            # Mechanical keyboard

    ('4K Ultra HD Smart TV - 55"',
     'Crystal-clear 4K display with built-in Android TV and Dolby Vision.',
     42999.00, 10, cat['Electronics'],
     img('1593784991095-a205069470b6')),            # Wall-mounted Smart TV

    ('True Wireless Earbuds',
     'IPX5 waterproof earbuds with 24h total playback and touch controls.',
     1999.00, 40, cat['Electronics'],
     img('1572569511254-d8f925fe2cbb')),            # Earbuds in charging case

    ('Smartphone Wireless Charger 15W',
     '15W fast wireless charging pad compatible with all Qi-enabled devices.',
     999.00,  50, cat['Electronics'],
     img('1609091839311-d5365f9ff1c5')),            # Wireless charging pad

    ('Portable Bluetooth Speaker',
     '360 degree surround sound, 12h battery, IPX7 waterproof rating.',
     2299.00, 22, cat['Electronics'],
     img('1608043152269-423dbba4e7e1')),            # Bluetooth speaker

    # CLOTHING (5)
    ('Classic Fit Oxford Shirt',
     '100% cotton dress shirt, wrinkle-resistant, available in 6 colours.',
     899.00,  60, cat['Clothing'],
     img('1603252109303-2751441dd157')),            # Oxford shirt

    ('Slim-Fit Chino Trousers',
     'Stretch-cotton chinos, great for casual or smart office wear.',
     1299.00, 45, cat['Clothing'],
     img('1624378439575-d8705ad7ae80')),            # Chino trousers

    ("Women's Floral Kurta",
     'Lightweight cotton kurta with traditional block print, sizes XS-3XL.',
     699.00,  80, cat['Clothing'],
     img('1610030469983-98e550d6193c')),            # Indian kurta

    ("Men's Running Shorts",
     'Quick-dry polyester shorts with built-in liner and rear zip pocket.',
     549.00,  70, cat['Clothing'],
     img('1539185441755-769473a23570')),            # Running shorts

    ('Hooded Sweatshirt',
     'Fleece-lined hoodie with kangaroo pocket, unisex relaxed fit.',
     1099.00, 35, cat['Clothing'],
     img('1620799140408-edc6dcb6d633')),            # Grey pullover hoodie

    # BOOKS (4)
    ('Clean Code - Robert C. Martin',
     'The definitive guide to writing readable, maintainable, clean code.',
     549.00,  20, cat['Books'],
     img('1544716278-ca5e3f4abd8c')),               # Open coding book

    ('The Pragmatic Programmer',
     'Timeless wisdom for software craftsmen, from journeyman to master.',
     649.00,  15, cat['Books'],
     img('1589998059171-988d887df646')),            # Book on shelf

    ('Atomic Habits - James Clear',
     'A proven system for building good habits and breaking bad ones.',
     499.00,  30, cat['Books'],
     img('1512820790803-83ca734da794')),            # Atomic Habits cover

    ("You Don't Know JS - Kyle Simpson",
     'Deep dive into JavaScript: types, scopes, closures and async.',
     399.00,  25, cat['Books'],
     img('1579468118864-1b9ea3c0db4a')),            # JS programming book

    # HOME & KITCHEN (3)
    ('Stainless Steel Water Bottle 1L',
     'Double-wall vacuum insulated, keeps drinks cold 24h or hot 12h.',
     699.00,  55, cat['Home & Kitchen'],
     img('1602143407151-7111542de6e8')),            # Steel water bottle

    ('Non-Stick Cookware Set 5 Pcs',
     'Aluminium body with granite-coated non-stick surface, induction-ready.',
     2499.00, 12, cat['Home & Kitchen'],
     img('1556909114-f6e7ad7d3136')),               # Pots and pans

    ('Electric Kettle 1.7L',
     'Stainless steel kettle with auto shut-off and 360 degree swivel base, 1500W.',
     1299.00,  3, cat['Home & Kitchen'],            # LOW STOCK
     img('1544787219-7f47ccb76574')),               # Electric kettle

    # SPORTS & FITNESS (2)
    ('Premium Yoga Mat 6mm',
     'Non-slip TPE yoga mat with body alignment lines and carry strap.',
     999.00,  40, cat['Sports & Fitness'],
     img('1544367567-0f2fcb009e0b')),               # Yoga mat

    ('Resistance Bands Set 5 Levels',
     'Latex loop bands from 5 lb to 50 lb, includes mesh carry bag.',
     699.00,  50, cat['Sports & Fitness'],
     img('1598289431512-b97b0917affc')),            # Resistance bands
]

for p in products:
    cursor.execute(
        'INSERT IGNORE INTO products (name, description, price, stock, category_id, image_url) VALUES (%s,%s,%s,%s,%s,%s)',
        p)
conn.commit()
print(f'{len(products)} products seeded.')

cursor.close()
conn.close()

print()
print('======================================================')
print('  ShopSphere Database Seeded Successfully')
print('======================================================')
print('  Admin    -> admin@shopsphere.com    / admin123')
print('  Customer -> customer@shopsphere.com / customer123')
print(f'  Products -> {len(products)} across 5 categories')
print('======================================================')
