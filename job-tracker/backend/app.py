from flask import Flask, request, jsonify, session, make_response
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import mysql.connector
from datetime import timedelta

app = Flask(__name__)

# ─── Secret key for session ───────────────────────────────────────────────────
app.secret_key = "job_tracker_super_secret_key_2024"
# Vite proxy forwards requests, so Flask sees them as same-origin (localhost:5000)
# Lax is fine — no cross-origin cookie issues with the proxy
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE']   = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_PATH']     = '/'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# ─── CORS — allow the Vite dev server origins just in case ───────────────────
CORS(app,
     supports_credentials=True,
     origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5000"])


# ─── Bcrypt ───────────────────────────────────────────────────────────────────
bcrypt = Bcrypt(app)

# ─── MySQL Connection ─────────────────────────────────────────────────────────
DB_CONFIG = {
    "host": "127.0.0.1",
    "port": 3306,
    "user": "root",
    "password": "Srisudhan@1223",
    "database": "job_tracker",
}

def get_db():
    """Create and return a new DB connection."""
    return mysql.connector.connect(**DB_CONFIG)


# ─── Helper: require login ────────────────────────────────────────────────────
def login_required():
    """Returns (user_id, None) if logged in, else (None, error_response)."""
    user_id = session.get("user_id")
    if not user_id:
        return None, (jsonify({"error": "Unauthorized. Please log in."}), 401)
    return user_id, None


# ══════════════════════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = (data.get("username") or "").strip()
    email    = (data.get("email")    or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not email or not password:
        return jsonify({"error": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters."}), 400

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password) VALUES (%s, %s, %s)",
            (username, email, pw_hash)
        )
        conn.commit()
        return jsonify({"message": "Registration successful! Please log in."}), 201
    except mysql.connector.IntegrityError as e:
        if "username" in str(e):
            return jsonify({"error": "Username already taken."}), 409
        if "email" in str(e):
            return jsonify({"error": "Email already registered."}), 409
        return jsonify({"error": "Registration failed."}), 409
    finally:
        cursor.close()
        conn.close()


@app.route("/api/login", methods=["POST"])
def login():
    data     = request.get_json()
    username = (data.get("username") or "").strip()
    password = (data.get("password") or "").strip()

    if not username or not password:
        return jsonify({"error": "Username and password are required."}), 400

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT * FROM users WHERE username = %s", (username,)
        )
        user = cursor.fetchone()
        if not user or not bcrypt.check_password_hash(user["password"], password):
            return jsonify({"error": "Invalid username or password."}), 401

        session.permanent = True
        session["user_id"]  = user["id"]
        session["username"] = user["username"]
        return jsonify({
            "message": "Login successful!",
            "user": {"id": user["id"], "username": user["username"], "email": user["email"]}
        }), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/api/logout", methods=["GET"])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully."}), 200


@app.route("/api/me", methods=["GET"])
def me():
    user_id, err = login_required()
    if err:
        return err

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id, username, email, created_at FROM users WHERE id = %s", (user_id,)
        )
        user = cursor.fetchone()
        if not user:
            session.clear()
            return jsonify({"error": "User not found."}), 404
        # Convert datetime to string
        user["created_at"] = str(user["created_at"])
        return jsonify({"user": user}), 200
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
#  APPLICATIONS ROUTES
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/applications/stats", methods=["GET"])
def get_stats():
    user_id, err = login_required()
    if err:
        return err

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        # Total count
        cursor.execute(
            "SELECT COUNT(*) AS total FROM applications WHERE user_id = %s", (user_id,)
        )
        total = cursor.fetchone()["total"]

        # Count per status
        cursor.execute(
            """SELECT status, COUNT(*) AS count
               FROM applications
               WHERE user_id = %s
               GROUP BY status""",
            (user_id,)
        )
        status_rows = cursor.fetchall()
        status_counts = {row["status"]: row["count"] for row in status_rows}

        # Latest 5 applications
        cursor.execute(
            """SELECT id, company, role, status, applied_on, location
               FROM applications
               WHERE user_id = %s
               ORDER BY applied_on DESC
               LIMIT 5""",
            (user_id,)
        )
        latest = cursor.fetchall()
        for row in latest:
            row["applied_on"] = str(row["applied_on"])

        return jsonify({
            "total": total,
            "status_counts": status_counts,
            "latest": latest
        }), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/api/applications", methods=["GET"])
