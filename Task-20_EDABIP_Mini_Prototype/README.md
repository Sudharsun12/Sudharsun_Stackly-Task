# EDABIP Mini Prototype — Enterprise Data Analytics & Business Intelligence

A full-stack, enterprise-grade business intelligence and analytics dashboard built with **React (Vite)**, **Python Flask**, and **MySQL 8.0**.

Departments across an organization upload their performance numbers (via single-entry forms or bulk CSV spreadsheets), and the platform visualizes KPIs, trends, department share, and live activity feeds in real-time via WebSockets.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Key Features |
|---|---|---|
| **Frontend** | React 18 + Vite | Recharts, Context API (Auth, Theme, Socket), Custom Hooks (`useForm`, `useToast`, `useDebounce`), Dark Mode |
| **Backend** | Python Flask | Flask-JWT-Extended, Flask-SocketIO (eventlet), Flask-Bcrypt, Flask-CORS, mysql-connector-python |
| **Database** | MySQL 8.0 | `users`, `departments`, `metrics`, `activity_log` |
| **Real-time** | WebSockets (Socket.IO) | Instant multi-client activity feed updates without page refreshes |

---

## 👥 Demo User Accounts (Pre-Seeded)

All accounts share the default password: **`password123`**

| Role | Email | Password | Access Privileges |
|---|---|---|---|
| **Admin** | `admin@edabip.com` | `password123` | Full dashboard, Add metrics, Upload CSV, Delete records, Live Audit logs |
| **Analyst** | `analyst@edabip.com` | `password123` | Full dashboard, Add metrics, Upload CSV, Cannot delete records |
| **Viewer** | `viewer@edabip.com` | `password123` | Read-only Dashboard & Profile; `/data` displays **403 Forbidden** |

---

## 🚀 Quick Setup Instructions

### 1. Database Setup (MySQL 8.0 / MySQL Workbench)
1. Open **MySQL Workbench 8.0** and connect to your local MySQL instance (`127.0.0.1:3306`).
2. Open and execute `backend/schema.sql` (or run `python backend/db_setup.py` which creates the database and populates 300+ initial metric records automatically):
   ```bash
   cd backend
   python db_setup.py
   ```

### 2. Backend Setup (Flask API on Port 5000)
```bash
cd backend
pip install -r requirements.txt
python app.py
```
*API will run at `http://127.0.0.1:5000` with WebSocket support enabled.*

### 3. Frontend Setup (React Vite on Port 5173)
```bash
cd frontend
npm install
npm run dev
```
*Access the application in your browser at `http://localhost:5173`.*

---

## 📬 Postman API Testing

A complete Postman collection is provided in the project root:
- **Collection File**: `postman_collection.json`
- **Sample CSV for Upload**: `sample_metrics.csv`

### How to Import & Test in Postman:
1. Open Postman -> Click **Import** -> Select `E:\edabip-mini\postman_collection.json`.
2. Run request **`Auth - 1. Login (Admin)`**. The test script automatically captures the returned JWT token into the `{{token}}` variable.
3. Execute any of the 13 pre-configured requests (`GET /api/kpis`, `GET /api/metrics/trend`, `POST /api/metrics/upload`, etc.).
4. Test role protection: Run **`Auth - 3. Login (Viewer)`**, then attempt **`Data - 10. Add Single Metric Record`** — observe the immediate `403 Forbidden` response.

---

## 📝 Capstone Submission Answers

### Q1. This task combines skills from 12+ tasks. Which part was hardest to connect together and why?
**Answer:**  
The most intricate integration was synchronizing the **state lifecycle between the WebSocket event pipeline and the Recharts dashboard filters**.  
When a user uploads a CSV file on `/data`, the backend executes bulk SQL inserts and immediately broadcasts an `activity_update` WebSocket event. On the frontend, `SocketContext` captures this event, alerts the active user with a badge, and updates `ActivityFeed`.  
However, making sure the `Dashboard` charts and KPI cards automatically re-query without breaking active filter parameters (`department`, `from`, `to`) or causing jittery re-renders required carefully wrapping filter state into a unified query dependency array in `useEffect`, alongside debouncing text inputs.

### Q2. How does your CSV upload work end to end? From file input to database insert.
**Answer:**  
1. **Frontend Selection & Parsing**: The user selects a `.csv` file in `DataManagement.jsx`. The browser uses `FileReader` to read the first few lines, extract headers, and generate a live **5-row preview table** so the user can verify columns before uploading.
2. **Form Submission**: Clicking "Upload All" constructs a `FormData` object with `file` and attaches the JWT `Authorization: Bearer <token>` header.
3. **Backend Receipt**: Flask receives the request at `POST /api/metrics/upload` under `@roles_required("admin", "analyst")`.
4. **Validation & Mapping**: Flask reads the stream with `csv.DictReader`, looks up department IDs in the `departments` table, and validates rows (`department`, `metric_name`, `metric_value`, `recorded_on`).
5. **Bulk Insert & Audit**: Validated records are committed in MySQL via `cur.execute()`. Flask records the transaction in `activity_log` with the user ID and timestamp.
6. **Real-time Broadcast**: The backend emits `socketio.emit('activity_update', payload)`.
7. **Client Feedback**: The HTTP response returns `{"inserted": N, "errors": [...]}`. A toast displays the exact count ("48 records uploaded successfully"), and the records table refreshes.

### Q3. How does the activity feed update in real time? Trace the full path.
**Answer:**  
1. **User Action**: An Analyst uploads a CSV or adds a single record on the `/data` page.
2. **Backend Processing**: In `app.py`, `log_activity()` inserts a row into `activity_log` (e.g. `"Analyst User uploaded CSV with 6 records."`).
3. **Socket Emission**: Flask calls `socketio.emit("activity_update", payload)` where `payload` includes `{ id, action, user_name, created_at }`.
4. **WebSocket Transmission**: The event travels through the active Socket.IO connection over TCP/WebSocket to all connected browser clients.
5. **Frontend Listener**: In `SocketContext.jsx`, `socket.on("activity_update")` prepends the new event to `activities` state and increments `unreadCount`.
6. **Reactive UI Update**: `ActivityFeed.jsx` and `NotificationBell.jsx` immediately re-render, showing the new action with a pulse indicator and "just now" timestamp without requiring any manual browser refresh.

### Q4. Looking back across all 20 tasks, which concept changed how you think about building software the most?
**Answer:**  
**Decoupled State Management with Single Sources of Truth.**  
Earlier in development, state often feels local to components or passed down through deep prop chains, leading to brittle code and sync bugs. Moving to **Context API + Custom Hooks** (e.g., `useAuth`, `useToast`, `useDebounce`) combined with **Stateless Event-Driven Backend Architecture** (JWT auth + WebSocket broadcast) completely transforms how applications scale. The frontend becomes a reactive reflection of clean data streams, where any mutation seamlessly propagates across views and users in real time.