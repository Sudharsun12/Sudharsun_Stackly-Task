# 🎯 Job Application Tracker

A full-stack web application to manage your job applications — built with **React + Vite** (frontend) and **Flask + MySQL** (backend).

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6, Axios |
| Backend   | Python Flask, flask-bcrypt, flask-cors |
| Database  | MySQL 8.0                           |
| Auth      | Server-side sessions (cookies)      |

---

## Project Structure

```
job-tracker/
├── backend/
│   ├── app.py              # Flask API
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── ApplicationsPage.jsx
    │   │   ├── AddApplicationPage.jsx
    │   │   └── EditApplicationPage.jsx
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── ApplicationCard.jsx
    │   ├── api.js           # Axios instance
    │   ├── App.jsx          # Router + AuthContext
    │   └── main.jsx
    └── package.json
```

---

## Setup Instructions

### 1. Database (MySQL Workbench 8.0)

Open MySQL Workbench → admin connection → New Query tab and run:

```sql
-- Run the file: mysql_setup.sql
-- OR paste these commands:
CREATE DATABASE IF NOT EXISTS job_tracker;
USE job_tracker;

CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    username     VARCHAR(50)  NOT NULL UNIQUE,
    email        VARCHAR(100) NOT NULL UNIQUE,
    password     VARCHAR(255) NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT          NOT NULL,
    company      VARCHAR(100) NOT NULL,
    role         VARCHAR(100) NOT NULL,
    status       ENUM('Applied','Shortlisted','Interview Scheduled','Offer Received','Rejected') DEFAULT 'Applied',
    applied_on   DATE         NOT NULL,
    location     VARCHAR(100),
    job_url      VARCHAR(255),
    notes        TEXT,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 2. Backend (Flask)

```bash
cd backend

# Install dependencies
pip install flask flask-bcrypt flask-cors mysql-connector-python

# Run the server
python app.py
# → Running on http://localhost:5000
```

### 3. Frontend (React + Vite)

```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
# → Running on http://localhost:5173
```

### 4. Open in browser

Visit: **http://localhost:5173**

---

## API Endpoints

| Method | Route                         | Description                      |
|--------|-------------------------------|----------------------------------|
| POST   | `/api/register`               | Register new user                |
| POST   | `/api/login`                  | Login and set session            |
| GET    | `/api/logout`                 | Clear session                    |
| GET    | `/api/me`                     | Get current logged-in user       |
| GET    | `/api/applications`           | All applications for user        |
| POST   | `/api/applications`           | Add new application              |
| PUT    | `/api/applications/<id>`      | Update application               |
| DELETE | `/api/applications/<id>`      | Delete application               |
| GET    | `/api/applications/stats`     | Dashboard summary stats          |

---

## Features

- ✅ User registration & login with bcrypt hashed passwords
- ✅ Protected routes (redirect to login if not authenticated)
- ✅ Dashboard with stat cards per status
- ✅ Add / Edit / Delete applications
- ✅ Filter by status (Applied, Shortlisted, etc.)
- ✅ Search by company, role, or location
- ✅ Sort by date or company
- ✅ Dark mode UI with glassmorphism design
- ✅ Fully responsive layout

---

## Two Terminals

```
Terminal 1:  cd backend && python app.py
Terminal 2:  cd frontend && npm run dev
```

Both must be running at the same time.
