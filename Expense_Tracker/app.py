from flask import Flask, request, jsonify, session
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_session import Session
import mysql.connector
from datetime import datetime

app = Flask(__name__)

# =====================================================
# Flask Configuration
# =====================================================

app.secret_key = "expense_tracker_secret_key"

app.config["SESSION_TYPE"] = "filesystem"
Session(app)

CORS(app, supports_credentials=True)

bcrypt = Bcrypt(app)

# =====================================================
# Database Connection
# =====================================================

def get_db_connection():
    return mysql.connector.connect(
        host="127.0.0.1",
        port=3306,
        user="root",
        password="Srisudhan@1223",
        database="expense_tracker"
    )


# =====================================================
# Helper Functions
# =====================================================

def is_logged_in():
    return "user_id" in session


ALLOWED_CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Health",
    "Education",
    "Entertainment",
    "Other"
]


# =====================================================
# Page Routes
# =====================================================

@app.route("/")
def home():
    return app.send_static_file("login.html")


@app.route("/login-page")
def login_page():
    return app.send_static_file("login.html")


@app.route("/register-page")
def register_page():
    return app.send_static_file("register.html")


@app.route("/dashboard-page")
def dashboard_page():
    return app.send_static_file("dashboard.html")


@app.route("/expenses-page")
def expenses_page():
    return app.send_static_file("expenses.html")


# =====================================================
# Authentication Routes
# =====================================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not username or not email or not password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

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
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Username or Email already exists"
        }), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

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

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Registration Successful"
    }), 201


@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({
            "message": "Username and Password are required"
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE username=%s
        """,
        (username,)
    )

    user = cursor.fetchone()

    if not user:
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Invalid Username"
        }), 401

    if not bcrypt.check_password_hash(user["password"], password):
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Invalid Password"
        }), 401

    session["user_id"] = user["id"]
    session["username"] = user["username"]

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Login Successful",
        "username": user["username"]
    }), 200


@app.route("/logout")
def logout():

    session.clear()

    return jsonify({
        "message": "Logged Out Successfully"
    }), 200


@app.route("/check-session")
def check_session():

    if not is_logged_in():
        return jsonify({
            "logged_in": False
        }), 401

    return jsonify({
        "logged_in": True,
        "username": session["username"]
    }), 200
# =====================================================
# Expense Routes
# =====================================================

@app.route("/expenses", methods=["POST"])
def add_expense():

    if not is_logged_in():
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()

    title = data.get("title", "").strip()
    amount = data.get("amount")
    category = data.get("category", "").strip()
    date = data.get("date", "").strip()
    note = data.get("note", "").strip()

    if not title or amount is None or not category or not date:
        return jsonify({"message": "All required fields are mandatory"}), 400

    if category not in ALLOWED_CATEGORIES:
        return jsonify({"message": "Invalid Category"}), 400

    try:
        amount = float(amount)
        if amount <= 0:
            return jsonify({"message": "Amount must be greater than zero"}), 400
    except:
        return jsonify({"message": "Invalid Amount"}), 400

    try:
        datetime.strptime(date, "%Y-%m-%d")
    except:
        return jsonify({"message": "Invalid Date"}), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO expenses
        (user_id,title,amount,category,date,note)
        VALUES(%s,%s,%s,%s,%s,%s)
    """,(
        session["user_id"],
        title,
        amount,
        category,
        date,
        note
    ))

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message":"Expense Added Successfully"
    }),201


