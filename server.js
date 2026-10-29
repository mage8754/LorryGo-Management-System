const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/lorryDB")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

const User = require("./models/User");
const Order = require("./models/Order");

// ================= map2.1=================
app.post("/update-location", async (req, res) => {
    const { driverId, lat, lng } = req.body;

    await User.findByIdAndUpdate(driverId, {
        lat,
        lng
    });

    res.json({ status: "updated" });
});

app.get("/get-location/:driverId", async (req, res) => {
try {
    const driver = await User.findById(req.params.driverId);

    if (!driver) {
        return res.json({ lat: null, lng: null });
    }

    res.json({
        lat: driver.lat,
        lng: driver.lng
    });

} catch (err) {
    console.log(err);
    res.json({ lat: null, lng: null });
}
});
// ================= REGISTER =================
app.post("/register", async (req, res) => {
try {
    const { name, email, password, role, vehicle, phone } = req.body;

    if (!name || !email || !password || !role ||
       (role === "driver" && (!vehicle || !phone))) {
        return res.json({ status: "fail", message: "Fill all fields" });
    }

    if(role === "driver"){
        const phoneRegex = /^[0-9]{10}$/;
        if(!phoneRegex.test(phone)){
            return res.json({
                status: "fail",
                message: "Phone must be exactly 10 digits ❌"
            });
        }
    }

    const existing = await User.findOne({ email });

    if (existing) {
        return res.json({ status: "fail", message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

     const user = new User({
     name,
     email,
     password: hashed,
     role,
     vehicle: role === "driver" ? vehicle : "",

     // 🔥 FIX
      phone: phone || ""   // ✅ BOTH driver + customer save
     });

    await user.save();

    res.json({ status: "success", message: "Registered Successfully" });

} catch (err) {
    console.log(err);
    res.json({ status: "fail", message: "Error" });
}
});


// ================= LOGIN =================
app.post("/login", async (req, res) => {
try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if(!user){
        return res.json({ status: "fail", message: "Email not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if(!match){
        return res.json({ status: "fail", message: "Wrong password" });
    }

    res.json({
        status: "success",
        role: user.role,
        user_id: user._id,
         // 🔥 ADD THIS
        name: user.name,
        phone: user.phone
    });

} catch (err) {
    console.log(err);
    res.json({ status: "fail", message: "Server error" });
}
});


// ================= CREATE ORDER =================
app.post("/create_order", async (req, res) => {
try {
    const {
        pickup,
        drop,
        load,
        lorry_type,
        weight,
        distance,
        customer_id
    } = req.body;

    // 🔥 CHECK CUSTOMER ID
    if(!customer_id){
        return res.json({ message: "Customer ID missing ❌" });
    }

    const customer = await User.findById(customer_id);

    if(!customer){
        return res.json({ message: "Customer not found ❌" });
    }

    const order = new Order({
        pickup,
        drop,
        load,
        lorry_type,
        weight,
        distance,

        customer_id,
        customer_name: customer.name || "Unknown",
        customer_phone: customer.phone || "Not Available",

        status: "pending"
    });

    await order.save();

    res.json({ message: "Order Created 🚚" });

} catch (err) {
    console.log(err);
    res.json({ message: "Error ❌" });
}
});


// ================= GET ORDERS =================
app.get("/orders", async (req, res) => {
try {
    const orders = await Order.find();
    res.json(orders);
} catch (err) {
    console.log(err);
    res.status(500).json({ error: "Server error" });
}
});

app.get("/driver-search", async (req, res) => {

    try {

        const pickup = req.query.pickup || "";
        const drop = req.query.drop || "";

        console.log("Pickup:", pickup);
        console.log("Drop:", drop);

        // First word மட்டும் எடுக்க
        const pickupShort = pickup.split(",")[0].trim();
        const dropShort = drop.split(",")[0].trim();

        const orders = await Order.find({
            pickup: { $regex: pickupShort, $options: "i" },
            drop: { $regex: dropShort, $options: "i" }
        });

        console.log("Orders Found:", orders);

        res.json(orders);

    } catch (err) {

        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });

    }

});


// ================= ACCEPT ORDER =================
app.post("/accept_order", async (req, res) => {
try{
    const { order_id, driver_id } = req.body;

    const driver = await User.findById(driver_id);

    if (!driver) {
        return res.send("Driver not found ❌");
    }

const otp = Math.floor(1000 + Math.random() * 9000).toString();

const message = `Your delivery OTP is ${otp}`;

const whatsappLink = `https://wa.me/91${driver.phone}?text=${encodeURIComponent(message)}`;

      await Order.findByIdAndUpdate(order_id, {
      driver_id: driver._id,
      driver_name: driver.name,
      driver_phone: driver.phone,
      driver_vehicle: driver.vehicle,
      driver_lat: driver.lat,
      driver_lng: driver.lng,
      status: "accepted",
      otp: otp
});

res.json({
    message: "Accepted",
    whatsappLink: whatsappLink
});

console.log("OTP:", otp);
console.log("WhatsApp Link:", whatsappLink);

}catch(err){
    console.log(err);
    res.send("Error");
}
});

app.post("/verify-otp", async (req, res) => {
    try {
        const { order_id, otp } = req.body;

        const order = await Order.findById(order_id);

        if (!order) {
            return res.json({ success: false });
        }

          if (order.otp === String(otp))  {
            order.status = "completed";   // 🔥 MAIN FIX
            await order.save();

            res.json({ success: true });
        } else {
            res.json({ success: false });
        }

    } catch (err) {
        console.log(err);
        res.json({ success: false });
    }
});



// ================= UPDATE ORDER =================
app.put("/update_order/:id", async (req, res) => {
const { status } = req.body;
await Order.findByIdAndUpdate(req.params.id, { status });
res.send("Updated");
});

// ================= START SERVER =================
app.listen(5000, () => {
    console.log("Server running on 5000 🚀");
});
