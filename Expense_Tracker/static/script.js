// ======================================
// Base API URL
// ======================================

const API = "http://127.0.0.1:5000";


// ======================================
// Register User
// ======================================

async function registerUser() {

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const response = await fetch(`${API}/register`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            email,
            password
        })
    });

    const result = await response.json();

    alert(result.message);

    if (response.status === 201) {
        window.location.href = "/login-page";
    }

}


// ======================================
// Login User
// ======================================

async function loginUser() {

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Please enter Username and Password");
        return;
    }

    const response = await fetch(`${API}/login`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    });

    const result = await response.json();

    alert(result.message);

    if (response.status === 200) {
        window.location.href = "/dashboard-page";
    }

}


// ======================================
// Logout
// ======================================

async function logout() {

    await fetch(`${API}/logout`, {
        credentials: "include"
    });

    window.location.href = "/";
}


// ======================================
// Check Login Session
// ======================================

async function checkSession() {

    const response = await fetch(`${API}/check-session`, {
        credentials: "include"
    });

    if (response.status === 401) {
        window.location.href = "/";
        return;
    }

    const result = await response.json();

    const welcome = document.getElementById("welcomeUser");

    if (welcome) {
        welcome.innerHTML = "Welcome, " + result.username;
    }

}


// ======================================
// Load Dashboard Summary
// ======================================

async function loadDashboard() {

    const response = await fetch(`${API}/expenses/summary`, {
        credentials: "include"
    });

    if (response.status === 401) {
        window.location.href = "/";
        return;
    }

    const data = await response.json();

    document.getElementById("expenseCount").innerHTML =
        data.summary.total_expenses;

    document.getElementById("totalAmount").innerHTML =
        "₹ " + data.summary.total_amount;

    document.getElementById("highestExpense").innerHTML =
        "₹ " + data.summary.highest_expense;

    document.getElementById("categoryCount").innerHTML =
        data.summary.total_categories;


    // =============================
    // Category Breakdown
    // =============================

    const categoryContainer =
        document.getElementById("categoryContainer");

    if (categoryContainer) {

        categoryContainer.innerHTML = "";

        let total = Number(data.summary.total_amount);

        data.categories.forEach(item => {

            let percent = total === 0
                ? 0
                : (item.total / total) * 100;

            categoryContainer.innerHTML += `
                <p>${item.category} - ₹${item.total}</p>

                <div style="
                    width:100%;
                    background:#ddd;
                    border-radius:5px;
                    margin-bottom:15px;
                ">

                    <div style="
                        width:${percent}%;
                        background:#28a745;
                        color:white;
                        padding:8px;
                        border-radius:5px;
                        text-align:center;
                    ">
                        ${percent.toFixed(1)}%
                    </div>

                </div>
            `;

        });

    }


    // =============================
    // Recent Expenses
    // =============================

    const recent =
        document.getElementById("recentExpenses");

    if (recent) {

        recent.innerHTML = "";

        data.recent_expenses.forEach(expense => {

            recent.innerHTML += `
                <tr>

                    <td>${expense.title}</td>

                    <td>₹ ${expense.amount}</td>

                    <td>${expense.category}</td>

                    <td>${expense.date}</td>

                </tr>
            `;

        });

    }

}


// ======================================
// Auto Load
// ======================================

window.onload = function () {

    if (window.location.pathname === "/dashboard-page") {

        checkSession();

        loadDashboard();

    }

};
// ======================================
// Global Variables
// ======================================

let editingExpenseId = null;


// ======================================
// Load All Expenses
// ======================================

