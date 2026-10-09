"""
app.py — EDABIP Mini Backend (Flask + JWT + WebSocket + MySQL)
Run: python app.py
"""
import os, csv, io
from datetime import datetime, timedelta, timezone
from functools import wraps

import bcrypt
import mysql.connector
from flask import Flask, request, jsonify, send_from_directory
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, verify_jwt_in_request
)
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "edabip_super_secret_jwt_key_2026"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=12)
app.config["UPLOAD_FOLDER"] = os.path.join(os.path.dirname(__file__), "static", "uploads")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

CORS(app, origins="*", supports_credentials=True)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# ── DB helper ──────────────────────────────────────────────────
def get_db():
    return mysql.connector.connect(
        host="127.0.0.1", port=3306,
        user="root", password="Srisudhan@1223",
        database="edabip_mini"
    )

# ── Role decorators ────────────────────────────────────────────
def roles_required(*roles):
    def decorator(fn):
        @wraps(fn)
        @jwt_required()
        def wrapper(*args, **kwargs):
            uid = int(get_jwt_identity())
            db = get_db(); cur = db.cursor(dictionary=True)
            cur.execute("SELECT role FROM users WHERE id=%s", (uid,))
            user = cur.fetchone(); cur.close(); db.close()
            if not user or user["role"] not in roles:
                return jsonify(error="Forbidden"), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

# ── Activity helper ────────────────────────────────────────────
def log_activity(db, cur, user_id, action):
    cur.execute(
        "INSERT INTO activity_log (user_id, action) VALUES (%s,%s)",
        (user_id, action)
    )
    db.commit()
    cur.execute(
        "SELECT a.id, a.action, a.created_at, u.name AS user_name "
        "FROM activity_log a JOIN users u ON a.user_id=u.id "
        "ORDER BY a.created_at DESC LIMIT 1"
    )
    row = cur.fetchone()
    payload = {
        "id": row["id"],
        "action": row["action"],
        "user_name": row["user_name"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None
    }
    socketio.emit("activity_update", payload)

# ═══════════════════════════════════════════════════════════════
#  AUTH ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    name = data.get("name","").strip()
    email = data.get("email","").strip().lower()
    raw_pw = data.get("password","")
    role = data.get("role","viewer")
    if not name or not email or not raw_pw:
        return jsonify(error="All fields required"), 400
    hashed = bcrypt.hashpw(raw_pw.encode(), bcrypt.gensalt()).decode()
    db = get_db(); cur = db.cursor()
    try:
        cur.execute(
            "INSERT INTO users (name,email,password,role) VALUES (%s,%s,%s,%s)",
            (name, email, hashed, role)
        )
        db.commit()
        uid = cur.lastrowid
    except mysql.connector.errors.IntegrityError:
        cur.close(); db.close()
        return jsonify(error="Email already registered"), 409
    cur.close(); db.close()
    token = create_access_token(identity=str(uid))
    return jsonify(message="Registered", token=token), 201

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get("email","").strip().lower()
    raw_pw = data.get("password","")
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cur.fetchone(); cur.close(); db.close()
    if not user or not bcrypt.checkpw(raw_pw.encode(), user["password"].encode()):
        return jsonify(error="Invalid credentials"), 401
    token = create_access_token(identity=str(user["id"]))
    return jsonify(
        token=token,
        user={"id": user["id"], "name": user["name"],
              "email": user["email"], "role": user["role"],
              "avatar_url": user["avatar_url"]}
    )

@app.route("/api/logout", methods=["GET"])
@jwt_required()
def logout():
    return jsonify(message="Logged out")

@app.route("/api/me", methods=["GET"])
@jwt_required()
def me():
    uid = int(get_jwt_identity())
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT id,name,email,role,avatar_url,created_at FROM users WHERE id=%s", (uid,))
    user = cur.fetchone(); cur.close(); db.close()
    if not user: return jsonify(error="Not found"), 404
    if user.get("created_at"): user["created_at"] = user["created_at"].isoformat()
    return jsonify(user)

@app.route("/api/me", methods=["PUT"])
@jwt_required()
def update_me():
    uid = int(get_jwt_identity())
    data = request.get_json()
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT * FROM users WHERE id=%s", (uid,))
    user = cur.fetchone()
    if not user: cur.close(); db.close(); return jsonify(error="Not found"), 404

    name = data.get("name", user["name"])
    new_pw = data.get("password")
    hashed = bcrypt.hashpw(new_pw.encode(), bcrypt.gensalt()).decode() if new_pw else user["password"]
    cur.execute("UPDATE users SET name=%s, password=%s WHERE id=%s", (name, hashed, uid))
    db.commit(); cur.close(); db.close()
    return jsonify(message="Profile updated")

@app.route("/api/me/avatar", methods=["POST"])
@jwt_required()
def upload_avatar():
    uid = int(get_jwt_identity())
    if "avatar" not in request.files:
        return jsonify(error="No file"), 400
    f = request.files["avatar"]
    filename = secure_filename(f"avatar_{uid}_{f.filename}")
    f.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))
    url = f"/static/uploads/{filename}"
    db = get_db(); cur = db.cursor()
    cur.execute("UPDATE users SET avatar_url=%s WHERE id=%s", (url, uid))
    db.commit(); cur.close(); db.close()
    return jsonify(avatar_url=url)

