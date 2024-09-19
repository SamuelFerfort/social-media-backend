import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { getHomePosts, createPost } from "../controllers/postsController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getHomePosts);
router.post("/", createPost);

export default router;
