const form = document.getElementById("registrationForm");

const fullname = document.getElementById("fullname");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const course = document.getElementById("course");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const successMessage = document.getElementById("successMessage");

const themeBtn = document.getElementById("themeBtn");

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("dark");

if(document.body.classList.contains("dark"))
themeBtn.innerHTML="☀️ Light Mode";

else
themeBtn.innerHTML="🌙 Dark Mode";

});

function clearErrors(){

let errors=document.querySelectorAll(".error");

errors.forEach(error=>error.innerHTML="");

}

function setError(input,message){

input.nextElementSibling.innerHTML=message;

}

form.addEventListener("submit",function(e){

e.preventDefault();

clearErrors();

let valid=true;

if(fullname.value.trim()==""){
setError(fullname,"Full Name is required");
valid=false;
}

const emailPattern=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(email.value.trim()==""){
setError(email,"Email is required");
valid=false;
}

else if(!emailPattern.test(email.value)){
setError(email,"Invalid Email");
valid=false;
}

const phonePattern=/^[0-9]{10}$/;

if(phone.value.trim()==""){
setError(phone,"Phone Number required");
valid=false;
}

else if(!phonePattern.test(phone.value)){
setError(phone,"Phone should contain 10 digits");
valid=false;
}

if(course.value==""){
setError(course,"Please select course");
valid=false;
}

if(password.value==""){
setError(password,"Password required");
valid=false;
}

if(confirmPassword.value==""){
setError(confirmPassword,"Confirm Password");
valid=false;
}

else if(password.value!=confirmPassword.value){
setError(confirmPassword,"Passwords do not match");
valid=false;
}

if(valid){

const student={

fullname:fullname.value,
email:email.value,
phone:phone.value,
course:course.value

};

let students=JSON.parse(localStorage.getItem("students")) || [];

students.push(student);

localStorage.setItem("students",JSON.stringify(students));

successMessage.innerHTML="Registration Successful ✔";

form.reset();

}

});