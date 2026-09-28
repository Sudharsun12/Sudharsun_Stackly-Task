from flask import Flask, request, session, jsonify, send_from_directory
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
import os
import uuid

app = Flask(__name__)
app.secret_key = 'shopsphere_secret_key_2026'

# ─── Upload folder setup ───────────────────────────────────────────────────────
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

CORS(app, supports_credentials=True, origins=[
    'http://localhost:5173', 'http://127.0.0.1:5173',
    'http://localhost:5174', 'http://127.0.0.1:5174',
    'http://localhost:5175', 'http://127.0.0.1:5175'
])

bcrypt = Bcrypt(app)

def get_db():
    return mysql.connector.connect(
        host='127.0.0.1',
        port=3306,
        user='root',
        password='Srisudhan@1223',
        database='ecommerce'
    )

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ─── Serve uploaded files ──────────────────────────────────────────────────────
@app.route('/static/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ─── AUTH ──────────────────────────────────────────────────────────────────────

@app.route('/api/register', methods=['POST'])
def register():
    data     = request.get_json()
    name     = data.get('name', '').strip()
    email    = data.get('email', '').strip()
    password = data.get('password', '')

    if not name or not email or not password:
        return jsonify({'error': 'All fields are required'}), 400

    hashed = bcrypt.generate_password_hash(password).decode('utf-8')
    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            'INSERT INTO users (name, email, password) VALUES (%s, %s, %s)',
            (name, email, hashed)
        )
        db.commit()
        user_id = cursor.lastrowid
        session['user_id'] = user_id
        session['role']    = 'customer'
        session['name']    = name
        return jsonify({'message': 'Registered successfully',
                        'user': {'id': user_id, 'name': name, 'role': 'customer'}}), 201
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Email already registered'}), 400
    finally:
        cursor.close()
        db.close()


@app.route('/api/login', methods=['POST'])
def login():
    data  = request.get_json()
    email = data.get('email', '').strip()
    pw    = data.get('password', '')

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
    user = cursor.fetchone()
    cursor.close()
    db.close()

    if not user or not bcrypt.check_password_hash(user['password'], pw):
        return jsonify({'error': 'Invalid email or password'}), 401

    session['user_id'] = user['id']
    session['role']    = user['role']
    session['name']    = user['name']
    return jsonify({'user': {
        'id':         user['id'],
        'name':       user['name'],
        'email':      user['email'],
        'role':       user['role'],
        'avatar_url': user.get('avatar_url'),
        'created_at': str(user.get('created_at', ''))
    }})


@app.route('/api/logout')
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'})


# ─── GET /api/me — return full user profile ───────────────────────────────────
@app.route('/api/me')
def me():
    if 'user_id' not in session:
        return jsonify({'user': None})
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(
        'SELECT id, name, email, role, avatar_url, created_at FROM users WHERE id = %s',
        (session['user_id'],)
    )
    user = cursor.fetchone()
    cursor.close()
    db.close()
    if user and user.get('created_at'):
        user['created_at'] = str(user['created_at'])
    return jsonify({'user': user})


# ─── PUT /api/me — update name & email ────────────────────────────────────────
@app.route('/api/me', methods=['PUT'])
def update_profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401

    data  = request.get_json()
    name  = data.get('name', '').strip()
    email = data.get('email', '').strip()

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    try:
        cursor.execute(
            'UPDATE users SET name=%s, email=%s WHERE id=%s',
            (name, email, session['user_id'])
        )
        db.commit()
        # Update session name so Navbar reflects immediately on server side
        session['name'] = name
        return jsonify({'message': 'Profile updated', 'name': name, 'email': email}), 200
    except mysql.connector.IntegrityError:
        return jsonify({'error': 'Email already in use by another account'}), 409
    finally:
        cursor.close()
        db.close()


# ─── PUT /api/me/password — change password ───────────────────────────────────
@app.route('/api/me/password', methods=['PUT'])
def change_password():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401

    data     = request.get_json()
    current  = data.get('current_password', '')
    new_pass = data.get('new_password', '')
    confirm  = data.get('confirm_password', '')

    if not current or not new_pass or not confirm:
        return jsonify({'error': 'All password fields are required'}), 400

    if new_pass != confirm:
        return jsonify({'error': 'New passwords do not match'}), 400

    if len(new_pass) < 6:
        return jsonify({'error': 'Password must be at least 6 characters'}), 400

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE id=%s', (session['user_id'],))
    user = cursor.fetchone()

    if not bcrypt.check_password_hash(user['password'], current):
        cursor.close()
        db.close()
        return jsonify({'error': 'Current password is incorrect'}), 401

    hashed = bcrypt.generate_password_hash(new_pass).decode('utf-8')
    cursor.execute(
        'UPDATE users SET password=%s WHERE id=%s',
        (hashed, session['user_id'])
    )
    db.commit()
    cursor.close()
    db.close()
    return jsonify({'message': 'Password changed successfully'}), 200


