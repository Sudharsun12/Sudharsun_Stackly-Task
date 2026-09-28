# Task 18 — User Profile & Settings Page
**Type:** Full Stack — React + Flask + MySQL  
**Done By:** Sudharsun A  
**Deadline:** 28th September 2026  

---

## 📌 Overview

This task upgrades the **Task 12 ShopSphere E-Commerce** application by adding a complete **User Profile & Settings** page. Before this task, logged-in users had no way to view or edit their own details. Task 18 adds:

- ✅ View current profile details (name, email, avatar, member since)
- ✅ Upload and update profile picture
- ✅ Edit name and email with instant Navbar update
- ✅ Change password securely (verifies current password first)
- ✅ Navbar shows avatar/initials + name — updates immediately on change
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
├── Profile_Settings_Writeup.txt    → Full write-up (implementation + Q&A)
├── README.md
│
├── backend/
│   ├── app.py                      → Flask backend (updated with 4 new routes)
│   ├── requirements.txt
│   └── seed.py                     → Database seed data
│
└── frontend/
    └── src/
        ├── App.jsx                 → Added /profile route
        ├── api.js
        ├── index.css               → Added profile page + navbar avatar styles
        ├── context/
        │   └── AuthContext.jsx     → Added updateUser() function
        ├── components/
        │   └── Navbar.jsx          → Updated with avatar/initials + My Profile link
        └── pages/
            └── ProfilePage.jsx     → NEW — 3 section profile page
```

---

## 🗄️ Database Changes

```sql
-- Add avatar_url column to existing users table
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
```

### Updated users table structure:
```sql
CREATE TABLE users (
  id         INT          NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,          -- bcrypt hashed
  role       ENUM('admin','customer') DEFAULT 'customer',
  avatar_url VARCHAR(255) DEFAULT NULL,      -- ← NEW (Task 18)
  created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
```

---

## ⚙️ New API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/me` | Session | Updated — now returns `avatar_url` + `created_at` |
| PUT | `/api/me` | Session | Update name and email — returns `409` if email taken |
| PUT | `/api/me/password` | Session | Change password — returns `401` if current password wrong |
| POST | `/api/upload/avatar` | Session | Upload profile picture — saves to `static/uploads/` |
| GET | `/static/uploads/<file>` | None | Serve uploaded avatar files |

---

## 📄 ProfilePage Sections

### Section 1 — Profile Picture
- Shows current avatar or initials circle if no avatar
- "Choose Photo" opens file picker — image **previews before upload**
- "Upload Photo" saves to backend and updates Navbar instantly
- Shows "Member since Month Year"

### Section 2 — Edit Profile
- Pre-filled form with current name and email
- Saves via `PUT /api/me`
- **Inline error** under email field if email is already taken (409)
- Calls `updateUser({ name, email })` → Navbar name updates immediately

### Section 3 — Change Password
- Three fields: Current, New, Confirm New Password
- Frontend validates: passwords must match, minimum 6 characters
- **Inline error** under current password field if wrong (401)
- **Password strength indicator** — Weak / Medium / Strong
- Clears all fields on success

---

## 🔄 How Navbar Updates Immediately (Key UX Detail)

```
User saves new name in Edit Profile form
        ↓
ProfilePage calls updateUser({ name: "New Name" })
        ↓
AuthContext runs: setUser(prev => ({ ...prev, name: "New Name" }))
        ↓
React re-renders all AuthContext subscribers
        ↓
Navbar reads user.name from context → displays new name instantly
        ↓
No page refresh. No extra API call. Pure React Context.
```

---

## 🚀 How to Run Locally

### Step 1 — Database Setup

```sql
-- In MySQL Workbench or terminal
USE ecommerce;
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
```

### Step 2 — Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173 (or next available port)
```

### Step 4 — Open Browser

```
http://localhost:5173
```

Login → click your name/avatar in Navbar → Profile & Settings page

---

## ✅ Key Features Implemented

- ✅ `updateUser()` in AuthContext — merges partial updates, triggers instant Navbar re-render
- ✅ Avatar shows image or initials circle (Navbar + Profile page, both in sync)
- ✅ Image preview before upload using `URL.createObjectURL()`
- ✅ Unique avatar filenames using `uuid4().hex[:8]` — no collisions
- ✅ Current password verified before password change (`401` if wrong)
- ✅ Inline field-level errors for 409 (email conflict) and 401 (wrong password)
- ✅ Password strength indicator (Weak / Medium / Strong)
- ✅ Success/error toast with slide-in animation
- ✅ Fully responsive — 1 column mobile, 2 column tablet/desktop
- ✅ Dark mode compatible — uses existing CSS variables

---

## 📝 Write-Up

See [`Profile_Settings_Writeup.txt`](./Profile_Settings_Writeup.txt) for:
- Full implementation details (DB, backend, frontend)
- 5 challenges faced and how each was solved
- Answers to all 4 submission questions

---

*Developed by **Sudharsun A** · Task 18 · Stackly Internship 2026*
