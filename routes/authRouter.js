import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { login, register, getUser } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);

router.post("/register", register);

router.get("/verify-token",verifyToken, getUser)

export default router;
