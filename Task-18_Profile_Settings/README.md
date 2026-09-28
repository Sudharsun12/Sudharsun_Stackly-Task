# Task 18 — User Profile & Settings Page
**Type:** Full Stack — React + Flask + MySQL  
**Done By:** Sudharsun A  
**Deadline:** 28th September 2026  
**Base Project:** Task 12 — ShopSphere E-Commerce

---

## 📌 Overview

This task upgrades the **Task 12 ShopSphere E-Commerce** application by adding a complete **User Profile & Settings** page. The following files were added or modified:

---

## 📁 Files Changed / Created in This Task

```
Task-18_Profile_Settings/
├── Profile_Settings_Writeup.txt         → Full write-up (implementation + Q&A)
├── README.md
│
├── backend/
│   └── app.py                           → MODIFIED — 4 new routes added
│
└── frontend/src/
    ├── App.jsx                          → MODIFIED — /profile route added
    ├── index.css                        → MODIFIED — profile + navbar avatar styles
    ├── context/
    │   └── AuthContext.jsx              → MODIFIED — added updateUser() function
    ├── components/
    │   └── Navbar.jsx                   → MODIFIED — avatar/initials + profile link
    └── pages/
        └── ProfilePage.jsx              → NEW — 3-section profile page
```

---

## 🗄️ Database Change (Run Once)

```sql
ALTER TABLE users ADD COLUMN avatar_url VARCHAR(255) DEFAULT NULL;
```

---

## ⚙️ New Backend Routes Added to `app.py`

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/me` | Updated — now returns `avatar_url` + `created_at` |
| PUT | `/api/me` | Update name & email · `409` if email taken |
| PUT | `/api/me/password` | Change password · `401` if current password wrong |
| POST | `/api/upload/avatar` | Upload profile picture to `static/uploads/` |
| GET | `/static/uploads/<file>` | Serve uploaded images |

---

## 🖥️ Frontend Changes

### `AuthContext.jsx` — `updateUser()` added
```js
function updateUser(partialData) {
  setUser(prev => ({ ...prev, ...partialData }))
}
```
Merges partial changes into user state → triggers instant Navbar re-render via React Context.

### `Navbar.jsx` — Avatar & Profile link
- Shows profile photo if uploaded, else **initials circle**
- Clicking it navigates to `/profile`
- Updates automatically when `updateUser()` is called from ProfilePage

### `ProfilePage.jsx` — 3 Sections
| Section | Feature |
|---------|---------|
| 📸 Profile Picture | Preview before upload · POST `/api/upload/avatar` · Navbar updates instantly |
| ✏️ Edit Profile | Pre-filled form · PUT `/api/me` · Inline error if email taken · Navbar name updates instantly |
| 🔒 Change Password | Current + New + Confirm · Frontend validation · 401 inline error · Password strength bar |

---

## 🔄 Instant Navbar Update (React Context)
```
updateUser({ name: "New Name" })
    ↓
setUser(prev => ({ ...prev, name: "New Name" }))
    ↓
React re-renders all AuthContext subscribers (including Navbar)
    ↓
Navbar shows new name/avatar — no page refresh
```

---

## 📝 Write-Up
See [`Profile_Settings_Writeup.txt`](./Profile_Settings_Writeup.txt) for full implementation details, 5 challenges faced, and all 4 submission Q&A answers.

---

*Developed by **Sudharsun A** · Task 18 · Stackly Internship 2026*
