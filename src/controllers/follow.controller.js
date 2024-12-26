import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {Follow} from "../models/follow.model.js"
import mongoose from "mongoose"
import { User } from "../models/user.model.js"

export const followUser = asyncHandler(async(req,res) => {
      const {userId} = req.params

      if(!userId)
      {
         throw new ApiError(400,"error while getting the user Id")
      }
    //   console.log(userId === req.user?._id)
      if(userId.toString() === req.user?._id.toString())
      {
         throw new ApiError(400,"user cannot follow itself")
      }

      const existedDocument = await Follow.findOne({follower : req.user?._id, following : userId})
      
      if(existedDocument)
      {
         throw new ApiError(400,"duplicate document")
      }
      const followDocument = await Follow.create(
        {
            follower : req.user?._id,
            following : userId
        }
      )

      if(!followDocument)
      {
         throw new ApiError(400,"error while crating the user")
      }

      return res 
             .status(200)
             .json(
                new ApiResponse(
                     followDocument,
                     "user follow successFully"
                )
             )
})

export const unfollowUser = asyncHandler(async(req,res) => {
     const {userId} = req.params

     if(!userId)
     {
        throw new ApiError(400,"error while getting the user Id")
     }
     const exsistedDocument = await Follow.findOne({follower : req.user?._id , following : userId})
     if(!exsistedDocument)
     {
        return res
               .status(200)
               .json(
                  new ApiResponse(
                     {},
                     "alredy unfollow by the user"
                  )
               )
     }
     const deletedDocument = await Follow.findOneAndDelete({follower : req.user?._id , following : userId})
     if(!deletedDocument)
     {
        throw new ApiError(400,"error while unfollow the user")
     }

     return res
            .status(200)
            .json(
                new ApiResponse(
                    {},
                    "user unfollow SuccessFully"
                )
            )
})

export const getFollowers = asyncHandler(async(req,res) => {
      const {userId} = req.params

      if(!userId)
      {
          throw new ApiError(400,"error while getting the userId")
      }

      const followers = await Follow.find({following : userId}).populate('follower' , 'username email profilePicture fullname')

      if(!followers)
      {
         throw new ApiError(400,"error while getting the followers")
      }

      return res
             .status(200)
             .json(
                 new ApiResponse(
                     followers,
                     "follwers find successFully"
                 )
             )
})

export const getFollowing = asyncHandler(async(req,res) => {
      const {userId} = req.params

      if(!userId)
      {
         throw new ApiError(400,"error while getting the Id")
      }

      const following = await Follow.find({follower : userId}).populate('following' , 'username email profilePicture fullname')

      if(!following)
      {
         throw new ApiError(400,"error while getting the following")
      }

      
})



// Here’s a list of potential controllers you can write for the Follow model in your social media application:

// Core Controllers
// followUser: Allow a user to follow another user.          //complete
// unfollowUser: Allow a user to unfollow another user.      //complete
// getFollowers: Fetch the list of users who are following a specific user.  //complete
// getFollowing: Fetch the list of users that a specific user is following.  //complete
// Advanced Controllers
// getMutualFollowers: Retrieve the list of mutual followers between two users.
// checkFollowStatus: Check if a user is following another user.
// getFollowerCount: Get the total count of followers for a user.
// getFollowingCount: Get the total count of users that a user is following.
// Feed and Recommendations
// getFollowingPosts: Fetch recent posts from users that the current user is following.
// suggestUsersToFollow: Recommend users to follow based on interests, mutual connections, or popularity.
// Request-Based Follow System (for private accounts)
// sendFollowRequest: Send a follow request to a user with a private account.
// approveFollowRequest: Approve a follow request received by a private account.
// rejectFollowRequest: Reject a follow request received by a private account.
// getPendingFollowRequests: Retrieve the list of pending follow requests for a private account.
// Moderation and Blocking
// blockFollower: Allow a user to block one of their followers.
// unblockFollower: Allow a user to unblock a previously blocked follower.
// getBlockedUsers: Fetch the list of users blocked by the current user.
// Analytics and Insights
// getTopFollowers: Fetch followers sorted by engagement (likes, comments, shares).
// getFollowerGrowthStats: Analyze follower growth over a specific period.
// getFollowingEngagementStats: Analyze engagement with posts of users being followed.
// Event-Based Notifications
// notifyFollowAction: Send a notification when a user is followed.
// notifyFollowRequest: Send a notification for pending follow requests (for private accounts).
// Integration with Other Models
// syncFollowWithFeed: Automatically update the follower’s feed when they follow a new user.
// syncUnfollowWithFeed: Remove a user’s posts from the follower’s feed when they unfollow them.