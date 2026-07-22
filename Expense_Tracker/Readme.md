# 💰 Personal Expense Tracker

A Full Stack Web Application developed using **Python, Flask, MySQL, HTML, CSS, and JavaScript**. This application allows users to securely register, log in, and manage their personal expenses. Each user's expense data is completely isolated using session-based authentication and database relationships.

---

# 🚀 Features

### Authentication

* User Registration
* Secure Password Hashing using Flask-Bcrypt
* User Login
* Session-Based Authentication
* Logout

### Expense Management

* Add New Expense
* View All Expenses
* Edit Existing Expense
* Delete Expense
* Filter Expenses by Category
* Filter Expenses by Date Range

### Dashboard

* Welcome Logged-in User
* Total Expenses
* Total Amount Spent
* Highest Expense
* Number of Categories Used
* Category-wise Expense Summary
* Recent Five Expenses

### Security

* Session Authentication
* Protected Routes
* User-wise Data Isolation
* Parameterized SQL Queries
* Foreign Key Relationship
* ON DELETE CASCADE

---

# 🛠 Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript

### Backend

* Python
* Flask
* Flask-Bcrypt
* Flask-CORS

### Database

* MySQL

---

# 📂 Project Structure

```text
Expense_Tracker/
│
├── app.py
│
└── static/
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── expenses.html
    ├── style.css
    └── script.js
```

---

# 📦 Required Python Packages

```bash
pip install flask
pip install flask-bcrypt
pip install flask-cors
pip install mysql-connector-python
```

Or install everything together:

```bash
pip install flask flask-bcrypt flask-cors mysql-connector-python
```

---

# 🗄 MySQL Database Setup

## Step 1 – Create Database

```sql
CREATE DATABASE expense_tracker;
USE expense_tracker;
```

---

## Step 2 – Create Users Table

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Step 3 – Create Expenses Table

```sql
CREATE TABLE expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    note VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);
```

---

# 🔗 Database Connection (app.py)

```python
db = mysql.connector.connect(
    host="127.0.0.1",
    port=3306,
    user="root",
    password="YOUR_PASSWORD",
    database="expense_tracker"
)
```

Replace `YOUR_PASSWORD` with your MySQL password.

---

# ▶️ Run the Project

Start the Flask server:

```bash
python app.py
```

Open your browser:

```text
http://127.0.0.1:5000
```

---

# 📌 API Routes

## Authentication

| Method | Endpoint  | Description   |
| ------ | --------- | ------------- |
| POST   | /register | Register User |
| POST   | /login    | Login User    |
| GET    | /logout   | Logout User   |

---

## Expenses

| Method | Endpoint          | Description       |
| ------ | ----------------- | ----------------- |
| GET    | /expenses         | Get All Expenses  |
| POST   | /expenses         | Add Expense       |
| PUT    | /expenses/<id>    | Update Expense    |
| DELETE | /expenses/<id>    | Delete Expense    |
| GET    | /expenses/filter  | Filter Expenses   |
| GET    | /expenses/summary | Dashboard Summary |

---

# 🔒 Security Features

* Passwords are securely hashed using Flask-Bcrypt.
* Session-based authentication protects all expense routes.
* Every expense belongs to a specific user.
* Users can only access their own expenses using:

```sql
WHERE user_id = session['user_id']
```

* Parameterized SQL queries are used to prevent SQL Injection.

---

# 📊 Dashboard Summary

The dashboard displays:

* Total Expenses
* Total Amount Spent
* Highest Expense
* Number of Categories Used
* Category-wise Expense Breakdown
* Recent Five Expenses

---

# 📸 Screenshots

Include screenshots of:

* Register Page
* Login Page
* Dashboard
* Add Expense
* Expense Table
* Filter Expenses
* Edit Expense
* Delete Expense

---

# 👨‍💻 Developer

**Sudharsun A**

Software Engineer

---

# 📄 License

This project was developed as part of the **Stackly Full Stack – Task 5 (Personal Expense Tracker)**.
