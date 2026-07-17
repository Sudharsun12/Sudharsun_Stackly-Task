from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
import mysql.connector

print("====================================")
print("AUTH SYSTEM BACKEND RUNNING")
print("====================================")

# ------------------------------------
# Flask Configuration
# ------------------------------------

app = Flask(__name__, static_folder="static")

app.secret_key = "stackly_auth_project"

CORS(app, supports_credentials=True)

app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = False

Session(app)

bcrypt = Bcrypt(app)

# ------------------------------------
# MySQL Connection
# ------------------------------------

try:

    db = mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="Srisudhan@1223",
        database="auth_system"
    )

    cursor = db.cursor(dictionary=True)

    print("MySQL Connected Successfully")

except mysql.connector.Error as err:

    print("Database Connection Failed")
    print(err)

# ------------------------------------
# Home Route
# ------------------------------------

@app.route("/")
def home():

    return app.send_static_file("login.html")

# ------------------------------------
# Register Page
# ------------------------------------

@app.route("/register-page")
def register_page():

    return app.send_static_file("register.html")

# ------------------------------------
# Dashboard Page
# ------------------------------------

@app.route("/dashboard-page")
def dashboard_page():

    return app.send_static_file("dashboard.html")

# ------------------------------------
# Database Test
# ------------------------------------

@app.route("/test-db")
def test_database():

    cursor.execute("SELECT DATABASE()")

    database = cursor.fetchone()

    return jsonify({

        "message": "Database Connected Successfully",

        "database": database["DATABASE()"]

    })

# ------------------------------------
# Register API
# ------------------------------------

@app.route("/register", methods=["POST"])
def register():

    try:

        data = request.get_json()

        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()

        if username == "" or email == "" or password == "":

            return jsonify({

                "message": "All fields are required."

            }), 400

        cursor.execute(

            """
            SELECT *
            FROM users
            WHERE username=%s OR email=%s
            """,

            (username, email)

        )

        existing_user = cursor.fetchone()

        if existing_user:

            return jsonify({

                "message": "Username or Email already exists."

            }), 409

        hashed_password = bcrypt.generate_password_hash(
            password
        ).decode("utf-8")

        cursor.execute(

            """
            INSERT INTO users
            (username,email,password)
            VALUES(%s,%s,%s)
            """,

            (
                username,
                email,
                hashed_password
            )

        )

        db.commit()

        return jsonify({

            "message": "Registration Successful"

        }), 201

    except Exception as e:

        db.rollback()

        return jsonify({

            "message": str(e)

        }), 500
# ------------------------------------
# Login API
# ------------------------------------

@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json()

        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        if username == "" or password == "":

            return jsonify({
                "message": "Username and Password are required."
            }), 400

        cursor.execute(

            """
            SELECT *
            FROM users
            WHERE username=%s
            """,

            (username,)

        )

        user = cursor.fetchone()

        if user is None:

            return jsonify({
                "message": "Invalid Username or Password"
            }), 401

        if bcrypt.check_password_hash(user["password"], password):

            session["user_id"] = user["id"]
            session["username"] = user["username"]
            session["role"] = user["role"]

            return jsonify({

                "message": "Login Successful",
                "username": user["username"],
                "role": user["role"]

            }), 200

        return jsonify({
            "message": "Invalid Username or Password"
        }), 401

    except Exception as e:

        return jsonify({
            "message": str(e)
        }), 500


# ------------------------------------
# Dashboard API
# ------------------------------------

@app.route("/dashboard", methods=["GET"])
def dashboard():

    if "user_id" not in session:

        return jsonify({
            "message": "Unauthorized. Please login first."
        }), 401

    return jsonify({

        "message": f"Welcome, {session['username']}!",
        "username": session["username"],
        "role": session["role"]

    }), 200


# ------------------------------------
# Profile API
# ------------------------------------

@app.route("/profile", methods=["GET"])
def profile():

    if "user_id" not in session:

        return jsonify({
            "message": "Unauthorized. Please login first."
        }), 401

    cursor.execute(

        """
        SELECT
        id,
        username,
        email,
        role,
        created_at
        FROM users
        WHERE id=%s
        """,

        (session["user_id"],)

    )

    user = cursor.fetchone()

    return jsonify(user), 200


# ------------------------------------
# Logout API
# ------------------------------------

@app.route("/logout", methods=["GET"])
def logout():

    session.clear()

    return jsonify({

        "message": "Logged out successfully."

    }), 200


# ------------------------------------
# 404 Handler
# ------------------------------------

@app.errorhandler(404)
def not_found(error):

    return jsonify({

        "message": "Route Not Found"

    }), 404


# ------------------------------------
# 500 Handler
# ------------------------------------

@app.errorhandler(500)
def internal_error(error):

    return jsonify({

        "message": "Internal Server Error"

    }), 500


# ------------------------------------
# Run Application
# ------------------------------------

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )