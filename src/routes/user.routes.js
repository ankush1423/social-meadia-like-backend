import express from "express"
import {
         userRegister,
         loginUser,
         logoutUser,
         changeCurrentPassword,
         getCurentUser,
         updateAccountDetails,
         updateProfilePicture,
         getUserChannelProfile
        } from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const router = express.Router()

router.route("/register").post(upload.single("profilePicture"),userRegister)

router.route("/login").post(loginUser)

router.route("/logout").post(verifyJWT,logoutUser)

router.route("/u/update-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurentUser)

router.route("/u/update-account-details").patch(verifyJWT,updateAccountDetails)

router.route("/u/update-profile-picture").post(verifyJWT,upload.single("profilePicture"),updateProfilePicture)

router.route("/user-profile").get(verifyJWT,getUserChannelProfile)

export default router




