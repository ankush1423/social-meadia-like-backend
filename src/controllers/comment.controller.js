import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Comment} from "../models/comment.model.js"
import mongoose from "mongoose"
import {Post} from "../models/post.model.js"

export const createComment = asyncHandler(async(req,res) => {
      const {content} = req.body
      const {postId} = req.params

      if(!content || !postId)
      {
         throw new ApiError(400,"error while getting the content and postId")
      }

      const post = await Post.findById(postId)
      if(!post)
      {
         throw new ApiError(400,"there is no post with this id")
      }
      
      const comment = await Comment.create(
        {
            post : postId,
            author : req.user?._id,
            content : content,
        }
      )
      const createdComment = await Comment.findById(comment._id).populate('author','username fullname profilePicture')

      if(!createdComment)
      {
         throw new ApiError(400,"error while creating the comment")
      }

      return res
             .status(200)
             .json(
                 new ApiResponse(
                     createdComment,
                     "comment created successFully"
                 )
             )
})

export const updateComment = asyncHandler(async(req,res) => {
     const {content} = req.body
     const {commentId} = req.params

     if(!content || !commentId)
     {
        throw new ApiError(400,"error while getting the content and commentId")
     }

     const updatedComment = await Comment.findByIdAndUpdate(
         commentId,
         {
            $set : {
                content : content
            }
         },
         {
            new : true
         }
     ).populate('author' , 'username fullname profilePicture')

     if(!updatedComment)
     {
        throw new ApiError(400,"eror while updating a comment")
     }

     return res
            .status(200)
            .json(
                new ApiResponse(
                    updatedComment,
                    "comment updated SuccessFully"
                )
            )
})

export const deleteComment = asyncHandler(async(req,res) => {
     const {commentId} = req.params

     if(!commentId)
     {
        throw new ApiError(400,"error while getting the commentId")
     }

     const deletedComment = await Comment.findByIdAndDelete(commentId)

     if(!deletedComment)
     {
        throw new ApiError(400,"error while deleting the comment")
     }

     return res
            .status(200)
            .json(
                new ApiResponse(
                    {},
                    "comment deleted SuccessFully"
                )
            )
})

export const getComment = asyncHandler(async(req,res) => {

     const {commentId} = req.params

     if(!commentId)
     {
        throw new ApiError(400,"error while getting the comment Id")
     }
     
     const comment = await Comment.findById(commentId).populate('author' , 'username fullname profilePicture')
     
     if(!comment)
     {
        throw new ApiError(400,"error while getting the comment")
     }

     return res
            .status(200)
            .json(
                new ApiResponse(
                     comment,
                     "comment find SuccessFully"
                )
            )
})



// Here are the ideas for all possible controllers you can write for your Comment model in a social media app:
// Basic CRUD Operations
// Create Comment: Add a new comment to a post.
// Update Comment: Edit an existing comment.
// Delete Comment: Remove a specific comment by ID.
// Get Comments for a Post: Retrieve all comments associated with a specific post.
// Get a Single Comment: Fetch a single comment by its ID.
// Advanced Features
// Reply to a Comment: Add a nested reply to a specific comment.
// Edit Reply: Update an existing reply to a comment.
// Delete Reply: Remove a specific reply to a comment.
// Engagement Features
// Like a Comment: Allow users to like a specific comment.
// Unlike a Comment: Remove a like from a specific comment.
// Get Comment Likes: Fetch all users who liked a specific comment.
// Moderation Features
// Flag Comment: Mark a comment as inappropriate or abusive.
// Approve Comment: Approve flagged comments after moderation.
// Ban User for Comment: Restrict a user from commenting due to repeated violations.
// Analytics Features
// Get Most Liked Comments: Fetch the most liked comments for a post or globally.
// Get Most Replied Comments: Retrieve comments with the most replies for a post or globally.
// Count Comments for a Post: Get the total number of comments for a specific post.
// Get User’s Comment Activity: Fetch all comments made by a specific user.
// Notification Features
// Notify Post Owner: Notify the post owner when a new comment is added.
// Notify Comment Mention: Notify a user if they are mentioned in a comment.
// Notify Comment Reply: Notify a user when someone replies to their comment.
// Miscellaneous Features
// Search Comments: Search for comments within a post using keywords.
// Pin Comment: Pin a specific comment to the top of the comment thread for a post.
// Highlight Comment: Mark a comment as "highlighted" by the post owner.
// Get Recent Comments: Fetch the most recent comments for a specific post.
// Follow-Up Enhancements
// Threaded Comments: Fetch all comments and their replies in a nested structure.
// Paginate Comments: Retrieve comments in paginated chunks for large posts.
// Filter Comments by User: Fetch all comments on a post made by a specific user.
// Sort Comments: Sort comments by likes, date, or relevance.

