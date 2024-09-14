import express from "express";
import logger from "morgan";
import "dotenv/config";
import cors from "cors";
import authRouter from "./routes/authRouter";
import postsRouter from "./routes/postsRouter"

const app = express();

app.use(logger("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use("/auth", authRouter);
app.use("/post", postsRouter);


const PORT = process.env.PORT || "3000";

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
