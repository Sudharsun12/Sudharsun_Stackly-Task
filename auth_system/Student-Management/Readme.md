# 🎓 Student Web Interface

A Full Stack Student Management System built using **Flask**, **MySQL**, **HTML**, **CSS**, and **JavaScript**. This application allows users to manage student records through a clean and responsive web interface.

---

## 🚀 Features

- Add Student
- View Student Records
- Update Student Details
- Delete Student Records
- Search Students
- Dashboard Statistics
- Responsive User Interface
- REST API using Flask
- MySQL Database Integration

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript

### Backend
- Python
- Flask
- Flask-CORS

### Database
- MySQL

---

## 📂 Project Structure

```
Student-Management/
│
├── app.py
├── requirements.txt
├── README.md
│
├── static/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
└── database/
    └── student_management.sql
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
```

### 2. Move to Project Folder

```bash
cd Student-Management
```

### 3. Install Dependencies

```bash
pip install flask
pip install flask-cors
pip install mysql-connector-python
```

### 4. Configure MySQL

Create a database named:

```
student_management
```

# MySQL Setup Guide

Follow these steps to configure the MySQL database before running the project.

## Step 1: Open MySQL Workbench

Open MySQL Workbench and connect to your local MySQL server.

## Step 2: Create the Database

Run the following SQL command:

```sql
CREATE DATABASE student_management;
```

## Step 3: Select the Database

```sql
USE student_management;
```

## Step 4: Create the Students Table

```sql
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    course VARCHAR(50) NOT NULL,
    enrolled_on DATE DEFAULT (CURRENT_DATE)
);
```

## Step 5: Configure Database Credentials

Open the `app.py` file and update the MySQL connection details according to your local setup.

```python
db = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="YOUR_MYSQL_PASSWORD",
    database="student_management"
)
```

Replace `YOUR_MYSQL_PASSWORD` with your own MySQL password.

## Step 6: Install Required Packages

Run the following commands:

```bash
pip install flask
pip install flask-cors
pip install mysql-connector-python
```

Or install all dependencies at once if a `requirements.txt` file is available:

```bash
pip install -r requirements.txt
```

## Step 7: Run the Application

```bash
python app.py
```

Open your browser and visit:

```
http://127.0.0.1:5000
```

The Student Web Interface should now be running successfully.

### 5. Run the Application

```bash
python app.py
```

Open:

```
http://127.0.0.1:5000
```

---

## 📌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/students | Get All Students |
| POST | /api/students | Add Student |
| PUT | /api/students/<id> | Update Student |
| DELETE | /api/students/<id> | Delete Student |
| GET | /api/search | Search Students |

---

## 📸 Application Modules

- Dashboard
- Student Form
- Search Feature
- Student Table
- CRUD Operations
- Backend REST APIs

---

## 👨‍💻 Developed By

**Sudharsun A**

Software Engineer

---

## 📄 License

This project is developed for learning and educational purposes.