def get_applications():
    user_id, err = login_required()
    if err:
        return err

    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            """SELECT id, company, role, status, applied_on, location, job_url, notes, updated_at
               FROM applications
               WHERE user_id = %s
               ORDER BY applied_on DESC""",
            (user_id,)
        )
        apps = cursor.fetchall()
        for app_row in apps:
            app_row["applied_on"] = str(app_row["applied_on"])
            app_row["updated_at"] = str(app_row["updated_at"])
        return jsonify({"applications": apps}), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/api/applications", methods=["POST"])
def add_application():
    user_id, err = login_required()
    if err:
        return err

    data      = request.get_json()
    company   = (data.get("company")    or "").strip()
    role      = (data.get("role")       or "").strip()
    status    = data.get("status",  "Applied")
    applied_on= data.get("applied_on",  "")
    location  = (data.get("location")   or "").strip()
    job_url   = (data.get("job_url")    or "").strip()
    notes     = (data.get("notes")      or "").strip()

    if not company or not role or not applied_on:
        return jsonify({"error": "Company, role, and applied date are required."}), 400

    valid_statuses = ["Applied", "Shortlisted", "Interview Scheduled", "Offer Received", "Rejected"]
    if status not in valid_statuses:
        status = "Applied"

    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            """INSERT INTO applications
               (user_id, company, role, status, applied_on, location, job_url, notes)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (user_id, company, role, status, applied_on, location or None, job_url or None, notes or None)
        )
        conn.commit()
        new_id = cursor.lastrowid
        return jsonify({"message": "Application added successfully.", "id": new_id}), 201
    finally:
        cursor.close()
        conn.close()


@app.route("/api/applications/<int:app_id>", methods=["PUT"])
def update_application(app_id):
    user_id, err = login_required()
    if err:
        return err

    # Verify ownership
    conn   = get_db()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "SELECT id FROM applications WHERE id = %s AND user_id = %s",
            (app_id, user_id)
        )
        if not cursor.fetchone():
            return jsonify({"error": "Application not found or access denied."}), 404

        data      = request.get_json()
        company   = (data.get("company")    or "").strip()
        role      = (data.get("role")       or "").strip()
        status    = data.get("status",  "Applied")
        applied_on= data.get("applied_on",  "")
        location  = (data.get("location")   or "").strip()
        job_url   = (data.get("job_url")    or "").strip()
        notes     = (data.get("notes")      or "").strip()

        if not company or not role or not applied_on:
            return jsonify({"error": "Company, role, and applied date are required."}), 400

        cursor.execute(
            """UPDATE applications
               SET company=%s, role=%s, status=%s, applied_on=%s,
                   location=%s, job_url=%s, notes=%s
               WHERE id=%s AND user_id=%s""",
            (company, role, status, applied_on,
             location or None, job_url or None, notes or None,
             app_id, user_id)
        )
        conn.commit()
        return jsonify({"message": "Application updated successfully."}), 200
    finally:
        cursor.close()
        conn.close()


@app.route("/api/applications/<int:app_id>", methods=["DELETE"])
def delete_application(app_id):
    user_id, err = login_required()
    if err:
        return err

    conn   = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "DELETE FROM applications WHERE id = %s AND user_id = %s",
            (app_id, user_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return jsonify({"error": "Application not found or access denied."}), 404
        return jsonify({"message": "Application deleted successfully."}), 200
    finally:
        cursor.close()
        conn.close()


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("Flask Job Tracker API running on http://localhost:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
