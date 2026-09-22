from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from datetime import timedelta
import mysql.connector

print("====================================")
print("AUTH SYSTEM BACKEND RUNNING — JWT")
print("====================================")

# ------------------------------------
# Flask Configuration
# ------------------------------------

app = Flask(__name__)

# JWT Configuration
app.config['JWT_SECRET_KEY']            = 'stackly_jwt_secret_key_2026'
app.config['JWT_ACCESS_TOKEN_EXPIRES']  = timedelta(minutes=15)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=7)

# CORS — allow React dev server to talk to Flask
# Must explicitly allow Authorization header so Bearer token passes through
CORS(app,
     origins=[
         "http://localhost:5173",
         "http://localhost:5174",
         "http://localhost:5175",
         "http://127.0.0.1:5173",
         "http://127.0.0.1:5174",
     ],
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     supports_credentials=False)

bcrypt = Bcrypt(app)
jwt    = JWTManager(app)

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
# Helper — ensure DB connection alive
# ------------------------------------

def ensure_connection():
    """Reconnect MySQL if the connection dropped."""
    global db, cursor
    try:
        db.ping(reconnect=True, attempts=3, delay=2)
    except mysql.connector.Error:
        db = mysql.connector.connect(
            host="127.0.0.1",
            port=3306,
            user="root",
            password="Srisudhan@1223",
            database="auth_system"
        )
        cursor = db.cursor(dictionary=True)

# ------------------------------------
# Register API
# POST /api/register
# ------------------------------------

@app.route("/api/register", methods=["POST"])
def register():
    try:
        ensure_connection()
        data     = request.get_json()
        username = data.get("username", "").strip()
        email    = data.get("email",    "").strip()
        password = data.get("password", "").strip()

        if not username or not email or not password:
            return jsonify({"message": "All fields are required."}), 400

        cursor.execute(
            "SELECT * FROM users WHERE username=%s OR email=%s",
            (username, email)
        )
        if cursor.fetchone():
            return jsonify({"message": "Username or Email already exists."}), 409

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, hashed_password)
        )
        db.commit()

        return jsonify({"message": "Registration Successful"}), 201

    except Exception as e:
        db.rollback()
        return jsonify({"message": str(e)}), 500


# ------------------------------------
# Login API
# POST /api/login
# Returns: access_token, refresh_token, user
# ------------------------------------

@app.route("/api/login", methods=["POST"])
def login():
    try:
        ensure_connection()
        data     = request.get_json()
        username = data.get("username", "").strip()
        password = data.get("password", "").strip()

        if not username or not password:
            return jsonify({"message": "Username and Password are required."}), 400

        cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()

        if user is None:
            return jsonify({"message": "Invalid Username or Password"}), 401

        if not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid Username or Password"}), 401

        # Create JWT tokens — identity is user ID (as string)
        additional_claims = {
            "role":     user["role"],
            "username": user["username"]
        }

        access_token  = create_access_token(
            identity=str(user["id"]),
            additional_claims=additional_claims
        )
        refresh_token = create_refresh_token(identity=str(user["id"]))

        return jsonify({
            "message":       "Login Successful",
            "access_token":  access_token,
            "refresh_token": refresh_token,
            "user": {
                "id":       user["id"],
                "username": user["username"],
                "role":     user["role"]
            }
        }), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ------------------------------------
# Refresh Token API
# POST /api/refresh
# Requires: refresh token in Authorization header
# Returns: new access_token
# ------------------------------------

@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    try:
        ensure_connection()
        user_id = get_jwt_identity()

        cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        new_access_token = create_access_token(
            identity=user_id,
            additional_claims={
                "role":     user["role"],
                "username": user["username"]
            }
        )
        return jsonify({"access_token": new_access_token}), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ------------------------------------
# Me API — current logged-in user
# GET /api/me
# Requires: access token in Authorization header
# Used by React on page reload to restore session
# ------------------------------------

@app.route("/api/me", methods=["GET"])
@jwt_required()
def me():
    claims = get_jwt()
    return jsonify({
        "id":       get_jwt_identity(),
        "username": claims.get("username"),
        "role":     claims.get("role")
    }), 200


# ------------------------------------
# Dashboard API
# GET /api/dashboard
# Requires: access token in Authorization header
# ------------------------------------

@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
def dashboard():
    claims   = get_jwt()
    username = claims.get("username")
    role     = claims.get("role")

    return jsonify({
        "message":  f"Welcome, {username}!",
        "username": username,
        "role":     role
    }), 200


# ------------------------------------
# Profile API
# GET /api/profile
# Requires: access token in Authorization header
# ------------------------------------

@app.route("/api/profile", methods=["GET"])
@jwt_required()
def profile():
    try:
        ensure_connection()
        user_id = get_jwt_identity()

        cursor.execute(
            "SELECT id, username, email, role, created_at FROM users WHERE id=%s",
            (user_id,)
        )
        user = cursor.fetchone()

        if not user:
            return jsonify({"message": "User not found"}), 404

        # Convert datetime to string for JSON serialization
        if user.get("created_at"):
            user["created_at"] = str(user["created_at"])

        return jsonify(user), 200

    except Exception as e:
        return jsonify({"message": str(e)}), 500


# ------------------------------------
# Logout API
# POST /api/logout
# Client clears tokens from localStorage
# ------------------------------------

@app.route("/api/logout", methods=["POST"])
def logout():
    # JWT is stateless — server just confirms logout.
    # The React client removes tokens from localStorage.
    return jsonify({"message": "Logged out successfully."}), 200


# ------------------------------------
# DB Test
# ------------------------------------

@app.route("/api/test-db", methods=["GET"])
def test_db():
    ensure_connection()
    cursor.execute("SELECT DATABASE()")
    result = cursor.fetchone()
    return jsonify({
        "message": "Database Connected Successfully",
        "database": result["DATABASE()"]
    }), 200


# ------------------------------------
# Error Handlers
# ------------------------------------

@app.errorhandler(404)
def not_found(error):
    return jsonify({"message": "Route Not Found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"message": "Internal Server Error"}), 500


# ------------------------------------
# Run Application
# ------------------------------------

if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )