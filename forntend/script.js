// ================= CUSTOMER REGISTER =================
function customerRegister() {

    const name = document.getElementById("c_name").value.trim();
    const email = document.getElementById("c_email").value.trim();
    const password = document.getElementById("c_password").value.trim();
    const phone = document.getElementById("c_phone").value.trim(); // 🔥 ADD THIS
    const errorBox = document.getElementById("c_error");

    errorBox.innerText = "";

    if(!name || !email || !password || !phone){
        errorBox.style.color = "red";
        errorBox.innerText = "All fields required ❌";
        return;
    }

    // 📞 PHONE VALIDATION
    if(!/^[0-9]{10}$/.test(phone)){
        errorBox.style.color = "red";
        errorBox.innerText = "Enter valid 10 digit phone ❌";
        return;
    }

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name,
            email,
            password,
            role: "customer",
            phone   // ✅ now defined
        })
    })
    .then(res => res.json())
    .then(data => {

        if(data.status === "success"){
            errorBox.style.color = "green";
            errorBox.innerText = data.message;

            setTimeout(() => {
                window.location.href = "customer-login.html";
            }, 1000);

        } else {
            errorBox.style.color = "red";
            errorBox.innerText = data.message;
        }

    })
    .catch(()=>{
        errorBox.innerText = "Server error ❌";
    });
}



// ================= DRIVER REGISTER =================
function driverRegister() {

    const name = document.getElementById("d_name").value.trim();
    const email = document.getElementById("d_email").value.trim();
    const password = document.getElementById("d_password").value.trim();
    const phone = document.getElementById("d_phone").value.trim();
    const vehicle = document.getElementById("d_vehicle").value.trim();
    const errorBox = document.getElementById("d_error");

    errorBox.innerText = "";

    if(!name || !email || !password || !vehicle || !phone){
        errorBox.style.color = "red";
        errorBox.innerText = "All fields required ❌";
        return;
    }
    // 🔥 PHONE CHECK
      if(!/^[0-9]{10}$/.test(phone)){
      errorBox.style.color = "red";
      errorBox.innerText = "Enter valid 10 digit phone ❌";
      return;
}

    fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            name, email, password,
            role: "driver",
            vehicle,
            phone
        })
    })
    .then(res => res.json())
    .then(data => {

        if(data.status === "success"){
            errorBox.style.color = "green";
            errorBox.innerText = data.message;

            setTimeout(() => {
                window.location.href = "driver-login.html";
            }, 1000);

        } else {
            errorBox.style.color = "red";
            errorBox.innerText = data.message;
        }

    })
    .catch(()=>{
        errorBox.innerText = "Server error ❌";
    });
}



// ================= CUSTOMER LOGIN =================
function customerLogin() {

    const email = document.getElementById("c_email").value.trim();
    const password = document.getElementById("c_password").value.trim();
    const errorBox = document.getElementById("c_error");

    errorBox.innerText = "";

    if(!email || !password){
        errorBox.style.color = "red";
        errorBox.innerText = "Enter email & password ❌";
        return;
    }

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        if(data.status === "success" && data.role === "customer"){

            // 🔥 CORRECT LINE (IMPORTANT)
            localStorage.setItem("user_id", data.user_id);

            window.location.href = "customer-dashboard.html";

        } else {
            errorBox.style.color = "red";
            errorBox.innerText = data.message || "Invalid login ❌";
        }

    })
    .catch(()=>{
        errorBox.innerText = "Server error ❌";
    });
}



// ================= DRIVER LOGIN =================
function driverLogin() {

    const email = document.getElementById("d_email").value.trim();
    const password = document.getElementById("d_password").value.trim();
    const errorBox = document.getElementById("d_error");

    errorBox.innerText = "";

    if(!email || !password){
        errorBox.style.color = "red";
        errorBox.innerText = "Enter email & password ❌";
        return;
    }

    fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {

        if(data.status === "success" && data.role === "driver"){
            localStorage.setItem("user_id", data.user_id); // 🔥 IMPORTANT
            window.location.href = "driver-dashboard.html";
        } else {
            errorBox.style.color = "red";
            errorBox.innerText = data.message || "Invalid login ❌";
        }

    })
    .catch(()=>{
        errorBox.innerText = "Server error ❌";
    });

    function completeDelivery(orderId){
    fetch(`http://localhost:5000/update_order/${orderId}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({status:"completed"})
    })
    .then(()=>{
        alert("Delivery Completed ✅");
        loadOrders();
    });
}
}