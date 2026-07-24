# Student Marks & Grade Tracker API

## Project Description

The Student Marks & Grade Tracker API is a RESTful backend application developed using Python, Flask, and MySQL. It allows users to manage student records, store subject marks, calculate grades automatically, and generate individual as well as class-level reports.

The application follows REST API principles and can be tested using Postman.

---

## Technologies Used

- Python
- Flask
- Flask-CORS
- MySQL
- mysql-connector-python
- Postman

---

## Installation

### Clone Repository

```bash
git clone <your-github-repository-link>
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Create Database

```sql
CREATE DATABASE grade_tracker;
USE grade_tracker;

CREATE TABLE students (
id INT AUTO_INCREMENT PRIMARY KEY,
name VARCHAR(100) NOT NULL,
email VARCHAR(100) UNIQUE NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE marks (
id INT AUTO_INCREMENT PRIMARY KEY,
student_id INT NOT NULL,
subject VARCHAR(100) NOT NULL,
score DECIMAL(5,2) NOT NULL,
max_score DECIMAL(5,2) DEFAULT 100,
added_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY(student_id)
REFERENCES students(id)
ON DELETE CASCADE
);
```

---

## Run Application

```bash
python app.py
```

Server runs on:

```
http://127.0.0.1:5000
```

---

# API Endpoints

## Home

### GET /

Returns API status.

Response

```json
{
  "message":"Welcome to Student Marks & Grade Tracker API",
  "status":"Running Successfully"
}
```

---

## Students

### POST /students

Adds a new student.

Request

```json
{
  "name":"Sudharsun",
  "email":"sudharsun@gmail.com"
}
```

Response

```json
{
  "message":"Student Added Successfully"
}
```

---

### GET /students

Returns all students.

---

### GET /students/<id>

Returns one student.

---

### PUT /students/<id>

Updates student details.

Request

```json
{
  "name":"Sudharsun A",
  "email":"sudharsun@gmail.com"
}
```

---

### DELETE /students/<id>

Deletes a student and all related marks.

---

## Marks

### POST /students/<id>/marks

Request

```json
{
  "subject":"Mathematics",
  "score":92,
  "max_score":100
}
```

Response

```json
{
  "message":"Marks Added Successfully"
}
```

---

### GET /students/<id>/marks

Returns all marks with:

- Percentage
- Grade

---

### DELETE /marks/<id>

Deletes a mark.

---

## Reports

### GET /students/<id>/report

Returns

- Student Details
- Subjects
- Percentage
- Grade
- Average Percentage
- Overall Grade
- Pass / Fail
- Best Subject
- Weakest Subject

---

### GET /summary

Returns

- Total Students
- Class Average
- Grade Distribution
- Highest Scoring Student
- Lowest Scoring Student
- Pass Count
- Fail Count

---

## Grade Logic

| Percentage | Grade |
|------------|-------|
| >=90 | A |
| >=75 | B |
| >=60 | C |
| >=45 | D |
| <45 | F |

---

## Author

Sudharsun A