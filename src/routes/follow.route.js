import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {
          followUser,
          unfollowUser,
          getFollowers,
          getFollowing,
      } from "../controllers/follow.controller.js"


const router = express.Router()

router.use(verifyJWT)

router.route("/user-follow/:userId").post(followUser)

router.route("/user-unfollow/:userId").post(unfollowUser)

router.route("/user-followers/:userId").get(getFollowers)

router.route("/user-following/:userId").get(getFollowing)

export default router;