@app.route("/expenses", methods=["GET"])
def get_expenses():

    if not is_logged_in():
        return jsonify({"message":"Unauthorized"}),401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            id,
            title,
            amount,
            category,
            date,
            note
        FROM expenses
        WHERE user_id=%s
        ORDER BY date DESC,id DESC
    """,(session["user_id"],))

    expenses = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(expenses),200


@app.route("/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):

    if not is_logged_in():
        return jsonify({"message":"Unauthorized"}),401

    data = request.get_json()

    title = data.get("title","").strip()
    amount = data.get("amount")
    category = data.get("category","").strip()
    date = data.get("date","").strip()
    note = data.get("note","").strip()

    if not title or amount is None or not category or not date:
        return jsonify({"message":"All required fields are mandatory"}),400

    if category not in ALLOWED_CATEGORIES:
        return jsonify({"message":"Invalid Category"}),400

    try:
        amount=float(amount)
        if amount<=0:
            return jsonify({"message":"Amount must be greater than zero"}),400
    except:
        return jsonify({"message":"Invalid Amount"}),400

    try:
        datetime.strptime(date,"%Y-%m-%d")
    except:
        return jsonify({"message":"Invalid Date"}),400

    connection=get_db_connection()
    cursor=connection.cursor()

    cursor.execute("""
        UPDATE expenses
        SET
            title=%s,
            amount=%s,
            category=%s,
            date=%s,
            note=%s
        WHERE
            id=%s
            AND user_id=%s
    """,(
        title,
        amount,
        category,
        date,
        note,
        expense_id,
        session["user_id"]
    ))

    connection.commit()

    if cursor.rowcount==0:
        cursor.close()
        connection.close()
        return jsonify({"message":"Expense Not Found"}),404

    cursor.close()
    connection.close()

    return jsonify({
        "message":"Expense Updated Successfully"
    }),200


@app.route("/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):

    if not is_logged_in():
        return jsonify({"message":"Unauthorized"}),401

    connection=get_db_connection()
    cursor=connection.cursor()

    cursor.execute("""
        DELETE FROM expenses
        WHERE
            id=%s
            AND user_id=%s
    """,(
        expense_id,
        session["user_id"]
    ))

    connection.commit()

    if cursor.rowcount==0:
        cursor.close()
        connection.close()
        return jsonify({"message":"Expense Not Found"}),404

    cursor.close()
    connection.close()

    return jsonify({
        "message":"Expense Deleted Successfully"
    }),200


# =====================================================
# Dashboard Summary
# =====================================================

@app.route("/expenses/summary", methods=["GET"])
def expense_summary():

    if not is_logged_in():
        return jsonify({"message":"Unauthorized"}),401

    connection=get_db_connection()
    cursor=connection.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            IFNULL(SUM(amount),0) AS total_amount,
            COUNT(*) AS total_expenses,
            IFNULL(MAX(amount),0) AS highest_expense,
            COUNT(DISTINCT category) AS total_categories
        FROM expenses
        WHERE user_id=%s
    """,(session["user_id"],))

    summary=cursor.fetchone()

    cursor.execute("""
        SELECT
            category,
            SUM(amount) AS total
        FROM expenses
        WHERE user_id=%s
        GROUP BY category
        ORDER BY total DESC
    """,(session["user_id"],))

    categories=cursor.fetchall()

    cursor.execute("""
        SELECT
            id,
            title,
            amount,
            category,
            date,
            note
        FROM expenses
        WHERE user_id=%s
        ORDER BY date DESC,id DESC
        LIMIT 5
    """,(session["user_id"],))

    recent=cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify({
        "summary":summary,
        "categories":categories,
        "recent_expenses":recent
    }),200


# =====================================================
# Filter Expenses
# =====================================================

@app.route("/expenses/filter", methods=["GET"])
def filter_expenses():

    if not is_logged_in():
        return jsonify({"message":"Unauthorized"}),401

    category=request.args.get("category")
    from_date=request.args.get("from")
    to_date=request.args.get("to")
    search=request.args.get("search")

    query="""
        SELECT
            id,
            title,
            amount,
            category,
            date,
            note
        FROM expenses
        WHERE user_id=%s
    """

    values=[session["user_id"]]

    if category:
        query+=" AND category=%s"
        values.append(category)

    if from_date and to_date:
        query+=" AND date BETWEEN %s AND %s"
        values.extend([from_date,to_date])

    if search:
        query+=" AND title LIKE %s"
        values.append(f"%{search}%")

    query+=" ORDER BY date DESC,id DESC"

    connection=get_db_connection()
    cursor=connection.cursor(dictionary=True)

    cursor.execute(query,tuple(values))

    expenses=cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(expenses),200


# =====================================================
# Run Application
# =====================================================

if __name__ == "__main__":
    app.run(debug=True)