# Task 19 — Real-Time Notifications (WebSockets)

**ShopSphere E-Commerce Platform** | Full Stack — Flask + React + Socket.IO

> When a customer places an order, the admin sees a 🔔 notification badge appear **instantly** in the navbar — without refreshing the page.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.x, Flask, Flask-SocketIO, Flask-CORS, Flask-Bcrypt |
| Database | MySQL |
| Frontend | React 18, Vite, socket.io-client |
| Real-time | Socket.IO (HTTP long-polling / WebSocket) |

---

## 📁 Project Structure

```
Task-19_Real_Time_Notifications/
├── backend/
│   ├── app.py              # Flask server with SocketIO + all API routes
│   ├── requirements.txt    # Python dependencies
│   └── static/
│       └── uploads/        # Profile avatar images
└── frontend/
    ├── src/
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Login/logout state
    │   │   ├── CartContext.jsx      # Cart state
    │   │   └── SocketContext.jsx    # WebSocket connection + notifications ← NEW
    │   ├── components/
    │   │   ├── Navbar.jsx           # Updated — includes NotificationBell
    │   │   └── NotificationBell.jsx # Bell icon + badge + dropdown ← NEW
    │   └── pages/                   # All existing pages (Home, Cart, Orders, etc.)
    ├── package.json
    └── vite.config.js
```

---

## 🗄 Database Setup

### Step 1 — Create the MySQL database (if not already created)

```sql
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
```

### Step 2 — Create all tables

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,
    role       ENUM('customer', 'admin') DEFAULT 'customer',
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL,
    stock       INT DEFAULT 0,
    category_id INT,
    image_url   VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    address      TEXT NOT NULL,
    status       ENUM('Pending','Confirmed','Shipped','Delivered','Cancelled') DEFAULT 'Pending',
    ordered_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    order_id   INT NOT NULL,
    product_id INT NOT NULL,
    quantity   INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id)   REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Notifications table (NEW in Task 19)
CREATE TABLE IF NOT EXISTS notifications (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    message    VARCHAR(255) NOT NULL,
    type       ENUM('order', 'info', 'alert') DEFAULT 'info',
    is_read    BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Step 3 — Create an admin user

```sql
-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES (
    'Admin',
    'admin@shopsphere.com',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0oEBj.DW5u',
    'admin'
);
```

> **Note:** To generate your own hashed password:
> ```python
> from flask_bcrypt import Bcrypt
> bcrypt = Bcrypt()
> print(bcrypt.generate_password_hash('yourpassword').decode('utf-8'))
> ```

---

## 🚀 How to Run

### Backend

```bash
# 1. Navigate to backend folder
cd Task-19_Real_Time_Notifications/backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Update MySQL credentials in app.py (line ~35)
#    host, port, user, password, database

# 4. Run the server
python app.py
```

Expected output:
```
Server initialized for threading.
 * Running on http://127.0.0.1:5000
```

### Frontend

```bash
# 1. Navigate to frontend folder
cd Task-19_Real_Time_Notifications/frontend

# 2. Install dependencies
npm install

# 3. Install socket.io-client
npm install socket.io-client

# 4. Start the dev server
npm run dev
```

Expected output:
```
Local:   http://localhost:5173/
```

---

## 🧪 How to Test Real-Time Notifications

**Important:** Both tabs must be in separate browser sessions (different cookies).

| Tab | Browser | URL |
|-----|---------|-----|
| Admin | Chrome — normal window | `http://localhost:5173` |
| Customer | Chrome — **Guest profile** (click profile icon → Guest) | `http://localhost:5173` |

**Steps:**
1. In Chrome normal → login as **admin**
2. In Chrome Guest → login as **customer**
3. In Customer tab: add items to cart → checkout → place order
4. In Admin tab: watch 🔔 bell badge appear instantly
5. Click the bell → dropdown shows the notification
6. Click notification → badge clears, marked as read

---

## 🌐 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | Login |
| GET | `/api/logout` | Logout |
| GET | `/api/me` | Get current user |
| PUT | `/api/me` | Update name/email |
| PUT | `/api/me/password` | Change password |
| POST | `/api/upload/avatar` | Upload profile picture |

### Products & Orders
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Add product (admin) |
| PUT | `/api/products/<id>` | Update product (admin) |
| DELETE | `/api/products/<id>` | Delete product (admin) |
| POST | `/api/orders` | Place order (customer) |
| GET | `/api/orders/my` | My orders (customer) |
| GET | `/api/orders` | All orders (admin) |
| PUT | `/api/orders/<id>/status` | Update order status (admin) |
| GET | `/api/admin/summary` | Dashboard stats (admin) |

### Notifications (NEW — Task 19)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/notifications` | Get all notifications for logged-in user |
| PUT | `/api/notifications/<id>/read` | Mark one as read |
| PUT | `/api/notifications/read-all` | Mark all as read |
| DELETE | `/api/notifications/<id>` | Delete one notification |
| GET | `/api/test-notify` | Send test notification to admins room |

### Socket.IO Events
| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join` | `{ user_id, role }` |
| Server → Client | `joined` | `{ room, role }` |
| Server → Client | `new_notification` | `{ message, type, order_id }` |

---

## ✨ Features

### Core Features
- 🔔 Real-time notification bell in navbar
- 🔴 Animated unread count badge
- 📋 Notification dropdown (last 10 notifications)
- ✅ Mark individual notification as read
- ✅ Mark all notifications as read
- 🗑 Delete individual notifications
- 💾 Notifications persist in database (survive page refresh)
- ⏰ Relative timestamps ("2 min ago", "1 hr ago")

### Bonus Features
- ⚠️ **Low stock alert** — auto-fires when product stock drops to ≤ 5
- 🔊 **Sound alert** — synthesized audio ping via Web Audio API
- 🖥️ **Browser push notification** — native OS popup when tab is hidden
- 🌙 **Dark mode** — full dark mode support

---

## 📖 How WebSockets Work (Concept)

```
HTTP (before Task 19):
  Browser ──── POST /api/orders ───▶ Server
  Browser ◀─── 201 Created ─────── Server
  [Connection CLOSES — server can never reach browser again]

WebSocket / Polling (Task 19):
  Browser ──── connect to socket.io ───▶ Server
  [Connection STAYS OPEN]
  Server ──── new_notification ────────▶ Admin Browser
  [No request needed — server pushes instantly!]
```

**Socket.IO Rooms:** Admins join a room called `'admins'`. When an order is placed, the server emits only to that room — customers never receive it.

---

## 👨‍💻 Author

**Sudharsun**
Stackly Internship — Task 19
Submitted: 1st October 2026
