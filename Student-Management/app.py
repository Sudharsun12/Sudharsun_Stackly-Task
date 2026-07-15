from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector

app = Flask(__name__, static_folder="static", static_url_path="")
CORS(app)

# ==========================
# Database Connection
# ==========================

db = mysql.connector.connect(
    host="127.0.0.1",
    user="root",
    password="Srisudhan@1223",
    database="student_management"
)

cursor = db.cursor(dictionary=True)

print("✅ Connected to MySQL Successfully!")

# ==========================
# Home Page
# ==========================

@app.route("/")
def home():
    return app.send_static_file("index.html")

# ==========================
# GET ALL STUDENTS
# ==========================

@app.route("/api/students", methods=["GET"])
def get_students():

    try:

        cursor.execute("""
            SELECT *
            FROM students
            ORDER BY id DESC
        """)

        students = cursor.fetchall()

        return jsonify(students), 200

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ==========================
# ADD STUDENT
# ==========================

@app.route("/api/students", methods=["POST"])
def add_student():

    try:

        data = request.get_json()

        if data is None:
            return jsonify({
                "error": "No JSON data received."
            }), 400

        full_name = data.get("full_name")
        email = data.get("email")
        phone = data.get("phone")
        course = data.get("course")

        # Validation
        if not full_name or not email or not phone or not course:
            return jsonify({
                "error": "All fields are required."
            }), 400

        query = """
        INSERT INTO students
        (full_name, email, phone, course)
        VALUES (%s, %s, %s, %s)
        """

        values = (
            full_name,
            email,
            phone,
            course
        )

        cursor.execute(query, values)
        db.commit()

        return jsonify({
            "message": "Student Added Successfully!"
        }), 201

    except mysql.connector.Error as err:

        return jsonify({
            "error": str(err)
        }), 500

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500
# ==========================
# UPDATE STUDENT
# ==========================

@app.route("/api/students/<int:id>", methods=["PUT"])
def update_student(id):

    try:

        data = request.get_json()

        full_name = data.get("full_name")
        email = data.get("email")
        phone = data.get("phone")
        course = data.get("course")

        if not full_name or not email or not phone or not course:
            return jsonify({
                "error": "All fields are required."
            }), 400

        query = """
        UPDATE students
        SET
            full_name=%s,
            email=%s,
            phone=%s,
            course=%s
        WHERE id=%s
        """

        values = (
            full_name,
            email,
            phone,
            course,
            id
        )

        cursor.execute(query, values)
        db.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "error": "Student not found."
            }), 404

        return jsonify({
            "message": "Student Updated Successfully!"
        }), 200

    except mysql.connector.Error as err:

        return jsonify({
            "error": str(err)
        }), 500
# ==========================
# DELETE STUDENT
# ==========================

@app.route("/api/students/<int:id>", methods=["DELETE"])
def delete_student(id):

    try:

        query = "DELETE FROM students WHERE id = %s"

        cursor.execute(query, (id,))
        db.commit()

        if cursor.rowcount == 0:

            return jsonify({
                "error": "Student not found."
            }), 404

        return jsonify({
            "message": "Student Deleted Successfully!"
        }), 200

    except mysql.connector.Error as err:

        return jsonify({
            "error": str(err)
        }), 500
# ==========================
# SEARCH STUDENTS
# ==========================

@app.route("/api/students/search", methods=["GET"])
def search_students():

    try:

        keyword = request.args.get("q", "")

        query = """
        SELECT *
        FROM students
        WHERE full_name LIKE %s
        OR course LIKE %s
        ORDER BY id DESC
        """

        value = "%" + keyword + "%"

        cursor.execute(query, (value, value))

        students = cursor.fetchall()

        return jsonify(students), 200

    except mysql.connector.Error as err:

        return jsonify({
            "error": str(err)
        }), 500

# ==========================
# Run Application
# ==========================

if __name__ == "__main__":
    app.run(debug=True)