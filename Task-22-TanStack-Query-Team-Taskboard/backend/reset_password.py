import sys
import os
import mysql.connector
from flask_bcrypt import generate_password_hash

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "Srisudhan@1223"),
    "database": os.getenv("DB_NAME", "task_manager"),
}

def reset_password(email: str, new_password: str):
    if len(new_password) < 6:
        print("Error: Password must be at least 6 characters.")
        return False

    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        cur = conn.cursor(dictionary=True)

        cur.execute("SELECT id, name, email, role FROM users WHERE email=%s", (email.strip().lower(),))
        user = cur.fetchone()

        if not user:
            print(f"Error: User with email '{email}' not found.")
            conn.close()
            return False

        hashed = generate_password_hash(new_password).decode("utf-8")
        cur.execute("UPDATE users SET password=%s WHERE id=%s", (hashed, user["id"]))
        conn.commit()

        print(f"Success: Password for '{user['name']}' ({user['email']}, role: {user['role']}) has been reset to '{new_password}'.")
        conn.close()
        return True
    except Exception as e:
        print(f"Database error: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        email = sys.argv[1]
        pwd = sys.argv[2]
    else:
        email = input("Enter user email (default: sudharsun@gmail.com): ").strip() or "sudharsun@gmail.com"
        pwd = input("Enter new password (default: admin123): ").strip() or "admin123"

    reset_password(email, pwd)
