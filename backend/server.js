import express from "express";
import chats from "./data/data.js";
import dotenv from "dotenv"

const app = express();
dotenv.config();

app.use(express.json());

app.get("/",(req,res) => {
    res.status(200).json({success:"This is / route...."})
})

app.get("/api/chat", (req,res) => {
    res.status(200).json({success:"Send data successfully",chats})
})

app.get("/api/chat/:id", (req,res) => {
    let element = chats.find((ele) => ele._id === req.params.id )

    res.status(200).json({success:"Id data send ... ",element})
})


const PORT = process.env.PORT
app.listen(PORT,() => {
    console.log("Port running on " + PORT);
})