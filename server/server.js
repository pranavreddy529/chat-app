import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoute.js";
import messageRouter from "./routes/messageRoute.js";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Middleware setup
app.use(cookieParser());

// CORS setup to allow frontend requests from Vite (port 5173)
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true,               // allow cookies/auth headers
}));

// Body parsers with increased limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Socket.io server setup
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Online users map
export const userSocketMap = {}; // { userId: socketId }

// Socket.io connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User Connected", userId);

  if (userId) userSocketMap[userId] = socket.id;

  // Emit online users list
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Connect to MongoDB
await connectDB();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
