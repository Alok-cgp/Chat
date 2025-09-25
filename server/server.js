import express from 'express';
import "dotenv/config";
import cors from 'cors';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';

const app = express();

// CORS configuration for Vercel deployment
app.use(cors({
    origin: "https://chat-app-five-drab-54.vercel.app",
    credentials: true
}));

app.use(express.json({limit: "4mb"}));

app.use("/api/status", (req,res)=> res.send("Server is live"));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

await connectDB();

export default app;
