const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,

    // 🔥 DRIVER DETAILS
    vehicle: String,
    phone: String,   // ✅ comma added

    // 📍 MAP LOCATION
    lat: Number,
    lng: Number
});

module.exports = mongoose.model("User", userSchema);