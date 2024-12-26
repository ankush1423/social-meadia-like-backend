import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true , limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import routes
import userRoutes from "./routes/user.routes.js"
import postRoutes from "./routes/post.routes.js"
import followRoutes from "./routes/follow.route.js"
import commentRoutes from "./routes/comment.route.js"

app.use("/api/v1/users",userRoutes)
app.use("/api/v1/posts",postRoutes)
app.use("/api/v1/follow",followRoutes)
app.use("/api/v1/comments",commentRoutes)

export {app}