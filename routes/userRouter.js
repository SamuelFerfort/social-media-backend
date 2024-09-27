import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { editProfile , getAllUsers, toggleFollow} from "../controllers/userController.js";

const router = express.Router();

router.use(verifyToken)

router.post("/edit", editProfile);
router.get("/", getAllUsers)

router.post("/:userId/follow", toggleFollow)


export default router;
