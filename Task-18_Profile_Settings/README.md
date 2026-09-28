# Task 18 — User Profile & Settings Page
**Type:** Full Stack — React + Flask + MySQL  
**Done By:** Sudharsun A  
**Deadline:** 28th September 2026  
**Base Project:** Task 12 — ShopSphere E-Commerce

---

## 📌 Overview

This task upgrades the **Task 12 ShopSphere E-Commerce** application by adding a complete **User Profile & Settings** page. Before this task, logged-in users had no way to view or edit their own details. Task 18 adds:

- ✅ View current profile (name, email, avatar, member since)
- ✅ Upload and update profile picture (with preview before upload)
- ✅ Edit name and email — Navbar updates instantly on save
- ✅ Change password securely (verifies current password first)
- ✅ Navbar shows avatar / initials circle + name — updates immediately
- ✅ Works correctly in both Light and Dark mode

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, Flask-Bcrypt, Flask-CORS, mysql-connector-python |
| Frontend | React (Vite), Axios, React Router DOM, React Context API |
| Database | MySQL (`ecommerce` database) |

---

## 📁 Project Structure

```
Task-18_Profile_Settings/
├── Profile_Settings_Writeup.txt         → Full write-up (implementation + Q&A)
├── README.md
│
├── backend/
│   ├── app.py                           → Flask backend (with 4 new routes)
│   ├── requirements.txt                 → Python dependencies
│   └── seed.py                          → Database seed data
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx                      → Routes including /profile
        ├── api.js                       → Axios base config
        ├── index.css                    → All styles (light + dark mode)
        ├── main.jsx
        ├── context/
        │   ├── AuthContext.jsx          → Auth state + updateUser()
        │   └── CartContext.jsx
        ├── components/
        │   ├── Navbar.jsx               → Avatar/initials + My Profile link
        │   ├── Footer.jsx
        │   ├── ProtectedRoute.jsx
        │   ├── AdminRoute.jsx
        │   └── ProductCard.jsx
        └── pages/
            ├── ProfilePage.jsx          → NEW — 3-section profile page
            ├── Home.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── Cart.jsx
            ├── Checkout.jsx
            ├── Orders.jsx
            ├── ProductDetail.jsx
            └── admin/
                ├── AdminProducts.jsx
                ├── AdminOrders.jsx
                └── ProductForm.jsx
```

---

## 🗄️ Database Setup

**Step 1 — Create database (if not already done)**
```sql
CREATE DATABASE ecommerce;
```

**Step 2 — Import seed data**
```bash
# Run seed.py to create tables and add sample data
cd backend
python seed.py
```

**Step 3 — Add avatar_url column (Task 18 migration)**
```sql
USE ecommerce;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
```

**Users table structure:**
```sql
CREATE TABLE users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hashed
  role       ENUM('admin','customer') DEFAULT 'customer',
  avatar_url VARCHAR(255) DEFAULT NULL,      -- Added in Task 18
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

---

## ⚙️ New API Routes (Task 18)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/me` | Session | Updated — returns `avatar_url` + `created_at` |
| PUT | `/api/me` | Session | Update name & email · `409` if email taken |
| PUT | `/api/me/password` | Session | Change password · `401` if current password wrong |
| POST | `/api/upload/avatar` | Session | Upload profile picture → saved to `static/uploads/` |
| GET | `/static/uploads/<file>` | None | Serve uploaded avatar images |

---

## 📄 ProfilePage — 3 Sections

### Section 1 — 📸 Profile Picture
- Shows current avatar or **initials circle** if no photo
- **Preview before upload** using `URL.createObjectURL()`
- Upload saves to `backend/static/uploads/` with a unique filename
- Navbar avatar updates immediately after upload

### Section 2 — ✏️ Edit Profile
- Pre-filled form with current name and email
- `PUT /api/me` on save
- **Inline error** under email field if email already taken (409)
- Navbar name updates instantly via `updateUser()` in AuthContext

### Section 3 — 🔒 Change Password
- Current Password + New Password + Confirm New Password
- Frontend validates: match check + min 6 characters
- **Inline error** under current password if wrong (401)
- **Password strength bar** — Weak / Medium / Strong
- Fields clear automatically on success

---

## 🔄 How Navbar Updates Instantly (Key Concept)

```
User saves new name
      ↓
updateUser({ name: "New Name" }) called in ProfilePage
      ↓
AuthContext: setUser(prev => ({ ...prev, name: "New Name" }))
      ↓
React re-renders all AuthContext subscribers
      ↓
Navbar reads user.name → displays new name instantly
      ↓
No page refresh. No extra API call. Pure React Context.
```

---

## 🚀 How to Run

### Step 1 — Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Step 2 — Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Step 3 — Open Browser
```
http://localhost:5173
```
Login → click your name/avatar in Navbar → **My Profile page**

---

## 🔑 Test Accounts (after running seed.py)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shopsphere.com | admin123 |
| Customer | customer@shopsphere.com | customer123 |

---

## ✅ Features Summary

- ✅ `updateUser()` in AuthContext — instant Navbar re-render on profile change
- ✅ Avatar shows image or initials circle in Navbar and Profile page
- ✅ Image preview before upload using `URL.createObjectURL()`
- ✅ Unique avatar filenames using `uuid4()` — no filename collisions
- ✅ Current password verified before change (401 if wrong)
- ✅ Inline field errors for 409 (email conflict) and 401 (wrong password)
- ✅ Password strength indicator (Weak / Medium / Strong)
- ✅ Toast notifications with slide-in animation
- ✅ Responsive layout — 1 column mobile, 2 column tablet+
- ✅ Dark mode compatible using CSS variables

---

## 📝 Write-Up

See [`Profile_Settings_Writeup.txt`](./Profile_Settings_Writeup.txt) for:
- Full implementation details
- 5 challenges faced and how each was solved
- All 4 submission Q&A answers

---

*Developed by **Sudharsun A** · Task 18 · Software Engineer @ Stackly 2026*
