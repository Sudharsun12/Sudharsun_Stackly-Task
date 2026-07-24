from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
app.json.sort_keys = False
CORS(app)

# Database Connection
db = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="Srisudhan@1223",
    database="grade_tracker",
    port=3306
)

cursor = db.cursor(dictionary=True)


# Grade Calculation Function
def calculate_grade(percentage):

    if percentage >= 90:
        return "A"
    elif percentage >= 75:
        return "B"
    elif percentage >= 60:
        return "C"
    elif percentage >= 45:
        return "D"
    else:
        return "F"


# Home Route
@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Welcome to Student Marks & Grade Tracker API",
        "status": "Running Successfully"
    }), 200


# POST - Add Student
@app.route("/students", methods=["POST"])
def add_student():

    try:

        data = request.get_json()

        name = data.get("name")
        email = data.get("email")

        if not name or not email:
            return jsonify({
                "message": "Name and Email are required"
            }), 400

        cursor.execute(
            "SELECT * FROM students WHERE email=%s",
            (email,)
        )

        student = cursor.fetchone()

        if student:
            return jsonify({
                "message": "Email already exists"
            }), 409

        cursor.execute(
            """
            INSERT INTO students(name,email)
            VALUES(%s,%s)
            """,
            (name, email)
        )

        db.commit()

        return jsonify({
            "message": "Student Added Successfully"
        }), 201

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400


# GET - All Students
@app.route("/students", methods=["GET"])
def get_students():

    try:

        cursor.execute("""
            SELECT * FROM students
            ORDER BY id
        """)

        students = cursor.fetchall()

        result = []

        for student in students:

            result.append({
                "id": student["id"],
                "name": student["name"],
                "email": student["email"],
                "created_at": student["created_at"]
            })

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400


# GET - Student by ID
@app.route("/students/<int:id>", methods=["GET"])
def get_student(id):

    try:

        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "message": "Student Not Found"
            }), 404

        return jsonify({
            "id": student["id"],
            "name": student["name"],
            "email": student["email"],
            "created_at": student["created_at"]
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400


# PUT - Update Student
@app.route("/students/<int:id>", methods=["PUT"])
def update_student(id):

    try:

        data = request.get_json()

        name = data.get("name")
        email = data.get("email")

        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "message": "Student Not Found"
            }), 404

        cursor.execute(
            """
            UPDATE students
            SET name=%s,
                email=%s
            WHERE id=%s
            """,
            (name, email, id)
        )

        db.commit()

        return jsonify({
            "message": "Student Updated Successfully"
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400


# DELETE - Student
@app.route("/students/<int:id>", methods=["DELETE"])
def delete_student(id):

    try:

        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:

            return jsonify({
                "message": "Student Not Found"
            }), 404

        cursor.execute(
            "DELETE FROM students WHERE id=%s",
            (id,)
        )

        db.commit()

        return jsonify({
            "message": "Student Deleted Successfully"
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400
@app.route("/students/<int:id>/marks", methods=["POST"])
def add_marks(id):

    try:

        # Check student exists
        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "message": "Student Not Found"
            }), 404

        data = request.get_json()

        subject = data.get("subject")
        score = data.get("score")
        max_score = data.get("max_score", 100)

        # Validation
        if not subject:
            return jsonify({
                "message": "Subject is required"
            }), 400

        if score is None:
            return jsonify({
                "message": "Score is required"
            }), 400

        if score < 0:
            return jsonify({
                "message": "Score cannot be negative"
            }), 400

        if max_score <= 0:
            return jsonify({
                "message": "Max score must be greater than zero"
            }), 400

        if score > max_score:
            return jsonify({
                "message": "Score cannot exceed Max Score"
            }), 400

        cursor.execute(
            """
            INSERT INTO marks
            (student_id, subject, score, max_score)
            VALUES (%s, %s, %s, %s)
            """,
            (id, subject, score, max_score)
        )

        db.commit()

        return jsonify({
            "message": "Marks Added Successfully"
        }), 201

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400
@app.route("/students/<int:id>/marks", methods=["GET"])
def get_marks(id):

    try:

        # Check whether student exists
        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "message": "Student Not Found"
            }), 404

        # Get all marks
        cursor.execute(
            """
            SELECT *
            FROM marks
            WHERE student_id=%s
            ORDER BY id
            """,
            (id,)
        )

        marks = cursor.fetchall()

        result = []

        for mark in marks:

            percentage = round(
                (float(mark["score"]) / float(mark["max_score"])) * 100,
                2
            )

            grade = calculate_grade(percentage)

            result.append({
                "id": mark["id"],
                "subject": mark["subject"],
                "score": float(mark["score"]),
                "max_score": float(mark["max_score"]),
                "percentage": percentage,
                "grade": grade
            })

        return jsonify(result), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400
