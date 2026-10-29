import os
from datetime import date, datetime

import mysql.connector
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "change-me-in-production-please-32+chars")

bcrypt = Bcrypt(app)
jwt = JWTManager(app)

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "Srisudhan@1223"),
    "database": os.getenv("DB_NAME", "task_manager"),
}

STATUSES = ("todo", "in_progress", "done")
PRIORITIES = ("low", "medium", "high")

# In-memory token blocklist for logout (fine for a learning project)
revoked_tokens = set()


@jwt.token_in_blocklist_loader
def is_revoked(_header, payload):
    return payload["jti"] in revoked_tokens


# ---------- helpers ----------
def get_db():
    return mysql.connector.connect(**DB_CONFIG)


def serialize(row):
    if row is None:
        return None
    out = {}
    for k, v in row.items():
        out[k] = v.isoformat() if isinstance(v, (date, datetime)) else v
    return out


def run(sql, params=(), one=False, commit=False):
    conn = get_db()
    cur = conn.cursor(dictionary=True)
    try:
        cur.execute(sql, params)
        if commit:
            conn.commit()
            return cur.lastrowid
        rows = cur.fetchall()
        rows = [serialize(r) for r in rows]
        return (rows[0] if rows else None) if one else rows
    finally:
        cur.close()
        conn.close()


def current_user():
    return run(
        "SELECT id, name, email, role FROM users WHERE id=%s",
        (int(get_jwt_identity()),),
        one=True,
    )


def error(msg, code=400):
    return jsonify({"message": msg}), code


def parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


TASK_SELECT = """
    SELECT t.*, a.name AS assigned_name, c.name AS created_name
    FROM tasks t
    LEFT JOIN users a ON t.assigned_to = a.id
    JOIN users c ON t.created_by = c.id
"""


def visibility(user):
    """Admins see everything; members see tasks they created or are assigned to."""
    if user["role"] == "admin":
        return "1=1", []
    return "(t.created_by=%s OR t.assigned_to=%s)", [user["id"], user["id"]]


# ---------- auth ----------
@app.post("/api/register")
def register():
    d = request.get_json(silent=True) or {}
    name, email, password = (d.get("name") or "").strip(), (d.get("email") or "").strip().lower(), d.get("password") or ""
    if not name or not email or len(password) < 6:
        return error("Name, email and a password of at least 6 characters are required")
    if run("SELECT id FROM users WHERE email=%s", (email,), one=True):
        return error("Email already registered", 409)
    # First registered user becomes admin so the app is usable out of the box
    is_first = run("SELECT COUNT(*) AS n FROM users", one=True)["n"] == 0
    role = "admin" if is_first else "member"
    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    run("INSERT INTO users (name,email,password,role) VALUES (%s,%s,%s,%s)", (name, email, hashed, role), commit=True)
    return jsonify({"message": "Registered successfully", "role": role}), 201


@app.post("/api/login")
def login():
    d = request.get_json(silent=True) or {}
    email, password = (d.get("email") or "").strip().lower(), d.get("password") or ""
    row = run("SELECT * FROM users WHERE email=%s", (email,), one=True)
    if not row or not bcrypt.check_password_hash(row["password"], password):
        return error("Invalid email or password", 401)
    identity = str(row["id"])
    return jsonify(
        {
            "access_token": create_access_token(identity=identity),
            "refresh_token": create_refresh_token(identity=identity),
            "user": {"id": row["id"], "name": row["name"], "email": row["email"], "role": row["role"]},
        }
    )


@app.get("/api/logout")
@jwt_required()
def logout():
    revoked_tokens.add(get_jwt()["jti"])
    return jsonify({"message": "Logged out"})


@app.get("/api/me")
@jwt_required()
def me():
    user = current_user()
    return (jsonify(user), 200) if user else error("User not found", 404)


