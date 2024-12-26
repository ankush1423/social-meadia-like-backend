import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {
         createComment,
         updateComment,
         deleteComment,
         getComment
     } from "../controllers/comment.controller.js"

const router = express.Router()

router.use(verifyJWT)

router.route("/create-comment/:postId").post(createComment)

router.route("/u/comment/:commentId").post(updateComment).delete(deleteComment)

router.route("/comment").get(getComment)

export default router