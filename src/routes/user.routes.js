import express from "express"
import {
         userRegister,
         loginUser 
        } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = express.Router()

router.route("/register").post(upload.single("profilePicture"),userRegister)

router.route("/login").post(loginUser)

export default router




