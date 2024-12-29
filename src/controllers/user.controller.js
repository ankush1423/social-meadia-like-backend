import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


const generateAccessRefreshToken = async function(userId){
      try 
      {
         const user = await User.findById(userId)
         if(!user)
         {
            throw new ApiError(400,"error while gitting the user")
         }
         const accesstoken = await user.generateAccessToken()
         const refreshtoken = await user.generateRefreshToken()

         user.refreshtoken = refreshtoken
         await user.save({validateBeforeSave : false})

         return {accesstoken , refreshtoken}
      } 
      catch (error) 
      {
         console.log(error)
      }
}

export const userRegister = asyncHandler(async(req,res) => {
      const {
              username,
              email,
              fullname,
              password,
              profilePicture,
              bio
           } = req.body
      if(
         [username,email,password,fullname].some(feild => feild?.trim() === "")
      ){
           throw new ApiError(400,"all feilds are mandatry")
      }
       
      const profilePath = req.file?.path 
      const profileRefrence = await uploadOnCloudinary(profilePath)
     
      const user = await User.create({
           username,
           email,
           password,
           fullname,
           profilePicture : profileRefrence?.url || "",
           bio : bio || ""
      }) 
      
      const createdUser = await User.findById(user._id).select("-password -refreshtoken")

      if(!createdUser)
      {
         throw new ApiError(400,"error while creating a user")
      }

      return res
             .status(200)
             .json(
                new ApiResponse(
                    createdUser,
                    "user register  successfully"
                )
             )
})

export const loginUser = asyncHandler(async(req,res) => {
     const {username , email , password} = req.body
     
     if(!username || !email || !password)
     {
        throw new ApiError(400,"both credentials are required")
     }

     const user = await User.findOne({$and : [{username},{email}]})

     if(!user)
     {
        throw new ApiError(400,"error while getting the user")
     }

     const isPasswordCorrect = await user.isPasswordCorrect(password)

     if(!isPasswordCorrect)
     {
        throw new ApiError(400,"please provide the correct password")
     }
     
     const {accesstoken , refreshtoken} = await generateAccessRefreshToken(user._id)

     const loginuser = await User.findById(user._id).select("-password -refreshtoken")
     
     const options = {
         httpOnly : true,
         secure : true
     }

     return res
            .status(200)
            .cookie("accesstoken",accesstoken,options)
            .cookie("refreshtoken",refreshtoken,options)
            .json(
                new ApiResponse(
                    loginuser,
                    "user loggedIn SuccessFully"
                )
            )
})

export const logoutUser = asyncHandler(async(req,res) => {
      await User.findByIdAndUpdate(
          req.user?._id,
          {
             $unset : {
               refreshtoken : 1
             }
          },
          {
             new : true 
          }
      )
      
      const options = {
          httpOnly : true,
          secure : true
      }

      return res 
             .status(200)
             .clearCookie("accesstoken",options)
             .clearCookie("refreshtoken",options)
             .json(
                new ApiResponse(
                   {},
                   "user loggedOut SuccessFully"
                )
             )
})

export const refreshAccessToken = asyncHandler(async(req,res) => {
       const incomingRefreshToken = req.cookies?.refreshtoken || req.body.refreshToken

       if(!incomingRefreshToken)
       {
           throw new ApiError(400,"unauthraised request")
       }

       try 
       {
           const decodedToken = await jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

           const user = await User.findById(decodedToken._id)

           if(!user)
           {
               throw new ApiError(400,"invalis token")
           }

           if(incomingRefreshToken !== user?.refreshtoken)
           {
               throw new ApiError(400,"token already used")
           }

           const {accesstoken , refreshtoken} = await generateAccessRefreshToken(user._id)

           const options = {
               httpOnly : true,
               secure : true
           }

           return res
                  .status(200)
                  .cookie("accesstoken",accesstoken,options)
                  .cookie("refreshtoken",refreshtoken,options)
                  .json(
                      new ApiResponse(
                        {},
                        "refresh access token successFully"
                      )
                  )
       } 
       catch (error) 
       {
          console.log("error while refresh the access token ",error)
       }
})

