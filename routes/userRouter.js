import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  editProfile,
  getAllUsers,
  getNotifications,
  toggleFollow,
  markAllNotifications,
} from "../controllers/userController.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAllUsers);
router.get("/notifications", getNotifications);
router.post("/notifications", markAllNotifications);

router.post("/:userId/follow", toggleFollow);
router.post("/edit", editProfile);

export default router;
