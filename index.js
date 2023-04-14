const express = require("express");
const { connection } = require("./db");
const { guestRouter } = require("./routes/guest.router");

const app = express();

app.get("/", (req, res)=>{
    res.send("hello world")
})

app.use(express.json());
app.use("/guests", guestRouter)


app.listen(7900, async ()=>{
    try {
        connection
        console.log("connection established")
        console.log("connected to 7900")
    } catch (error) {
        console.log(error)
    }
})