# ---------- tasks ----------
@app.get("/api/tasks")
@jwt_required()
def list_tasks():
    user = current_user()
    where, params = visibility(user)
    clauses = [where]

    status = request.args.get("status")
    priority = request.args.get("priority")
    assigned_to = request.args.get("assigned_to")
    search = (request.args.get("search") or "").strip()

    if status in STATUSES:
        clauses.append("t.status=%s"); params.append(status)
    if priority in PRIORITIES:
        clauses.append("t.priority=%s"); params.append(priority)
    if assigned_to and assigned_to.isdigit():
        clauses.append("t.assigned_to=%s"); params.append(int(assigned_to))
    if search:
        clauses.append("t.title LIKE %s"); params.append(f"%{search}%")

    page = max(int(request.args.get("page", 1) or 1), 1)
    limit = min(max(int(request.args.get("limit", 10) or 10), 1), 50)
    where_sql = " AND ".join(clauses)

    total = run(f"SELECT COUNT(*) AS n FROM tasks t WHERE {where_sql}", params, one=True)["n"]
    items = run(
        f"{TASK_SELECT} WHERE {where_sql} ORDER BY t.created_at DESC, t.id DESC LIMIT %s OFFSET %s",
        params + [limit, (page - 1) * limit],
    )
    return jsonify({"items": items, "total": total, "page": page, "limit": limit, "pages": max((total + limit - 1) // limit, 1)})


def can_view(user, task):
    return user["role"] == "admin" or user["id"] in (task["created_by"], task["assigned_to"])


@app.get("/api/tasks/<int:task_id>")
@jwt_required()
def get_task(task_id):
    user = current_user()
    task = run(f"{TASK_SELECT} WHERE t.id=%s", (task_id,), one=True)
    if not task:
        return error("Task not found", 404)
    if not can_view(user, task):
        return error("Forbidden", 403)
    return jsonify(task)


def validate_payload(d, existing=None):
    """Returns (clean_fields, error_message)."""
    clean = {}
    if "title" in d or existing is None:
        title = (d.get("title") or "").strip()
        if not title:
            return None, "Title is required"
        if len(title) > 150:
            return None, "Title must be 150 characters or fewer"
        clean["title"] = title
    if "description" in d:
        clean["description"] = d.get("description") or None
    if "status" in d:
        if d["status"] not in STATUSES:
            return None, "Invalid status"
        clean["status"] = d["status"]
    if "priority" in d:
        if d["priority"] not in PRIORITIES:
            return None, "Invalid priority"
        clean["priority"] = d["priority"]
    if "assigned_to" in d:
        a = d["assigned_to"]
        if a in (None, ""):
            clean["assigned_to"] = None
        else:
            if not run("SELECT id FROM users WHERE id=%s", (a,), one=True):
                return None, "Assigned user does not exist"
            clean["assigned_to"] = int(a)
    if "due_date" in d:
        raw = d["due_date"]
        if raw in (None, ""):
            clean["due_date"] = None
        else:
            parsed = parse_date(raw)
            if not parsed:
                return None, "due_date must be YYYY-MM-DD"
            unchanged = existing and existing.get("due_date") == parsed.isoformat()
            if parsed <= date.today() and not unchanged:
                return None, "Due date must be in the future"
            clean["due_date"] = parsed
    return clean, None


@app.post("/api/tasks")
@jwt_required()
def create_task():
    user = current_user()
    d = request.get_json(silent=True) or {}
    clean, err = validate_payload(d)
    if err:
        return error(err)
    if user["role"] != "admin":
        clean.pop("assigned_to", None)  # members can't assign; defaults to unassigned
    clean["created_by"] = user["id"]
    cols = ", ".join(clean.keys())
    ph = ", ".join(["%s"] * len(clean))
    new_id = run(f"INSERT INTO tasks ({cols}) VALUES ({ph})", list(clean.values()), commit=True)
    return jsonify(run(f"{TASK_SELECT} WHERE t.id=%s", (new_id,), one=True)), 201


@app.put("/api/tasks/<int:task_id>")
@jwt_required()
def update_task(task_id):
    user = current_user()
    task = run("SELECT * FROM tasks WHERE id=%s", (task_id,), one=True)
    if not task:
        return error("Task not found", 404)
    if not can_view(user, task):
        return error("Forbidden", 403)
    d = request.get_json(silent=True) or {}
    clean, err = validate_payload(d, existing=task)
    if err:
        return error(err)
    if user["role"] != "admin":
        clean.pop("assigned_to", None)
    if not clean:
        return error("Nothing to update")
    sets = ", ".join(f"{k}=%s" for k in clean)
    run(f"UPDATE tasks SET {sets} WHERE id=%s", list(clean.values()) + [task_id], commit=True)
    return jsonify(run(f"{TASK_SELECT} WHERE t.id=%s", (task_id,), one=True))


@app.delete("/api/tasks/<int:task_id>")
@jwt_required()
def delete_task(task_id):
    user = current_user()
    task = run("SELECT * FROM tasks WHERE id=%s", (task_id,), one=True)
    if not task:
        return error("Task not found", 404)
    if user["role"] != "admin" and task["created_by"] != user["id"]:
        return error("Only an admin or the creator can delete a task", 403)
    run("DELETE FROM tasks WHERE id=%s", (task_id,), commit=True)
    return jsonify({"message": "Task deleted"})


# ---------- dashboard ----------
@app.get("/api/stats")
@jwt_required()
def stats():
    user = current_user()
    where, params = visibility(user)
    base = f"FROM tasks t WHERE {where}"

    total = run(f"SELECT COUNT(*) AS n {base}", params, one=True)["n"]
    by_status = {s: 0 for s in STATUSES}
    for r in run(f"SELECT t.status AS k, COUNT(*) AS n {base} GROUP BY t.status", params):
        by_status[r["k"]] = r["n"]
    by_priority = {p: 0 for p in PRIORITIES}
    for r in run(f"SELECT t.priority AS k, COUNT(*) AS n {base} GROUP BY t.priority", params):
        by_priority[r["k"]] = r["n"]
    overdue = run(f"SELECT COUNT(*) AS n {base} AND t.due_date < CURDATE() AND t.status <> 'done'", params, one=True)["n"]
    done_week = run(
        f"SELECT COUNT(*) AS n {base} AND t.status='done' AND YEARWEEK(t.updated_at,1)=YEARWEEK(CURDATE(),1)",
        params,
        one=True,
    )["n"]
    return jsonify(
        {
            "total": total,
            "by_status": by_status,
            "by_priority": by_priority,
            "overdue": overdue,
            "completed_this_week": done_week,
        }
    )


@app.get("/api/users")
@jwt_required()
def list_users():
    if current_user()["role"] != "admin":
        return error("Admin only", 403)
    return jsonify(run("SELECT id, name, email, role FROM users ORDER BY name"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