@app.route("/marks/<int:id>", methods=["DELETE"])
def delete_mark(id):

    try:

        cursor.execute(
            "SELECT * FROM marks WHERE id=%s",
            (id,)
        )

        mark = cursor.fetchone()

        if not mark:
            return jsonify({
                "message": "Mark Not Found"
            }), 404

        cursor.execute(
            "DELETE FROM marks WHERE id=%s",
            (id,)
        )

        db.commit()

        return jsonify({
            "message": "Mark Deleted Successfully"
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400
@app.route("/students/<int:id>/report", methods=["GET"])
def student_report(id):

    try:

        # Check whether student exists
        cursor.execute(
            "SELECT * FROM students WHERE id=%s",
            (id,)
        )

        student = cursor.fetchone()

        if not student:
            return jsonify({
                "message": "Student Not Found"
            }), 404

        # Fetch all marks of the student
        cursor.execute(
            """
            SELECT *
            FROM marks
            WHERE student_id=%s
            ORDER BY subject
            """,
            (id,)
        )

        marks = cursor.fetchall()

        # Check if student has any marks
        if not marks:
            return jsonify({
                "message": "No Marks Found For This Student"
            }), 404

        # Variables for report generation
        subjects = []

        total_percentage = 0

        best_subject = None
        weakest_subject = None

        highest_percentage = -1
        lowest_percentage = 101

        # Process each subject
        for mark in marks:

            percentage = round(
                (float(mark["score"]) / float(mark["max_score"])) * 100,
                2
            )

            grade = calculate_grade(percentage)

            total_percentage += percentage

            # Find best subject
            if percentage > highest_percentage:

                highest_percentage = percentage
                best_subject = mark["subject"]

            # Find weakest subject
            if percentage < lowest_percentage:

                lowest_percentage = percentage
                weakest_subject = mark["subject"]
                        # Add subject details to the list
            subjects.append({
                "subject": mark["subject"],
                "score": float(mark["score"]),
                "max_score": float(mark["max_score"]),
                "percentage": percentage,
                "grade": grade
            })

        # Calculate average percentage
        average_percentage = round(
            total_percentage / len(marks),
            2
        )

        # Calculate overall grade
        overall_grade = calculate_grade(average_percentage)

        # Pass / Fail Status
        if overall_grade == "F":
            status = "Fail"
        else:
            status = "Pass"

        # Final JSON Response
        return jsonify({
            "student_id": student["id"],
            "name": student["name"],
            "email": student["email"],
            "subjects": subjects,
            "average_percentage": average_percentage,
            "overall_grade": overall_grade,
            "status": status,
            "best_subject": best_subject,
            "weakest_subject": weakest_subject
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400
@app.route("/summary", methods=["GET"])
def class_summary():

    try:

        cursor.execute("""
            SELECT
                students.id,
                students.name,
                AVG((marks.score / marks.max_score) * 100) AS average_percentage
            FROM students
            JOIN marks
                ON students.id = marks.student_id
            GROUP BY students.id, students.name
            ORDER BY average_percentage DESC
        """)

        students = cursor.fetchall()

        if not students:
            return jsonify({
                "message": "No Student Data Found"
            }), 404

        total_students = len(students)

        class_total = 0

        grade_distribution = {
            "A": 0,
            "B": 0,
            "C": 0,
            "D": 0,
            "F": 0
        }

        pass_count = 0
        fail_count = 0

        for student in students:

            average = round(float(student["average_percentage"]), 2)

            class_total += average

            grade = calculate_grade(average)

            grade_distribution[grade] += 1

            if grade == "F":
                fail_count += 1
            else:
                pass_count += 1

        class_average = round(class_total / total_students, 2)

        highest_student = {
            "name": students[0]["name"],
            "average_percentage": round(float(students[0]["average_percentage"]), 2)
        }

        lowest_student = {
            "name": students[-1]["name"],
            "average_percentage": round(float(students[-1]["average_percentage"]), 2)
        }

        return jsonify({
            "total_students": total_students,
            "class_average_percentage": class_average,
            "grade_distribution": grade_distribution,
            "highest_scoring_student": highest_student,
            "lowest_scoring_student": lowest_student,
            "pass_count": pass_count,
            "fail_count": fail_count
        }), 200

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 400

if __name__ == "__main__":
    app.run(debug=True)