# Task 16 — JWT Authentication
**Type:** Full Stack — React + Flask  
**Done By:** Sudharsun A  
**Deadline:** 22nd September 2026  

---

## 📌 Overview

This project upgrades the **Task 4 Flask Session Authentication** system to use **JWT (JSON Web Token)** based authentication — the industry standard used in modern production REST APIs.

Instead of storing user data in server-side sessions, the server now issues signed tokens that the client stores in `localStorage` and sends with every request via the `Authorization: Bearer` header.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask, flask-jwt-extended, Flask-Bcrypt, Flask-CORS |
| Frontend | React (Vite), Axios, React Router DOM |
| Database | MySQL |

---

## 📁 Project Structure

```
Task-16_JWT_Authentication/
├── app.py                          → Flask backend with JWT authentication
├── Requirements.txt                → Python dependencies
├── auth_system_users.sql           → MySQL database schema and seed data
├── JWT_Authentication_Writeup.txt  → Full write-up (implementation + Q&A)
├── .gitignore
│
├── Output/
│   ├── Output Image 1.png          → Register page
│   ├── Output Image 2.png          → Login page
│   ├── Output Image 3.png          → Dashboard with JWT token info
│   ├── Output Image 4.png          → Profile page (JWT protected route)
│   └── Output Image 5.png          → DevTools — Authorization Bearer header
│
└── frontend/                       → React app (Vite)
    └── src/
        ├── api.js                  → Axios instance + request/response interceptors
        ├── App.jsx                 → Routes with protected route guard
        ├── main.jsx
        ├── context/
        │   └── AuthContext.jsx     → Global auth state, login(), logout(), session restore
        ├── components/
        │   ├── ProtectedRoute.jsx  → Redirects unauthenticated users to /login
        │   └── Footer.jsx          → Reusable footer with quote and developer credit
        ├── pages/
        │   ├── Login.jsx           → Stores access + refresh tokens in localStorage
        │   ├── Register.jsx        → New user registration
        │   ├── Dashboard.jsx       → Decoded JWT payload display + how JWT works
        │   └── Profile.jsx         → JWT-protected route — fetches user from DB
        └── styles/
            ├── auth.css
            ├── dashboard.css
            └── footer.css
```

---

## ⚙️ Backend API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/register` | None | Register new user |
| POST | `/api/login` | None | Login — returns access + refresh token |
| POST | `/api/refresh` | Refresh Token | Issues new access token |
| GET | `/api/me` | Access Token | Returns current user — used on page reload |
| GET | `/api/dashboard` | Access Token | Returns welcome message |
| GET | `/api/profile` | Access Token | Returns full user profile from DB |
| POST | `/api/logout` | None | Client clears tokens locally |

---

## 🔐 JWT Configuration

```python
JWT_SECRET_KEY            = 'stackly_jwt_secret_key_2026'
JWT_ACCESS_TOKEN_EXPIRES  = timedelta(minutes=15)   # Short-lived
JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)        # Long-lived
```

---

## 🔄 How the Axios Interceptor Works

```
Every API call
     ↓
Request Interceptor → attaches Authorization: Bearer <access_token>
     ↓
Flask verifies token signature with @jwt_required()
     ↓
If 401 (token expired) → Response Interceptor fires
     ↓
Sends POST /api/refresh with refresh token
     ↓
Gets new access token → retries original request silently
     ↓
If refresh also fails → clears localStorage → redirects to /login
```

---

## 🚀 How to Run Locally

### Step 1 — Backend

```bash
# Install dependencies
pip install -r Requirements.txt

# Run Flask server
python app.py
# Runs on http://127.0.0.1:5001
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

---

## 📸 Output Screenshots

| # | Screenshot |
|---|-----------|
| 1 | Register Page |
| 2 | Login Page |
| 3 | Dashboard — JWT Token Info |
| 4 | Profile Page — JWT Protected Route |
| 5 | DevTools — Authorization Bearer Header (no session cookie) |

---

## ✅ Key Features Implemented

- ✅ Access token (15 min) + Refresh token (7 days) issued on login
- ✅ All protected routes use `@jwt_required()` decorator
- ✅ Axios request interceptor auto-attaches `Authorization: Bearer` header
- ✅ Axios response interceptor auto-refreshes token on 401 and retries
- ✅ Session restore on page reload via `/api/me`
- ✅ Logout clears `localStorage` — no session cookie used anywhere
- ✅ `ProtectedRoute` component guards all authenticated pages
- ✅ Dashboard shows decoded JWT payload (sub, role, iat, exp)

---

## 📝 Write-Up

See [`JWT_Authentication_Writeup.txt`](./JWT_Authentication_Writeup.txt) for:
- Full implementation details
- Challenges faced and how they were solved
- Answers to all 4 submission questions

---

*Developed by **Sudharsun A** · Task 16 · Stackly Internship 2026*