# ─── POST /api/upload/avatar — upload profile picture ─────────────────────────
@app.route('/api/upload/avatar', methods=['POST'])
def upload_avatar():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401

    if 'avatar' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['avatar']

    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use PNG, JPG, GIF or WebP'}), 400

    # Generate unique filename
    ext      = file.filename.rsplit('.', 1)[1].lower()
    filename = f"avatar_{session['user_id']}_{uuid.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    avatar_url = f"/static/uploads/{filename}"

    # Save URL to database
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'UPDATE users SET avatar_url=%s WHERE id=%s',
        (avatar_url, session['user_id'])
    )
    db.commit()
    cursor.close()
    db.close()

    return jsonify({'message': 'Avatar uploaded', 'avatar_url': avatar_url}), 200


# ─── CATEGORIES ────────────────────────────────────────────────────────────────

@app.route('/api/categories')
def get_categories():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT * FROM categories ORDER BY name')
    cats = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(cats)


# ─── PRODUCTS (PUBLIC) ─────────────────────────────────────────────────────────

@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category', '')
    search   = request.args.get('search', '')
    sort     = request.args.get('sort', 'newest')

    query  = '''SELECT p.*, c.name AS category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                WHERE 1=1'''
    params = []

    if category:
        query += ' AND c.name = %s'
        params.append(category)
    if search:
        query += ' AND (p.name LIKE %s OR p.description LIKE %s)'
        params.extend([f'%{search}%', f'%{search}%'])

    if sort == 'price_asc':
        query += ' ORDER BY p.price ASC'
    elif sort == 'price_desc':
        query += ' ORDER BY p.price DESC'
    else:
        query += ' ORDER BY p.created_at DESC'

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute(query, params)
    products = cursor.fetchall()
    for p in products:
        p['price']      = float(p['price'])
        p['created_at'] = str(p['created_at'])
    cursor.close()
    db.close()
    return jsonify(products)


@app.route('/api/products/<int:pid>', methods=['GET'])
def get_product(pid):
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''SELECT p.*, c.name AS category_name
                      FROM products p
                      LEFT JOIN categories c ON p.category_id = c.id
                      WHERE p.id = %s''', (pid,))
    product = cursor.fetchone()
    cursor.close()
    db.close()
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    product['price']      = float(product['price'])
    product['created_at'] = str(product['created_at'])
    return jsonify(product)


# ─── PRODUCTS (ADMIN) ──────────────────────────────────────────────────────────

@app.route('/api/products', methods=['POST'])
def add_product():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''INSERT INTO products (name, description, price, stock, category_id, image_url)
                      VALUES (%s, %s, %s, %s, %s, %s)''',
                   (data['name'], data.get('description', ''), data['price'],
                    data['stock'], data.get('category_id'), data.get('image_url', '')))
    db.commit()
    pid = cursor.lastrowid
    cursor.close()
    db.close()
    return jsonify({'message': 'Product added', 'id': pid}), 201


