import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getPosts, createPost } from "../controllers/postsController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getPosts);
router.post("/", createPost);

export default router;
