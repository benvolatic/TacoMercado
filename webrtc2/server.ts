import * as fs from "fs";
import * as https from "https";
import express from "express";
import { Server } from "socket.io";

const app = express();
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.send("<h1>WebRTC Signaling Server is running.</h1>");
});

// Load SSL Certificates
const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");
const server = https.createServer({ key, cert }, app);

// Setup WebSocket Server
const io = new Server(server, {
    cors: {
      origin: "*", // Allow all origins for Ngrok
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
    allowEIO3: true, // Enable legacy compatibility
  });

// Store connected users
const users: Record<string, string> = {};

// Handle WebRTC Signaling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle joining a room
  socket.on("join", (room) => {
    users[socket.id] = room;
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  // Handle Offer
  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", data);
  });

  // Handle Answer
  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", data);
  });

  // Handle ICE Candidate
  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", data);
  });

  // Handle Hang Up
  socket.on("hangup", (data) => {
    console.log(`🚫 Call ended in room: ${data.room}`);
    socket.to(data.room).emit("hangup");
  });

  // Handle Disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
    delete users[socket.id];
  });
});

// Start HTTPS Server
server.listen(8181, "0.0.0.0", () => {
  console.log("WebRTC signaling server running at https://localhost:8181");
});
