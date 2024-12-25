import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Post} from "../models/post.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import mongoose from "mongoose"

export const createPost = asyncHandler(async(req,res) => {
       const {
         content,
         hashtags,
         location,
         visibility,
       } = req.body

       if(!content)
       {
          throw new ApiError(400,"content is required feild")
       }
       const mediaPath = req.file?.path 
       if(!mediaPath)
       {
          throw new ApiError(400,"error while getting the media path")
       }

       const mediaRefrence = await uploadOnCloudinary(mediaPath)
       if(!mediaRefrence)
       {
          throw new ApiError(400,"error while getting the media refrence")
       }
      
       const post = await Post.create(
         {
            author : new mongoose.Types.ObjectId(req.user?._id),
            content : content,
            media  : [
               { 
                  url :  mediaRefrence?.url || "",
                  type : mediaRefrence?.resource_type || ""
               }
            ],
            hashtags : hashtags,
            location : location,
            visibility :visibility
         }
       )

       if(!post)
       {
          throw new ApiError(400,"error while creating the post")
       }

       return res
              .status(200)
              .json(
                  new ApiResponse(
                      post,
                      "post created SuccessFully"
                  )
              )
})

export const getPost = asyncHandler(async(req,res) => {
     const {postId} = req.params

     if(!postId)
     {
        throw new ApiError(400,"error while getting the postId")
     }

     const post = await Post.findById(postId).select("-shares -visibility")

     if(!post)
     {
        throw new ApiError(400,"error while getting the post")
     }

     return res
            .status(200)
            .json(
                new ApiResponse(
                    post,
                    "post find SuccessFully"
                )
            )
})

export const  getAllPosts = asyncHandler(async(req,res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query

    const filter = {}
    const pageNumber = parseInt(page,10)
    const limitNumber = parseInt(limit,10)

    if(query)
    {
        filter.content = {$regex : query , $options : "i"}
    }

    if(userId)
    {
        filter.auther = userId
    }

    const sortOrder = sortType.toLowerCase() === 'asc' ? 1 : -1
    const sortOptions = {[sortBy] : sortOrder}

    const posts = await Post.find(filter).sort(sortOptions).skip((pageNumber-1)*limitNumber).limit(limitNumber)

    if(!posts)
    {
        throw new ApiError(400,"error while gettingthe posts")
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                posts,
                "posts find successFully"
              )
           )
})

export const updatePost = asyncHandler(async(req,res) => {
     const {
        content,
        visibility,
        location,
        hashtags,
     } = req.body

     const {postId} = req.params

     if(
        [content,visibility,location,hashtags].some(feild => feild?.trim() === "")
     ){
        throw new ApiError(400,"all feilds are required")
     }

     const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
            $set : {
                content,
                visibility,
                location,
                hashtags
            }
        },
        {
            new : true
        }
     ).select("-visibility -shares")

     if(!updatedPost)
     {
        throw new ApiError(400,"error while updating the posts")
     }

     return res
           .status(200)
           .json(
              new ApiResponse(
                 updatedPost,
                 "post updated successFully"
              )
           )
})

export const deletePost = asyncHandler(async(req,res) => {
     const {postId} = req.params
     if(!postId)
     {
        throw new ApiError(400,"error while getting the postId")
     }

     const deletedPost = await Post.findByIdAndDelete(postId)

     if(!deletedPost)
     {
        throw new ApiError(400,"error while deleting the post")
     }

     return res
           .status(200)
           .json(
              new ApiResponse(
                 {},
                 "post deleted SuccessFully"
              )
           )
})

export const toggleLikePost = asyncHandler(async(req,res) => {
     const {postId} = req.params

     if(!postId)
     {
        throw new ApiError(400,"error while getting the postId")
     }

    const post = await Post.findById(postId)

    if(!post)
    {
        throw new ApiError(400,"error while finding the post")
    }
    let message;
    if(post.likes.includes(req.user?._id))
    {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $pull : {
                    likes : new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                new : true
            }
        )
        if(!post)
        {
            throw new ApiError(400,"error while dislike the post")
        }
        message = "dislike the post SuccessFully"
    }
    else
    {
        const post = await Post.findByIdAndUpdate(
            postId,
            {
                $addToSet : {
                    likes : new mongoose.Types.ObjectId(req.user?._id)
                }
            },
            {
                new : true
            }
        )

        if(!post)
        {
            throw new ApiError(400,"error while liking the video")
        }

        message = "user like the video successFully"
    }

    return res
           .status(200)
           .json(
              new ApiResponse(
                 {},
                 message
              )
           )
})


//complete it later
export const commentsOnPost = asyncHandler(async(req,res) => {
     const {postId} = req.params
       
})

//complete it later
export const getFollowingPosts = asyncHandler(async(req,res) => {

})

// complete it later 
export const getPostLikes = asyncHandler(async(req,res) => {
     // get All Users who liked the video
})

// future controllers to write
// savePost: Add a post to the user’s saved list (e.g., bookmarking functionality).
// unsavePost: Remove a post from the user’s saved list.
// getSavedPosts: Fetch posts that the user has saved.
// pinPostToProfile: Pin a post to the top of a user’s profile page.
// unpinPostFromProfile: Remove a pinned post from the user’s profile.
// tagUsersInPost: Add user tags to a post and notify them.
// removeUserTagFromPost: Remove a user tag from a post.
// reactToPost: Add reactions (beyond likes) like emojis (e.g., love, laugh, sad).
// getPostReactions: Fetch all reactions on a post, grouped by type.
// restrictPostComments: Allow the post author to enable/disable comments for the post.
// highlightPost: Mark a post as highlighted (for featured content).
// syncPostWithFollowersFeed: Automatically add a new post to the feeds of all followers.
// notifyTaggedUsers: Send notifications to users tagged in a post.
// fetchPostWithComments: Retrieve a post along with its nested comments and associated user data.
