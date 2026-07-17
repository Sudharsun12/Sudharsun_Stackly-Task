// ===============================
// Select HTML Elements
// ===============================

const taskInput = document.getElementById("taskInput");
const priority = document.getElementById("priority");
const addBtn = document.getElementById("addBtn");
const taskContainer = document.getElementById("taskContainer");
const total = document.getElementById("total");
const pending = document.getElementById("pending");


// ===============================
// Load Tasks from localStorage
// ===============================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];


// Current Filter
let currentFilter = "all";


// ===============================
// Initial Display
// ===============================

displayTasks();


// ===============================
// Add Button Event
// ===============================

addBtn.addEventListener("click", addTask);


// ===============================
// Add Task using Enter Key
// ===============================

taskInput.addEventListener("keypress", function(event){

    if(event.key === "Enter"){

        addTask();

    }

});


// ===============================
// Filter Button Events
// ===============================

const filterButtons = document.querySelectorAll(".filter button");

filterButtons.forEach(function(button){

    button.addEventListener("click", function(){

        filterButtons.forEach(function(btn){

            btn.classList.remove("active");

        });

        this.classList.add("active");

        currentFilter = this.dataset.filter;

        displayTasks();

    });

});


// ===============================
// Add Task Function
// ===============================

function addTask(){

    const title = taskInput.value.trim();

    if(title === ""){

        alert("Please enter a task.");

        return;

    }

    // Prevent duplicate tasks

    const duplicate = tasks.some(function(task){

        return task.title.toLowerCase() === title.toLowerCase();

    });

    if(duplicate){

        alert("Task already exists.");

        return;

    }

    const task = {

        id: Date.now(),

        title: title,

        priority: priority.value,

        completed: false,

        date: new Date().toLocaleString()

    };

    tasks.push(task);

    saveTasks();

    taskInput.value = "";

    displayTasks();

}


// ===============================
// Save Tasks into localStorage
// ===============================

function saveTasks(){

    localStorage.setItem("tasks", JSON.stringify(tasks));

}
// ===============================
// Display Tasks
// ===============================

function displayTasks() {

    taskContainer.innerHTML = "";

    let filteredTasks = tasks;

    // Apply Filter
    if (currentFilter === "pending") {

        filteredTasks = tasks.filter(function (task) {
            return !task.completed;
        });

    } else if (currentFilter === "completed") {

        filteredTasks = tasks.filter(function (task) {
            return task.completed;
        });

    }

    // Empty State
    if (filteredTasks.length === 0) {

        taskContainer.innerHTML =
            "<div class='empty'>No tasks available.</div>";

        updateCounter();

        return;

    }

    // Create Task Cards
    filteredTasks.forEach(function (task) {

        const card = document.createElement("div");

        card.className = "task";

        if (task.completed) {

            card.classList.add("completed");

        }

        let badgeClass = "";

        if (task.priority === "High") {

            badgeClass = "high";

        } else if (task.priority === "Medium") {

            badgeClass = "medium";

        } else {

            badgeClass = "low";

        }

        card.innerHTML = `

        <div class="left">

            <input type="checkbox"
            ${task.completed ? "checked" : ""}>

            <div class="info">

                <span class="title">
                    ${task.title}
                </span>

                <span class="badge ${badgeClass}">
                    ${task.priority}
                </span>

                <span class="date">
                    ${task.date}
                </span>

            </div>

        </div>

        <button class="delete">
            Delete
        </button>

        `;

        // Complete Task

        const checkbox = card.querySelector("input");

        checkbox.addEventListener("change", function () {

            task.completed = !task.completed;

            saveTasks();

            displayTasks();

        });

        // Delete Task

        const deleteButton = card.querySelector(".delete");

        deleteButton.addEventListener("click", function () {

            const confirmDelete = confirm(
                "Are you sure you want to delete this task?"
            );

            if (confirmDelete) {

                tasks = tasks.filter(function (t) {

                    return t.id !== task.id;

                });

                saveTasks();

                displayTasks();

            }

        });

        taskContainer.appendChild(card);

    });

    updateCounter();

}


// ===============================
// Update Task Counter
// ===============================

function updateCounter() {

    total.textContent = tasks.length;

    const pendingTasks = tasks.filter(function (task) {

        return !task.completed;

    });

    pending.textContent = pendingTasks.length;

}