import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv"

import authRouter from "./routes/authRouter.js"
import postsRouter from "./routes/postsRouter.js";
import commentRouter from "./routes/commentRouter.js";

dotenv.config()
const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json())

app.use("/users", authRouter);
app.use("/posts", postsRouter);
app.use("/comments", commentRouter)

app.use((_, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    const { status = 500, message = "Server error" } = err;
    res.status(status).json({ message });
});

export default app