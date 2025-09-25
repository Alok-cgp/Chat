import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();
const server = http.createServer(app);

// --- Add Socket.IO ---
import { Server as SocketIOServer } from 'socket.io';
const io = new SocketIOServer(server, {
    cors: {
        origin: "*", // Adjust as needed for production
        methods: ["GET", "POST"]
    }
});

// Handle socket connections
const userSockets = new Map(); // userId -> Set of socketIds
const onlineUsers = new Set();

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User connected: ${userId}`);

    if (userId) {
        // Add socket to user's set
        if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
        }
        userSockets.get(userId).add(socket.id);

        // Add to online users
        onlineUsers.add(userId);

        // Emit updated online users to all clients
        io.emit('getOnlineUsers', Array.from(onlineUsers));
    }

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        if (userId && userSockets.has(userId)) {
            const sockets = userSockets.get(userId);
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                userSockets.delete(userId);
                onlineUsers.delete(userId);
                // Emit updated online users
                io.emit('getOnlineUsers', Array.from(onlineUsers));
            }
        }
    });
});

// CORS configuration for Vercel deployment
app.use(cors());

app.use(express.json({limit: "4mb"}));

app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default server;
