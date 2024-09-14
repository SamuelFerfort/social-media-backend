import express from "express"
import verifyToken from "../middleware/verifyToken"
import controller from "../controllers/authController"

const router = express.Router()

router.use(verifyToken)

router.post("/", controller.createPost)




export default router