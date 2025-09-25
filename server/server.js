import express from 'express';
import "dotenv/config";
import cors from 'cors';
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app)

export const io = new Server(server, {
    cors: {origin: "*"}
})

export const userSocketMap = {};


io.on("connection", (socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId, "Socket ID:", socket.id);

    if(userId) userSocketMap[userId] = socket.id;

    const onlineUsers = Object.keys(userSocketMap);
    console.log("Current online users:", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId, "Socket ID:", socket.id);
        delete userSocketMap[userId];
        const updatedOnlineUsers = Object.keys(userSocketMap);
        console.log("Updated online users:", updatedOnlineUsers);
        io.emit("getOnlineUsers", updatedOnlineUsers)

    })

})

app.use(express.json({limit: "4mb"}));
app.use(cors());

app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);


await connectDB();


const PORT = process.env.PORT || 5001;
server.listen(PORT, ()=> console.log("Server is running on PORT: "+ PORT)
);
