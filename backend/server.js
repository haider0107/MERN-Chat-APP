import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js"
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

const app = express();
dotenv.config();
connectDB();

// TO accept data in the form of JSON
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({ success: "This is / route...." });
});

// User Routes
app.use("/api/user", userRoutes);

// Chat routes
app.use("/api/chat", chatRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Listen to port
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log("Port running on " + PORT);
});
