const mongoose = require("mongoose");

const guestSchema = mongoose.Schema({
    guest_name: {type: String, required: true},
    checkin_date: {type: Date, required: true},
    checkout_date: {type: Date, required: true},
    room_type: {type: String, required: true},
    room_number : Number,
    total_cost: Number
    // members: Number
})

const GuestModel = mongoose.model("guest", guestSchema);

module.exports = {GuestModel}