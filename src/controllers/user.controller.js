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
     
     if(!(username || email) || !password)
     {
        throw new ApiError(400,"both credentials are required")
     }

     const user = await User.findOne({$or : [{username},{email}]})

     if(!user)
     {
        throw new ApiError(400,"error while getting the user")
     }

     const isPasswordCorrect = user.isPasswordCorrect(password)

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