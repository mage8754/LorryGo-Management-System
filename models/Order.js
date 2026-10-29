const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    customer_id: String,
    pickup: String,
    drop: String,
    load: String,
    weight: String,
    distance: String,
    status: String,
    lorry_type: String,

    // 🔥 CUSTOMER
    customer_name: String,
    customer_phone: String,

    // 🔥 DRIVER DETAILS
    driver_name: { type: String, default: "Not Assigned" },
    driver_phone: { type: String, default: "Not Available" },
    driver_vehicle: { type: String, default: "Not Assigned" },

    driver_id: String,   // 🔥 ADD THIS

    otp: { type: String },

    
    // 🔥 ADD THIS ONLY (IMPORTANT)
    driver_lat: Number,
    driver_lng: Number
});

module.exports = mongoose.model("Order", orderSchema);