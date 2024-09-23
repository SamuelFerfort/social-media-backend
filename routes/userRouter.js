import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { editProfile } from "../controllers/userController.js";

const router = express.Router();

router.use(verifyToken)

router.post("/edit", editProfile);



export default router;
