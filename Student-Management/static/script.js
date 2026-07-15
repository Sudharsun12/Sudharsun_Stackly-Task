// ==============================
// Student Management System
// script.js
// ==============================

// Form Elements
const studentForm = document.getElementById("studentForm");
const studentTable = document.getElementById("studentTable");
const submitBtn = document.getElementById("submitBtn");

// Dashboard
const totalStudents = document.getElementById("totalStudents");
const pythonCount = document.getElementById("pythonCount");
const javaCount = document.getElementById("javaCount");
const reactCount = document.getElementById("reactCount");

// Search
const searchInput = document.getElementById("searchInput");

// Edit Variable
let editId = null;

// =======================================
// LOAD ALL STUDENTS
// =======================================

async function loadStudents() {

    try {

        const response = await fetch("/api/students");

        const students = await response.json();

        studentTable.innerHTML = "";

        let python = 0;
        let java = 0;
        let react = 0;

        students.forEach(student => {

            if(student.course === "Python") python++;
            if(student.course === "Java") java++;
            if(student.course === "React") react++;

            studentTable.innerHTML += `

            <tr>

                <td>${student.id}</td>

                <td>${student.full_name}</td>

                <td>${student.email}</td>

                <td>${student.phone}</td>

                <td>${student.course}</td>

                <td>${student.enrolled_on}</td>

                <td>

                    <button onclick="editStudent(${student.id})">
                        Edit
                    </button>

                    <button onclick="deleteStudent(${student.id})">
                        Delete
                    </button>

                </td>

            </tr>

            `;

        });

        totalStudents.textContent = students.length;
        pythonCount.textContent = python;
        javaCount.textContent = java;
        reactCount.textContent = react;

    }

    catch(error){

        console.log(error);

    }

}

// =======================================
// ADD / UPDATE STUDENT
// =======================================

studentForm.addEventListener("submit", async function(e){

    e.preventDefault();

    const student = {

        full_name: document.getElementById("full_name").value,

        email: document.getElementById("email").value,

        phone: document.getElementById("phone").value,

        course: document.getElementById("course").value

    };

    let url = "/api/students";

    let method = "POST";

    if(editId !== null){

        url = `/api/students/${editId}`;

        method = "PUT";

    }

    try{

        const response = await fetch(url,{

            method:method,

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify(student)

        });

        const result = await response.json();

        if(response.ok){

            alert(result.message);

            studentForm.reset();

            editId = null;

            submitBtn.innerText = "Add Student";

            loadStudents();

        }

        else{

            alert(result.error);

        }

    }

    catch(error){

        console.log(error);

        alert("Unable to connect to server.");

    }

});
// =======================================
// EDIT STUDENT
// =======================================

function editStudent(id){

    const rows = document.querySelectorAll("#studentTable tr");

    rows.forEach(row=>{

        if(Number(row.cells[0].innerText)===id){

            editId=id;

            document.getElementById("full_name").value=row.cells[1].innerText;

            document.getElementById("email").value=row.cells[2].innerText;

            document.getElementById("phone").value=row.cells[3].innerText;

            document.getElementById("course").value=row.cells[4].innerText;

            submitBtn.innerText="Update Student";

            window.scrollTo({
                top:0,
                behavior:"smooth"
            });

        }

    });

}
//=======================================
//DELETE STUDENT
//=======================================
async function deleteStudent(id) {

    const confirmDelete = confirm("Are you sure you want to delete this student?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(`/api/students/${id}`, {

            method: "DELETE"

        });

        const result = await response.json();

        if (response.ok) {

            alert(result.message);

            loadStudents();

        } else {

            alert(result.error);

        }

    } catch (error) {

        console.log(error);

        alert("Server Connection Failed!");

    }

}

// =======================================
// SEARCH
// =======================================

searchInput.addEventListener("keyup", async function () {

    const keyword = this.value;

    try {

        const response = await fetch(`/api/students/search?q=${encodeURIComponent(keyword)}`);

        const students = await response.json();

        studentTable.innerHTML = "";

        let python = 0;
        let java = 0;
        let react = 0;

        students.forEach(student => {

            if (student.course === "Python") python++;
            if (student.course === "Java") java++;
            if (student.course === "React") react++;

            studentTable.innerHTML += `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.full_name}</td>
                    <td>${student.email}</td>
                    <td>${student.phone}</td>
                    <td>${student.course}</td>
                    <td>${student.enrolled_on}</td>
                    <td>
                        <button onclick="editStudent(${student.id})">
                            Edit
                        </button>

                        <button onclick="deleteStudent(${student.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        totalStudents.textContent = students.length;
        pythonCount.textContent = python;
        javaCount.textContent = java;
        reactCount.textContent = react;

    } catch (error) {

        console.log(error);

    }

});

// =======================================
// LOAD DATA WHEN PAGE OPENS
// =======================================

loadStudents();