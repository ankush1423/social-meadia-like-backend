import express from "express"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import {
      createPost,
      getPost,
      getAllPosts,
      updatePost,
      deletePost,
      toggleLikePost,
      commentsOnPost
    } from "../controllers/post.controller.js"


const router = express.Router()

router.use(verifyJWT)

router.route("/create-post").post(verifyJWT,upload.single("media"),createPost)

router.route("/").get(getAllPosts)

router.route("/:postId").get(getPost).patch(updatePost).delete(deletePost)

router.route("/like-unlike/:postId").patch(toggleLikePost)

router.route("/comments/:postId").patch(commentsOnPost)

export default router