@app.route("/static/uploads/<filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

# ═══════════════════════════════════════════════════════════════
#  ANALYTICS ROUTES
# ═══════════════════════════════════════════════════════════════

def dept_filter_clause(dept_param):
    """Returns (WHERE clause snippet, value or None)"""
    if dept_param:
        return "AND d.name = %s", dept_param
    return "", None

@app.route("/api/kpis", methods=["GET"])
@jwt_required()
def kpis():
    dept  = request.args.get("department")
    frm   = request.args.get("from")
    to    = request.args.get("to")

    db = get_db(); cur = db.cursor(dictionary=True)

    # Build dynamic WHERE
    conditions = ["1=1"]
    vals = []
    if dept:
        conditions.append("dep.name = %s"); vals.append(dept)
    if frm:
        conditions.append("m.recorded_on >= %s"); vals.append(frm)
    if to:
        conditions.append("m.recorded_on <= %s"); vals.append(to)
    where = " AND ".join(conditions)

    # Total metric value + total records
    cur.execute(f"""
        SELECT COALESCE(SUM(m.metric_value),0) AS total_value,
               COUNT(m.id) AS total_records
        FROM metrics m
        JOIN departments dep ON dep.id = m.department_id
        WHERE {where}
    """, vals)
    agg = cur.fetchone()

    # Most active department (by record count)
    cur.execute("""
        SELECT dep.name, COUNT(m.id) AS cnt
        FROM metrics m JOIN departments dep ON dep.id=m.department_id
        GROUP BY dep.name ORDER BY cnt DESC LIMIT 1
    """)
    top_dept = cur.fetchone()

    # This month vs last month
    now = datetime.now(timezone.utc)
    this_month_start = now.replace(day=1, hour=0, minute=0, second=0).strftime("%Y-%m-%d")
    last_month_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1).strftime("%Y-%m-%d")
    last_month_end   = (now.replace(day=1) - timedelta(days=1)).strftime("%Y-%m-%d")

    cur.execute("SELECT COALESCE(SUM(metric_value),0) AS v FROM metrics WHERE recorded_on >= %s", (this_month_start,))
    this_month = float(cur.fetchone()["v"])
    cur.execute("SELECT COALESCE(SUM(metric_value),0) AS v FROM metrics WHERE recorded_on BETWEEN %s AND %s",
                (last_month_start, last_month_end))
    last_month = float(cur.fetchone()["v"])

    mom_change = 0.0
    if last_month > 0:
        mom_change = round(((this_month - last_month) / last_month) * 100, 2)

    cur.close(); db.close()
    return jsonify({
        "total_value":     float(agg["total_value"]),
        "total_records":   agg["total_records"],
        "top_department":  top_dept["name"] if top_dept else "N/A",
        "this_month":      this_month,
        "last_month":      last_month,
        "mom_change":      mom_change,
    })

@app.route("/api/metrics/trend", methods=["GET"])
@jwt_required()
def metrics_trend():
    dept    = request.args.get("department")
    metric  = request.args.get("metric_name")
    db = get_db(); cur = db.cursor(dictionary=True)
    conditions = ["1=1"]
    vals = []
    if dept:
        conditions.append("dep.name = %s"); vals.append(dept)
    if metric:
        conditions.append("m.metric_name = %s"); vals.append(metric)
    where = " AND ".join(conditions)
    cur.execute(f"""
        SELECT DATE_FORMAT(m.recorded_on, '%Y-%m') AS month,
               ROUND(SUM(m.metric_value),2) AS total
        FROM metrics m
        JOIN departments dep ON dep.id = m.department_id
        WHERE {where}
          AND m.recorded_on >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY month ORDER BY month ASC
    """, vals)
    rows = cur.fetchall(); cur.close(); db.close()
    return jsonify(rows)

