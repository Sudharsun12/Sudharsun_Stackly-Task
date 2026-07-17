# User Login & Authentication System

## Project Overview

This project is a secure User Login & Authentication System developed using **Python, Flask, MySQL, HTML, CSS, and JavaScript**. The application allows users to register, log in securely using hashed passwords, access protected pages through session management, view their profile information, and log out safely. Passwords are never stored in plain text and are securely hashed using **Flask-Bcrypt** before being saved in the database.

---

# Features

- User Registration
- Secure Password Hashing using Flask-Bcrypt
- User Login Authentication
- Flask Session Management
- Protected Dashboard
- User Profile Page
- Secure Logout
- MySQL Database Integration
- Responsive User Interface
- REST API Communication using Fetch API

---

# Technologies Used

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Flask

## Database

- MySQL

## Python Libraries

- Flask
- Flask-Bcrypt
- Flask-Session
- Flask-CORS
- mysql-connector-python

---

# Project Structure

```
auth_system/
│
├── app.py
├── requirements.txt
├── README.md
│
└── static/
    ├── register.html
    ├── login.html
    ├── dashboard.html
    ├── style.css
    └── script.js
```

---

# Installation

## Step 1

Clone the repository

```bash
git clone <your-github-repository-link>
```

---

## Step 2

Navigate into the project folder

```bash
cd auth_system
```

---

## Step 3

Install the required dependencies

```bash
pip install -r requirements.txt
```

---

# Database Setup

Open MySQL Workbench and execute the following SQL:

```sql
CREATE DATABASE auth_system;

USE auth_system;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin','user') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Configure MySQL Connection

Inside **app.py**, update your database credentials.

```python
db = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="YOUR_PASSWORD",
    database="auth_system"
)
```

---

# Running the Application

Run the Flask server.

```bash
python app.py
```

The application will be available at:

```
http://127.0.0.1:5001/
```

---

# API Endpoints

| Method | Endpoint | Description |
|----------|------------|--------------------------------|
| POST | /register | Register a new user |
| POST | /login | Authenticate user |
| GET | /dashboard | Protected Dashboard |
| GET | /profile | Logged-in User Details |
| GET | /logout | Logout User |

---

# Authentication Flow

```
Register
      │
      ▼
Hash Password
      │
      ▼
Store Hash in MySQL
      │
      ▼
Login
      │
      ▼
Verify Password Hash
      │
      ▼
Create Flask Session
      │
      ▼
Dashboard
      │
      ▼
Logout
      │
      ▼
Session Cleared
```

---

# Security Features

- Password Hashing using Flask-Bcrypt
- Session-Based Authentication
- Protected Routes
- Duplicate Username Validation
- Duplicate Email Validation
- Input Validation
- Secure Logout
- Proper HTTP Status Codes
- No Plain Text Password Storage

---

# HTTP Status Codes Used

| Status Code | Meaning |
|-------------|------------------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 409 | Conflict |

---

# Project Implementation

The authentication system allows users to securely register, log in, access protected pages, and log out. During registration, passwords are hashed using Flask-Bcrypt before being stored in the MySQL database. During login, the entered password is compared with the stored hash using bcrypt verification. Once authentication is successful, Flask creates a session to maintain the user's login state. Protected routes such as the dashboard and profile verify the session before returning user data. The frontend communicates with the backend through the Fetch API without page reloads, resulting in a smooth and responsive user experience.

---

# Challenges Faced

One of the major challenges during development was integrating the frontend with the Flask backend while ensuring proper communication through REST APIs. I encountered issues related to static file paths, route configuration, session handling, and password authentication. Initially, previously registered users could not log in because their password hashes were created before the authentication logic was finalized. I resolved these issues by debugging the Flask routes, verifying API responses using browser developer tools, testing backend endpoints, correcting the project structure, and re-registering users with properly hashed passwords. These challenges improved my understanding of Flask sessions, password hashing, routing, and full-stack debugging techniques.

---

# Future Improvements

- Admin Dashboard
- Role-Based Authentication
- Remember Me Functionality
- Password Strength Indicator
- Forgot Password Feature
- Email Verification
- Last Login Timestamp

---

# Author

**Developed by Sudharsun**

Software Engineer

Stackly Training Program

2026