@app.route('/api/products/<int:pid>', methods=['PUT'])
def update_product(pid):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    data = request.get_json()
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''UPDATE products
                      SET name=%s, description=%s, price=%s, stock=%s,
                          category_id=%s, image_url=%s
                      WHERE id=%s''',
                   (data['name'], data.get('description', ''), data['price'],
                    data['stock'], data.get('category_id'), data.get('image_url', ''), pid))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({'message': 'Product updated'})


@app.route('/api/products/<int:pid>', methods=['DELETE'])
def delete_product(pid):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    db = get_db()
    cursor = db.cursor()
    cursor.execute('DELETE FROM products WHERE id = %s', (pid,))
    db.commit()
    cursor.close()
    db.close()
    return jsonify({'message': 'Product deleted'})


# ─── ORDERS (CUSTOMER) ─────────────────────────────────────────────────────────

@app.route('/api/orders', methods=['POST'])
def place_order():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401

    data    = request.get_json()
    items   = data.get('items', [])
    address = data.get('address', '').strip()

    if not items or not address:
        return jsonify({'error': 'Items and address are required'}), 400

    db     = get_db()
    cursor = db.cursor(dictionary=True)

    for item in items:
        cursor.execute('SELECT name, stock FROM products WHERE id = %s', (item['product_id'],))
        product = cursor.fetchone()
        if not product:
            cursor.close(); db.close()
            return jsonify({'error': f'Product ID {item["product_id"]} not found'}), 400
        if product['stock'] < item['quantity']:
            cursor.close(); db.close()
            return jsonify({
                'error': (f'"{product["name"]}" only has {product["stock"]} unit(s) in stock. '
                          f'You requested {item["quantity"]}.')
            }), 400

    total    = 0
    enriched = []
    for item in items:
        cursor.execute('SELECT price FROM products WHERE id = %s', (item['product_id'],))
        p          = cursor.fetchone()
        unit_price = float(p['price'])
        total     += unit_price * item['quantity']
        enriched.append({**item, 'unit_price': unit_price})

    cursor2 = db.cursor()
    cursor2.execute('INSERT INTO orders (user_id, total_amount, address) VALUES (%s, %s, %s)',
                    (session['user_id'], total, address))
    order_id = cursor2.lastrowid

    for item in enriched:
        cursor2.execute(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (%s,%s,%s,%s)',
            (order_id, item['product_id'], item['quantity'], item['unit_price'])
        )
        cursor2.execute('UPDATE products SET stock = stock - %s WHERE id = %s',
                        (item['quantity'], item['product_id']))

    db.commit()
    cursor.close(); cursor2.close(); db.close()
    return jsonify({'message': 'Order placed successfully', 'order_id': order_id}), 201


@app.route('/api/orders/my')
def my_orders():
    if 'user_id' not in session:
        return jsonify({'error': 'Login required'}), 401

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''SELECT id, total_amount, status, address, ordered_at
                      FROM orders WHERE user_id = %s ORDER BY ordered_at DESC''',
                   (session['user_id'],))
    orders = cursor.fetchall()
    for order in orders:
        cursor.execute('''SELECT oi.quantity, oi.unit_price, p.name AS product_name
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          WHERE oi.order_id = %s''', (order['id'],))
        order['items']        = cursor.fetchall()
        order['ordered_at']   = str(order['ordered_at'])
        order['total_amount'] = float(order['total_amount'])
        for itm in order['items']:
            itm['unit_price'] = float(itm['unit_price'])
    cursor.close(); db.close()
    return jsonify(orders)


# ─── ORDERS (ADMIN) ────────────────────────────────────────────────────────────

@app.route('/api/orders')
def all_orders():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403

    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('''SELECT o.id, o.total_amount, o.status, o.address, o.ordered_at,
                             u.name AS customer_name, u.email AS customer_email
                      FROM orders o
                      JOIN users u ON o.user_id = u.id
                      ORDER BY o.ordered_at DESC''')
    orders = cursor.fetchall()
    for order in orders:
        cursor.execute('''SELECT oi.quantity, oi.unit_price, p.name AS product_name
                          FROM order_items oi
                          JOIN products p ON oi.product_id = p.id
                          WHERE oi.order_id = %s''', (order['id'],))
        order['items']        = cursor.fetchall()
        order['ordered_at']   = str(order['ordered_at'])
        order['total_amount'] = float(order['total_amount'])
        for itm in order['items']:
            itm['unit_price'] = float(itm['unit_price'])
    cursor.close(); db.close()
    return jsonify(orders)


@app.route('/api/orders/<int:oid>/status', methods=['PUT'])
def update_order_status(oid):
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    data   = request.get_json()
    status = data.get('status')
    valid  = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled']
    if status not in valid:
        return jsonify({'error': 'Invalid status'}), 400
    db = get_db()
    cursor = db.cursor()
    cursor.execute('UPDATE orders SET status = %s WHERE id = %s', (status, oid))
    db.commit()
    cursor.close(); db.close()
    return jsonify({'message': 'Status updated'})


# ─── ADMIN SUMMARY ─────────────────────────────────────────────────────────────

@app.route('/api/admin/summary')
def admin_summary():
    if session.get('role') != 'admin':
        return jsonify({'error': 'Forbidden'}), 403
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute('SELECT COUNT(*) AS total_orders, SUM(total_amount) AS total_revenue FROM orders')
    summary = cursor.fetchone()
    cursor.execute('''SELECT p.name, SUM(oi.quantity) AS total_sold,
                             SUM(oi.quantity * oi.unit_price) AS revenue
                      FROM order_items oi
                      JOIN products p ON oi.product_id = p.id
                      GROUP BY p.id, p.name
                      ORDER BY total_sold DESC LIMIT 5''')
    top_products = cursor.fetchall()
    for tp in top_products:
        tp['revenue'] = float(tp['revenue'])
    cursor.close(); db.close()
    return jsonify({
        'total_orders':  summary['total_orders'],
        'total_revenue': float(summary['total_revenue'] or 0),
        'top_products':  top_products
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)
