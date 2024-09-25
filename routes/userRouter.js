import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { editProfile , getAllUsers} from "../controllers/userController.js";

const router = express.Router();

router.use(verifyToken)

router.post("/edit", editProfile);
router.get("/", getAllUsers)


export default router;