export const changeCurrentPassword = asyncHandler(async(req,res) => {
        const {oldPassword , newPassword} = req.body

        if(!oldPassword || !newPassword)
        {
            throw new ApiError(400,"both feilds are mandatary")
        }
         
        const user = await User.findById(req.user?._id)
        if(!user)
        {
            throw new ApiError(400,"error while getting the user")
        }
        const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
        if(!isPasswordCorrect)
        {
           throw new ApiError(400,"please provide the coorect password")
        }

        user.password = newPassword
        await user.save({validateBeforeSave : false})

        return res
               .status(200)
               .json(
                   new ApiResponse(
                       {},
                       "password updated successfully"
                   )
               )
})

export const getCurentUser = asyncHandler(async(req,res) => {
      return res
            .status(200)
            .json(
                new ApiResponse(
                    req.user,
                    "user find successfully"
                )
            )
})

export const updateAccountDetails = asyncHandler(async(req,res) => {
     const {fullname , email ,bio} = req.body

     if(!fullname || !email || !bio)
     {
        throw new ApiError(400,"both feilds are mandatory")
     }

     const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          {
             $set : {
                fullname,
                email,
                bio
             }
          },
          {
             new : true
          }
     ).select("-password -refreshtoken")

     if(!updatedUser)
     {
        throw new ApiError(400,"error while updating the detail")
     }

     return res
            .status(200)
            .json(
               new ApiResponse(
                   updatedUser,
                   "userupdated SuccessFully"
               )
            )
})

export const updateProfilePicture = asyncHandler(async(req,res) => {
     const profilePath = req.file?.path

     if(!profilePath)
     {
        throw new ApiError(400,"error while getting the proflePath")
     }

     const profileRefrence = await uploadOnCloudinary(profilePath)
      
     if(!profileRefrence)
     {
        throw new ApiError(400,"error while getting profile Refrence")
     }
     
     const updatedUser = await User.findByIdAndUpdate(
          req.user?._id,
          {
             $set : {
               profilePicture : profileRefrence?.url
             }
          },
          {
             new : true
          }
     ).select("-password -refreshtoken")

     if(!updatedUser)
     {
        throw new ApiError(400,"error while update the profile Picture")
     }

     return res
            .status(200)
            .json(
               new ApiResponse(
                  updatedUser,
                  "user profile picture updated successFully"
               )
            )
})

export const getUserChannelProfile = asyncHandler(async(req,res) => {
     const {username} = req.body

     if(!username?.trim())
     {
         throw new ApiError(400,"error while getting the username")
     }

     const user = await User.aggregate([
         {
            $match : {
                username : username.toLowerCase()
            }
         },
         {
            $lookup : {
                from : "follows",
                localField : "_id",
                foreignField : "following",
                as : "followers",
            },
         },
         {
           addFields : {
             followers : {
                $size : "$followers"
             }
           }
         },
         {
            $lookup : {
                from : "follows",
                localField : "_id",
                foreignField : "follower",
                as : "following",
            }
         },
         {
            $addFields : {
               following : {
                  $size : "$following"
               }
            }
         },
         {
            $lookup : {
               from : "posts",
               localField : "_id",
               foreignField : "author",
               as : "posts"
            }
         },
         {
            $project : {
                username : 1,
                email : 1,
                fullname : 1,
                followers : 1,
                following : 1,
                posts : 1,
                isVerified : 1
            }
         }
     ])

     if(!user)
     {
        throw new ApiError(400,"error while finding the user")
     }

     return res 
            .status(200)
            .json(
               new ApiResponse(
                  user,
                  "user profile found successFully"
               )
            )
})

export const getFollowers = asyncHandler(async(req,res) => {
   
})
// task to complete 
// getFollowers: Fetch the list of users who are following a specific user.
// getFollowing: Fetch the list of users that a specific user is following.
