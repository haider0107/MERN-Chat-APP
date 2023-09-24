import express from "express";
// import chats from "./data/data.js";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
dotenv.config();
connectDB();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: "This is / route...." });
});

app.use('/api/user',userRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Port running on " + PORT);
});
