const express = require("express");
const { GuestModel } = require("../model/guest.model");

const guestRouter = express.Router();

guestRouter.get("/", async(req, res)=>{
    try {
        let data = await GuestModel.aggregate([{$sort : {checkin_date: 1}}]);
        res.send(data)
    } catch (error) {
        res.send({"msg": error.message})
    }
})

guestRouter.get("/:id", async(req, res)=>{
    try {
        let data = await GuestModel.aggregate([{$match: {_id: req.params.id}}])
        res.send(data)
    } catch (error) {
        res.send({"msg": error.message})
    }
})


guestRouter.post("/book", async(req, res)=>{
        const {guest_name, checkin_date, checkout_date, room_type} = req.body;
        const existingbookings = await GuestModel.find({room_type, $or: [
            {
                checkin_date: {$lt: checkout_date}, 
                checkout_date: {$gte: checkin_date}
            },{
                checkin_date: {$lte: checkin_date}, 
                checkout_date: {$gte: checkout_date}
            },{
                checkin_date: {$gte: checkin_date}, 
                checkout_date: {$lte: checkout_date}
            }
        ]}) 

        if(existingbookings.length==0){
            return res.status(400).send({"msg": "no rooms for this date"})
        }

        const numDays = Math.ceil((checkout_date-checkin_date) / (1000*60*60*24))
        const total_cost = 0;
        switch (room_type) {
            case "Standard":
                total_cost = numDays*1200;
                break;
            case "Premium":
                total_cost = numDays*2300;
                break
            case "Deluxe":
                total_cost = numDays*4650;
                break
            default:
                return res.json({"msg": "Invalid room type"})
        }

        let existingRoomNo = existingbookings.map(el=>el.room_number);
        let availableRoomNos = [];
        switch (room_type){
            case "Standard":
                availableRoomNos = [1,2,3];
                break;
            case "Premium":
                availableRoomNos = [4,5];
                break
            case "Deluxe":
                availableRoomNos= [6];
                break;
        }
        const room_number = availableRoomNos.find(roomNumber=> !existingRoomNo.includes(roomNumber))
        if(!room_number){
            return res.json({"msg": "room not available for given type and dates"})
        }

        const booking = new GuestModel({
            guest_name,
            checkin_date,
            checkout_date,
            room_type,
            room_number,
            total_cost
        })

        try {
            const newBooking = await booking.save();
            res.status(200).json(newBooking)
        } catch (error) {
            res.send({"msg": error.message})
        }
})

guestRouter.put("/:id", async(req, res)=>{
    try {
        let data = await GuestModel.findByIdAndUpdate(req.params.id, req.body)
        res.send(data)
    } catch (error) {
        res.send({"msg": error.message})
    }
})

guestRouter.delete("/:id", async(req, res)=>{
    try {
        let data = await GuestModel.deleteOne( { _id: req.params.id } )
        res.send("deleted successfully")
    } catch (error) {
        res.send({"msg": error.message})
    }
})

guestRouter.get("/bookings/date-range", async(req, res)=>{
    try {
        const {checkin_date, checkout_date} = req.query
        const bookingslist = await GuestModel.find({
            checkin_date: {$gte: new Date(checkin_date), $lte: new Date(checkout_date)}
        })
        res.json(bookingslist)
    res.json(totalEarnings[0].earnings)
    } catch (error) {
        res.send({"msg": error.message})
    }
})

guestRouter.get("/earnings/date-range", async(req, res)=>{
    try {
        const {checkin_date, checkout_date} = req.query
        const totalEarnings = await GuestModel.aggregate([{
            $match: {
                checkin_date: {$gte: new Date(checkin_date), $lte: new Date(checkout_date)}
            },
        },{
            $group: {
                _id: null,
                earnings: {$sum: "$total_cost"}
            }
        }
    ])
    res.json(totalEarnings[0].earnings)
    } catch (error) {
        res.send({"msg": error.message})
    }
})


module.exports = {guestRouter}