import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  getHomePosts,
  createPost,
  likePost,
  bookmarkPost,
  repostPost,
  deletePost,
  getPostReplies,
  getUserPostsAndReposts
} from "../controllers/postsController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getHomePosts);
router.get("/:postId/replies", getPostReplies);
router.get("/user/:handler", getUserPostsAndReposts)



router.post("/", createPost);
router.post("/:postId/likes", likePost);
router.post("/:postId/reposts", repostPost);
router.post("/:postId/bookmarks", bookmarkPost);

router.delete("/:postId/delete", deletePost);



export default router;
