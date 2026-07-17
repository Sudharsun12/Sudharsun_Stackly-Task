console.log("Script Loaded");
async function registerUser(){
    console.log("Register button clicked");
    console.log("BUTTON CLICKED");

    let username =
    document.getElementById("username").value;


    let email =
    document.getElementById("email").value;


    let password =
    document.getElementById("password").value;


    let confirmPassword =
    document.getElementById("confirmPassword").value;



    let message =
    document.getElementById("message");



    if(password !== confirmPassword){

        message.innerHTML =
        "Passwords do not match";

        return;
    }




    let response = await fetch(
        "http://127.0.0.1:5001/register",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                username:username,

                email:email,

                password:password

            })
        }
    );




    let data = await response.json();



    message.innerHTML = data.message;



    if(response.status === 201){

        setTimeout(()=>{

            window.location.href="login.html";

        },1000);

    }

}
async function loginUser() {

    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;

    let message = document.getElementById("loginMessage");

    if (username === "" || password === "") {

        message.innerHTML = "Please fill all fields.";
        return;
    }

    try {

        let response = await fetch("http://127.0.0.1:5001/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            credentials: "include",

            body: JSON.stringify({

                username: username,
                password: password

            })

        });

        let data = await response.json();

        message.innerHTML = data.message;

        if (response.status === 200) {

            setTimeout(() => {

                window.location.href = "/static/dashboard.html";

            }, 1000);

        }

    }
    catch (error) {

        message.innerHTML = "Unable to connect to server.";

        console.log(error);

    }

}
async function loadDashboard(){

    try{

        let response=await fetch(

            "http://127.0.0.1:5001/profile",

            {

                method:"GET",

                credentials:"include"

            }

        );

        if(response.status!==200){

            window.location.href="/static/login.html";

            return;

        }

        let data=await response.json();

        document.getElementById("username").innerHTML=data.username;

        document.getElementById("email").innerHTML=data.email;

        document.getElementById("role").innerHTML=data.role;

        document.getElementById("created_at").innerHTML=
        new Date(data.created_at).toDateString();

    }

    catch(error){

        console.log(error);

    }

}



async function logoutUser(){

    await fetch(

        "http://127.0.0.1:5001/logout",

        {

            method:"GET",

            credentials:"include"

        }

    );

    window.location.href="/static/login.html";

}