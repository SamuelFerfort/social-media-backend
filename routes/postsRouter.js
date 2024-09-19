import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  getHomePosts,
  createPost,
  likePost,
  bookmarkPost,
  repostPost,
} from "../controllers/postsController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getHomePosts);
router.post("/", createPost);
router.post("/:postId/likes", likePost);
router.post("/:postId/reposts", repostPost);
router.post("/:postId/bookmarks", bookmarkPost);

export default router;
