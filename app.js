import express from "express";
import logger from "morgan";
import "dotenv/config";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";

const app = express();

app.use(logger("dev"));
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 1000,  
  standardHeaders: true,  
  legacyHeaders: false,  
  message: 'Too many requests, please try again later.',
});
app.use("/api", limiter);

import authRouter from "./routes/authRouter.js";
import postsRouter from "./routes/postsRouter.js";

app.use("/api/auth", authRouter);
app.use("/api/post", postsRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message:
      process.env.NODE_ENV === "production" ? "Something broke!" : err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
});
const PORT = process.env.PORT || "3000";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
