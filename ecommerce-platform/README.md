# ShopSphere – E-Commerce Platform

A full-stack E-Commerce Platform built with **React + Flask + MySQL**.

## 🛠 Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend  | Python 3, Flask, Flask-Bcrypt, Flask-CORS |
| Database | MySQL                               |
| State    | React Context API (Cart + Auth)     |

---

## 📁 Folder Structure

```
ecommerce-platform/
├── backend/
│   ├── app.py          ← Flask API
│   ├── seed.py         ← DB setup + seed data
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── context/    ← CartContext, AuthContext
        ├── pages/      ← All pages
        ├── components/ ← Navbar, Footer, ProductCard, Guards
        ├── api.js
        ├── App.jsx
        └── main.jsx
```

---

## ⚙️ Setup Instructions

### 1. MySQL Database

Make sure MySQL is running. Then run the seed script (it creates the DB + tables automatically):

```bash
cd backend
pip install -r requirements.txt
python seed.py
```

### 2. Start the Backend

```bash
cd backend
python app.py
```

Backend runs on: **http://localhost:5000**

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

---

## 🔑 Test Accounts

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@shopsphere.com         | admin123    |
| Customer | customer@shopsphere.com      | customer123 |

---

## 🛍️ Features

### Customer
- Browse products with search, category filter, and sort
- Product detail page with quantity selector
- Shopping cart (add, remove, update quantity)
- Checkout with delivery address
- Order history with status badges

### Admin
- Product management (add, edit, delete)
- Low stock warning badges
- All orders with inline status update
- Admin summary (total revenue, total orders)

---

## 📸 Full Demo Flow

1. Register as a customer → Browse products
2. Add items to cart → Proceed to checkout
3. Place order → View order history
4. Login as admin → Update order status
5. Edit/Add/Delete a product → Logout