async function loadExpenses() {

    const table = document.getElementById("expenseTable");

    if (!table) return;

    const response = await fetch(`${API}/expenses`, {
        credentials: "include"
    });

    if (response.status === 401) {
        window.location.href = "/";
        return;
    }

    const expenses = await response.json();

    table.innerHTML = "";

    expenses.forEach(expense => {

        table.innerHTML += `
            <tr>

                <td>${expense.title}</td>

                <td>₹ ${expense.amount}</td>

                <td>${expense.category}</td>

                <td>${expense.date}</td>

                <td>${expense.note ?? ""}</td>

                <td>

                    <button onclick="editExpense(${expense.id},
                    '${expense.title.replace(/'/g,"\\'")}',
                    ${expense.amount},
                    '${expense.category}',
                    '${expense.date}',
                    '${(expense.note || "").replace(/'/g,"\\'")}')">

                        Edit

                    </button>

                    <button
                    style="background:red;margin-top:8px;"
                    onclick="deleteExpense(${expense.id})">

                        Delete

                    </button>

                </td>

            </tr>
        `;

    });

}


// ======================================
// Add / Update Expense
// ======================================

async function saveExpense() {

    const title = document.getElementById("title").value.trim();
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value.trim();

    if (!title || !amount || !category || !date) {
        alert("Please fill all required fields.");
        return;
    }

    let url = `${API}/expenses`;
    let method = "POST";

    if (editingExpenseId !== null) {
        url = `${API}/expenses/${editingExpenseId}`;
        method = "PUT";
    }

    const response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            amount,
            category,
            date,
            note
        })
    });

    const result = await response.json();

    alert(result.message);

    if (response.ok) {

        clearForm();

        editingExpenseId = null;

        const btn = document.getElementById("saveBtn");

        if (btn) {
            btn.innerHTML = "Save Expense";
        }

        loadExpenses();

    }

}


// ======================================
// Edit Expense
// ======================================

function editExpense(id, title, amount, category, date, note) {

    editingExpenseId = id;

    document.getElementById("title").value = title;
    document.getElementById("amount").value = amount;
    document.getElementById("category").value = category;
    document.getElementById("date").value = date;
    document.getElementById("note").value = note;

    const btn = document.getElementById("saveBtn");

    if (btn) {
        btn.innerHTML = "Update Expense";
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// ======================================
// Delete Expense
// ======================================

async function deleteExpense(id) {

    if (!confirm("Delete this expense?")) {
        return;
    }

    const response = await fetch(`${API}/expenses/${id}`, {
        method: "DELETE",
        credentials: "include"
    });

    const result = await response.json();

    alert(result.message);

    if (response.ok) {
        loadExpenses();
    }

}


// ======================================
// Filter Expenses
// ======================================

async function filterExpenses() {

    const category = document.getElementById("filterCategory").value;
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;

    let url = `${API}/expenses/filter?`;

    if (category) {
        url += `category=${encodeURIComponent(category)}&`;
    }

    if (fromDate && toDate) {
        url += `from=${fromDate}&to=${toDate}`;
    }

    const response = await fetch(url, {
        credentials: "include"
    });

    const expenses = await response.json();

    const table = document.getElementById("expenseTable");

    table.innerHTML = "";

    expenses.forEach(expense => {

        table.innerHTML += `
            <tr>

                <td>${expense.title}</td>

                <td>₹ ${expense.amount}</td>

                <td>${expense.category}</td>

                <td>${expense.date}</td>

                <td>${expense.note ?? ""}</td>

                <td>

                    <button onclick="editExpense(${expense.id},
                    '${expense.title.replace(/'/g,"\\'")}',
                    ${expense.amount},
                    '${expense.category}',
                    '${expense.date}',
                    '${(expense.note || "").replace(/'/g,"\\'")}')">

                        Edit

                    </button>

                    <button
                    style="background:red;margin-top:8px;"
                    onclick="deleteExpense(${expense.id})">

                        Delete

                    </button>

                </td>

            </tr>
        `;

    });

}


// ======================================
// Clear Form
// ======================================

function clearForm() {

    document.getElementById("title").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("category").selectedIndex = 0;
    document.getElementById("date").value = "";
    document.getElementById("note").value = "";

}


// ======================================
// Auto Load Expenses Page
// ======================================

window.addEventListener("load", function () {

    if (window.location.pathname === "/expenses-page") {

        checkSession();

        loadExpenses();

    }

});