@app.route("/api/metrics/by-department", methods=["GET"])
@jwt_required()
def metrics_by_dept():
    frm = request.args.get("from")
    to  = request.args.get("to")
    db = get_db(); cur = db.cursor(dictionary=True)
    conditions = ["1=1"]
    vals = []
    if frm: conditions.append("m.recorded_on >= %s"); vals.append(frm)
    if to:  conditions.append("m.recorded_on <= %s"); vals.append(to)
    where = " AND ".join(conditions)
    cur.execute(f"""
        SELECT dep.name AS department,
               ROUND(SUM(m.metric_value),2) AS total
        FROM metrics m
        JOIN departments dep ON dep.id = m.department_id
        WHERE {where}
        GROUP BY dep.name ORDER BY total DESC
    """, vals)
    rows = cur.fetchall(); cur.close(); db.close()
    return jsonify(rows)

@app.route("/api/metrics/top", methods=["GET"])
@jwt_required()
def metrics_top():
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT metric_name, ROUND(SUM(metric_value),2) AS total
        FROM metrics
        GROUP BY metric_name ORDER BY total DESC LIMIT 5
    """)
    rows = cur.fetchall(); cur.close(); db.close()
    return jsonify(rows)

@app.route("/api/metrics", methods=["GET"])
@jwt_required()
def list_metrics():
    page   = int(request.args.get("page", 1))
    limit  = int(request.args.get("limit", 10))
    offset = (page - 1) * limit
    dept   = request.args.get("department")
    frm    = request.args.get("from")
    to     = request.args.get("to")
    search = request.args.get("search", "")

    db = get_db(); cur = db.cursor(dictionary=True)
    conditions = ["1=1"]
    vals = []
    if dept:   conditions.append("dep.name = %s");              vals.append(dept)
    if frm:    conditions.append("m.recorded_on >= %s");        vals.append(frm)
    if to:     conditions.append("m.recorded_on <= %s");        vals.append(to)
    if search: conditions.append("m.metric_name LIKE %s");      vals.append(f"%{search}%")
    where = " AND ".join(conditions)

    cur.execute(f"""
        SELECT COUNT(*) AS total
        FROM metrics m JOIN departments dep ON dep.id=m.department_id
        WHERE {where}
    """, vals)
    total = cur.fetchone()["total"]

    cur.execute(f"""
        SELECT m.id, dep.name AS department, m.metric_name,
               m.metric_value, m.recorded_on,
               u.name AS uploaded_by, m.created_at
        FROM metrics m
        JOIN departments dep ON dep.id = m.department_id
        JOIN users u ON u.id = m.uploaded_by
        WHERE {where}
        ORDER BY m.recorded_on DESC
        LIMIT %s OFFSET %s
    """, vals + [limit, offset])
    rows = cur.fetchall(); cur.close(); db.close()
    for r in rows:
        if r.get("recorded_on"): r["recorded_on"] = r["recorded_on"].isoformat()
        if r.get("created_at"):  r["created_at"]  = r["created_at"].isoformat()
    return jsonify({"data": rows, "total": total, "page": page, "limit": limit,
                    "total_pages": (total + limit - 1) // limit})

# ═══════════════════════════════════════════════════════════════
#  DATA ENTRY ROUTES
# ═══════════════════════════════════════════════════════════════

@app.route("/api/metrics", methods=["POST"])
@roles_required("admin", "analyst")
def add_metric():
    uid  = int(get_jwt_identity())
    data = request.get_json()
    department  = data.get("department")
    metric_name = data.get("metric_name")
    metric_value= data.get("metric_value")
    recorded_on = data.get("recorded_on")
    if not all([department, metric_name, metric_value, recorded_on]):
        return jsonify(error="All fields required"), 400

    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT id FROM departments WHERE name=%s", (department,))
    dept = cur.fetchone()
    if not dept:
        cur.close(); db.close()
        return jsonify(error="Department not found"), 404

    cur.execute(
        "INSERT INTO metrics (department_id,metric_name,metric_value,recorded_on,uploaded_by) "
        "VALUES (%s,%s,%s,%s,%s)",
        (dept["id"], metric_name, metric_value, recorded_on, uid)
    )
    db.commit()
    mid = cur.lastrowid
    cur.execute("SELECT name FROM users WHERE id=%s", (uid,))
    uname = cur.fetchone()["name"]
    log_activity(db, cur, uid, f"{uname} added metric '{metric_name}' ({metric_value}) for {department}.")
    cur.close(); db.close()
    return jsonify(message="Metric added", id=mid), 201

@app.route("/api/metrics/upload", methods=["POST"])
@roles_required("admin", "analyst")
def upload_csv():
    uid = int(get_jwt_identity())
    if "file" not in request.files:
        return jsonify(error="No file provided"), 400
    f = request.files["file"]
    if not f.filename.endswith(".csv"):
        return jsonify(error="Only CSV files allowed"), 400

    stream = io.StringIO(f.stream.read().decode("utf-8-sig"))
    reader = csv.DictReader(stream)
    rows = list(reader)

    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT id, name FROM departments")
    dept_map = {r["name"]: r["id"] for r in cur.fetchall()}

    inserted = 0
    errors = []
    for i, row in enumerate(rows):
        try:
            dept_name   = row["department"].strip()
            metric_name = row["metric_name"].strip()
            metric_val  = float(row["metric_value"])
            rec_date    = row["recorded_on"].strip()
            dept_id     = dept_map.get(dept_name)
            if not dept_id:
                errors.append(f"Row {i+2}: Unknown department '{dept_name}'")
                continue
            cur.execute(
                "INSERT INTO metrics (department_id,metric_name,metric_value,recorded_on,uploaded_by) "
                "VALUES (%s,%s,%s,%s,%s)",
                (dept_id, metric_name, metric_val, rec_date, uid)
            )
            inserted += 1
        except Exception as e:
            errors.append(f"Row {i+2}: {str(e)}")

    db.commit()
    cur.execute("SELECT name FROM users WHERE id=%s", (uid,))
    uname = cur.fetchone()["name"]
    log_activity(db, cur, uid, f"{uname} uploaded CSV with {inserted} records.")
    cur.close(); db.close()
    return jsonify(message=f"{inserted} records uploaded successfully.", inserted=inserted, errors=errors), 201

@app.route("/api/metrics/<int:mid>", methods=["DELETE"])
@roles_required("admin")
def delete_metric(mid):
    uid = int(get_jwt_identity())
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT id, metric_name FROM metrics WHERE id=%s", (mid,))
    m = cur.fetchone()
    if not m: cur.close(); db.close(); return jsonify(error="Not found"), 404
    cur.execute("DELETE FROM metrics WHERE id=%s", (mid,))
    db.commit()
    cur.execute("SELECT name FROM users WHERE id=%s", (uid,))
    uname = cur.fetchone()["name"]
    log_activity(db, cur, uid, f"{uname} deleted metric #{mid} ('{m['metric_name']}').")
    cur.close(); db.close()
    return jsonify(message="Deleted")

# ═══════════════════════════════════════════════════════════════
#  ACTIVITY LOG
# ═══════════════════════════════════════════════════════════════

@app.route("/api/activity", methods=["GET"])
@jwt_required()
def activity():
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("""
        SELECT a.id, a.action, a.created_at, u.name AS user_name
        FROM activity_log a JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC LIMIT 20
    """)
    rows = cur.fetchall(); cur.close(); db.close()
    for r in rows:
        if r.get("created_at"): r["created_at"] = r["created_at"].isoformat()
    return jsonify(rows)

@app.route("/api/departments", methods=["GET"])
@jwt_required()
def departments():
    db = get_db(); cur = db.cursor(dictionary=True)
    cur.execute("SELECT id, name FROM departments ORDER BY name")
    rows = cur.fetchall(); cur.close(); db.close()
    return jsonify(rows)

# ── WebSocket ──────────────────────────────────────────────────
@socketio.on("connect")
def on_connect():
    print("Client connected:", request.sid)

@socketio.on("disconnect")
def on_disconnect():
    print("Client disconnected:", request.sid)

# ── Run ────────────────────────────────────────────────────────
if __name__ == "__main__":
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
