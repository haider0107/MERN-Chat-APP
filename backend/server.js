import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { Server } from "socket.io";

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

// Message routes
app.use("/api/message", messageRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Listen to port
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
  console.log("Port running on " + PORT);
});

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    // console.log(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room:" + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecived) => {
    let chat = newMessageRecived.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecived.sender._id) return;

      socket.in(user._id).emit("message recived", newMessageRecived);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});
