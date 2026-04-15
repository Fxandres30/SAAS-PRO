import express from "express"
import { registrarUser, loginUser } from "../controllers/authController.js"

const router = express.Router()

router.post("/register", registrarUser)
router.post("/login", loginUser)

export default router